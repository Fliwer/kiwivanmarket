# Audit backend et paiements — 15 octobre 2026

## Périmètre et conclusion

Revue de tous les 32 exports de `functions/index.js`, de `boostService.js`, `paymentSecurity.js`, `abuseProtection.js` et `lifecycleToken.js`, puis tests locaux des handlers réels avec une base synthétique et un fournisseur email simulé. Aucune transaction Stripe, écriture de production, suppression de donnée, modification de secret ou modification IAM n'a été effectuée par cette sous-revue.

Le paiement des boosts dispose de protections cohérentes : prix et durée fixés côté serveur, propriétaire et email vérifié contrôlés, test réservé aux administrateurs, paiement réel soumis à une activation explicite, correspondance exacte des sessions payées, activation transactionnelle et idempotente, expiration sur les vues et remboursements/litiges couverts par plusieurs tests. Cette revue n'a pas démontré de moyen de créer un boost réel gratuit, de changer le bénéficiaire d'un paiement de boost ou de prendre le compte Stripe d'un autre vendeur. Cela ne constitue pas une garantie d'absence de faille.

Des défauts de disponibilité, de notifications et de modération ont été reproduits. Les corrections ci-dessous sont présentes dans le code local. Leur publication et la vérification en production relèvent du bilan principal ; ce document seul ne confirme pas un déploiement.

## Constats reproduits et corrections locales

| ID | Priorité | Preuve avant correction | Correction et référence actuelle |
|---|---|---|---|
| B01 | Haute | 20 créations de conversations pour le même acheteur et la même annonce déclenchaient 20 emails. 20 messages concurrents dans une conversation déclenchaient aussi 20 emails malgré le délai annoncé de 30 minutes. Les timestamps étaient vérifiés avant envoi et écrits après, sans réservation transactionnelle. | `functions/emailDelivery.js:9` réserve le budget, le reçu d'événement et le délai destinataire dans une transaction. `functions/index.js:153` et `:296` l'utilisent. Les 11 chemins d'envoi Resend partagent le plafond. Tests : 20 demandes concurrentes donnent un seul email et les doublons d'événements ne renvoient pas le message. |
| B02 | Haute | Un ancien lien de disponibilité avec un jeton privé encore valide permettait de confirmer une annonce passée depuis à `hidden`, `rejected` ou `deleted`, puis la remettait à `active`. Le jeton autorisait donc le contournement de la modération. | `functions/lifecycleToken.js:62` relit annonce et jeton dans la même transaction et refuse ces états. `functions/boostService.js:48` applique la même règle au callable vendeur ; l'administrateur conserve son accès explicite. Tests sur chaque état. |
| B03 | Moyenne | `listingAction` modifiait l'annonce sur un GET de lien email. Un scanner ou une prévisualisation de lien disposant de l'URL pouvait ainsi confirmer ou marquer vendu sans choix explicite du vendeur. | `functions/index.js:2058` affiche un formulaire sur GET et ne modifie qu'après POST avec les champs du corps, en revérifiant le jeton et la modération. Autres méthodes : 405. Réponse sans cache, sans référent, non indexable, CSP interdisant les frames et limitant les formulaires à la même origine. Tests GET sans écriture, POST valide, corps absent, modération et méthode refusée. |
| B04 | Moyenne | Le scheduler pouvait lire une annonce sans boost, puis un achat activait un boost pendant sa lecture du contact, puis le scheduler mettait quand même l'annonce en pause depuis son ancien snapshot. Reproduction locale : `boostState=active` et `status=paused`. | `functions/lifecycleToken.js:47` relit le van dans la transaction de mise en pause. Un boost actif ou une confirmation récente empêche la transition. Test sur le handler réel avec achat simulé après la requête initiale. |
| B05 | Moyenne | Resend renvoie les erreurs sous forme `{ error }`. Les rappels de disponibilité ignoraient ce retour et marquaient quand même le rappel envoyé, démarrant le compte à rebours de pause sans email livré. | `functions/index.js:2036` et le dernier rappel vérifient le retour. Le marquage du rappel relit l'état courant et ne suit que la réussite. Test fournisseur en échec et annonce toujours active 31 jours après. Une pause déjà due reste possible quand le budget email est atteint. |
| B06 | Moyenne | `finalNoticeSentAt` n'était jamais réinitialisé. Après une première confirmation, un vendeur ne recevait plus de dernier rappel lors des cycles suivants. | Remise à zéro à la confirmation par callable, lien email, activation de boost et nouveau cycle de rappel. Test de deux cycles successifs et d'échec du dernier rappel. |
| B07 | Moyenne | Le mécanisme évitant le premier message déjà notifié ignorait aussi la première réponse du vendeur à l'acheteur si `lastEmailNotification` était absent. | La condition porte maintenant sur le premier message de l'acheteur uniquement (`functions/index.js:259`). Test de notification de la première réponse vendeur. |

### Budget et idempotence email

Le nouveau budget partagé limite les **tentatives** Resend à 80 par jour UTC et 40 par heure. Les notifications de conversations/messages ajoutent 10 tentatives par expéditeur et par heure et un délai de 30 minutes par adresse destinataire. Les réservations stockent des identifiants hachés, des compteurs et des dates, sans adresse email ni corps de message. Les échecs fournisseur restent imputés au budget ; le délai destinataire est libéré sur échec pour permettre une notification ultérieure.

Ces valeurs protègent le coût et le quota du service actuel. Elles peuvent limiter des notifications légitimes lors d'un pic ; elles doivent être adaptées au plan email et au trafic réel. Elles ne limitent ni les paiements, ni les écritures Firestore des clients, ni l'ensemble des dépenses Google Cloud. Un acteur peut encore provoquer du travail serveur même lorsque ses emails sont bloqués.

Chaque envoi reçoit un `Idempotency-Key` stable. Le SDK Resend v2 installé transmet ce header via ses options HTTP ; un test avec le vrai SDK, sans réseau, vérifie que l'authentification est préservée et que le client partagé n'est pas modifié. Un reçu transactionnel conserve le succès ; une réservation en cours a un bail de deux minutes. La rétention des clés d'idempotence du prestataire reste finie. Il n'y a pas de file de livraison garantissant une reprise automatique après tout crash ou quota : un email peut rester non livré et la surveillance opérationnelle reste nécessaire.

Les champs `expiresAt` sont prêts pour une politique TTL (compteurs trois jours, reçus trente jours). Le contrôle infrastructure du bilan principal confirme qu'aucune politique TTL n'est configurée pour ces collections. Aucune purge ou activation de suppression automatique n'a été effectuée : l'accord du propriétaire reste requis. Les règles doivent refuser tout accès client à `securityEmailDeliveries`.

## Points ouverts et ancien code conservé

| Priorité | Point ouvert | Impact et suite proposée |
|---|---|---|
| Moyenne | `createAlert` active immédiatement une adresse email non vérifiée (`functions/index.js:2215`). | Une personne peut inscrire un tiers à des alertes. Quotas par IP/compte/adresse et budget partagé limitent l'envoi mais ne prouvent pas le consentement. Ajouter un double opt-in avant l'activation, puis tester le parcours et les anciens abonnements. Non modifié dans ce lot. |
| Moyenne | Ancien module Connect/acompte toujours exporté (`createStripeConnectAccount`, `createCheckoutSession`, réservations). | La création Connect et les nouveaux Checkout d'acompte refusent une clé live. Ils restent utilisables avec une clé test par des comptes vérifiés, sans restriction administrateur. Les sessions et remboursements historiques ne sont pas supprimés. Faire décider le retrait de ces exports et des écrans correspondants par le propriétaire. Ne pas réactiver des acomptes sans réservation exclusive et gestion transactionnelle de toutes les transitions. |
| Moyenne | `confirmReservation` et `cancelReservation` ne sérialisent pas leur transition complète (`functions/index.js:1610`, `:1644`). | Les lectures et écritures finales peuvent se chevaucher avec un remboursement/une annulation. Le risque avait déjà été identifié pour l'ancien parcours d'acompte dans l'audit du 12 octobre. Aucune charge réelle de ce parcours n'a été déclenchée ici. Fonctionnalité conservée et nouveaux Checkout live bloqués. |
| Moyenne | Suppression administrative de compte partielle (`functions/index.js:501`). | Le batch supprime les documents parents `vans` et `users`, puis Auth. Les sous-collections privées, photos, conversations, commandes et références ne sont pas effacées récursivement ; plus de 499 vans dépasse aussi la limite du batch. Définir une politique de rétention, d'anonymisation et de conservation comptable, puis faire approuver toute suppression. Aucune purge exécutée. |
| Moyenne | Supervision financière et reprises réelles non exhaustivement vérifiées. | Les tests synthétiques couvrent les doublons, remboursements complets, litiges avant/après activation, victoire et événements désordonnés. Ils ne prouvent pas le comportement réel d'un remboursement différé échoué, d'une panne prolongée, du changement test/live, d'un compte Stripe désactivé ou de toutes les versions d'événements Stripe. Prévoir rapprochement périodique et alerte sur commandes bloquées avant ouverture live. |
| Faible | `checkSellerStripeStatus` et `getStripeDashboardLink` n'ont pas de quota applicatif dédié (`functions/index.js:1315`, `:1343`). | Accès limité au compte du demandeur par un mapping serveur, donc aucun accès au compte d'un tiers démontré. Un compte peut multiplier appels Stripe et écritures de son snapshot. Candidats à désactivation lors du retrait Connect, ou à quotas si conservés. |
| Faible | Migration `migrateSellerContacts` encore exposée aux administrateurs (`functions/index.js:2374`). | L'outil traite imparfaitement un ancien email au niveau racine seul et peut fusionner des valeurs nulles sur un contact privé existant. Le script de migration contrôlé est distinct. Retirer l'export seulement après accord et confirmation de fin de migration ; ne pas le relancer aveuglément. |
| Faible | Jetons de liens de disponibilité privés, réutilisables et sans échéance explicite. | La nouvelle confirmation POST protège des GET automatiques et la modération est respectée. Le détenteur d'un email contenant un jeton valide garde toutefois accès aux actions d'annonce jusqu'à rotation du jeton. Aucun pouvoir de paiement n'est donné par ces liens. Une échéance et une révocation explicites restent possibles selon le produit souhaité. |
| Faible | Ancien lien « toujours disponible » utilisé après avoir marqué l'annonce vendue. | La transaction conserve correctement le statut vendu, mais la page de résultat annonce encore une disponibilité en ligne. Adapter ce texte au statut réellement conservé ; aucune remise en ligne d'une annonce vendue n'est démontrée par ce cas. |

Les sujets IAM, MFA, secrets actuellement publiés/actifs, règles réellement déployées, dépendances et stockage sont examinés séparément dans l'audit principal. Aucun état de production ou de compte Stripe n'est déduit d'une capture ou d'un ancien compte rendu.

## Inventaire des 32 exports

| Export(s) | Déclenchement / contrôle observé | Revue |
|---|---|---|
| `onNewConversation`, `onNewMessage` | Création Firestore, destinataire lu dans le profil protégé | Amplification et concurrence corrigées ; quota partagé |
| `sendReminderEmails` | Scheduler, plafond de parcours | Budget partagé et clé de rappel déterministe ; horodatage seulement après succès |
| `deleteUser` | Callable, claim admin, auto-suppression refusée | Auth correcte ; limites de rétention/batch ci-dessus |
| `sendCarJamCampaign` | Callable admin, simulation par défaut, destinataires bornés | Pas d'accès non-admin trouvé ; budget partagé |
| `sitemap` | HTTP public, données annonces active/sold | Ancien générateur public ; pas de secret dans la sortie observée du code |
| `fetchCarJamData` | Callable authentifié, quota persistant, plaque bornée | Pas d'URL arbitraire ni fuite volontaire de clé dans la réponse ; données mock signalées si clé absente |
| `generateVanDescription` | Callable authentifié, quota persistant, payload borné | Modèle sans outils, secret non inclus dans le prompt ; fonctionnement actuel du fournisseur non prouvé par tests offline |
| `getBoostPlans` | Callable public, quota, test invisible à l'achat hors admin | Prix uniquement depuis constantes serveur |
| `createBoostCheckout` | Callable propriétaire, email vérifié, bannissement via quota, verrou privé | Prix/URLs/durée non pilotés par client ; Stripe idempotent ; pas de transfert Connect |
| `reconcileBoostOrder`, `cancelBoostCheckout` | Callable propriétaire d'ordre, email vérifié, quotas | Contrôles d'identité et sessions, rapprochement payé et expiration testés |
| `setListingAvailability` | Callable propriétaire ou admin, email vérifié, quotas | Pause ajoutée ; modération respectée ; confirmation remet les rappels à zéro |
| `expireListingBoosts` | Scheduler, état et échéance recontrôlés en transaction | Protège le boost courant avec correspondance `boostOrderId` ; maximum une instance |
| `createStripeConnectAccount` | Callable vérifié, quota, clé test uniquement | Ancien module ; pas de création live autorisée par ce chemin |
| `checkSellerStripeStatus`, `getStripeDashboardLink` | Callable authentifié, compte lu depuis mapping propre au demandeur | Quotas à ajouter si conservés |
| `createCheckoutSession` | HTTP POST, jeton Auth révocation vérifiée, email vérifié, quota, clé test uniquement | IDs et retours bornés, propriétaire réservation et vendeur contrôlés ; ancien cycle concurrent incomplet |
| `stripeWebhook` | HTTP POST, signature Stripe, corps brut, secret serveur | Correspondance des boosts et transactions ; signatures invalides 400, erreurs métier 500 pour nouvelle tentative |
| `getReservation` | Callable, participant ou admin | Pas de lecture d'une réservation d'autrui démontrée |
| `confirmReservation` | Callable vendeur, état paid | Ancienne transition à sérialiser si le produit reste actif |
| `cancelReservation` | Callable participant/admin, états bornés, remboursement Stripe idempotent | Ancien cycle, restitution transfert/frais configurée ; pas de purge ni test live |
| `sendContactMessage`, `reportListing` | Callable public, validations, honeypot, quotas persistants | Destinataire fixe, HTML échappé, budget partagé |
| `listingLifecycle` | Scheduler, jeton privé, annonces actives | Relecture transactionnelle et prise en charge des échecs email ajoutées |
| `listingAction` | GET de confirmation / POST à jeton privé | Comparaison constante, refus modération, aucune écriture GET ; pas de secret public accepté |
| `createAlert` | Callable public, quotas et plafond par adresse | Double opt-in encore absent |
| `onVanCreatedNotifyAlerts` | Trigger annonce active, plafond fan-out | Budget partagé, clé idempotente annonce/alerte ; pas d'écriture des critères depuis le client Firestore |
| `alertAction` | HTTP à jeton, désactivation d'alerte | Comparaison constante ; GET de désinscription conservé, aucun pouvoir financier ; maximum trois instances |
| `migrateSellerContacts` | Callable admin, simulation par défaut | Candidat au retrait après accord, défauts de migration résiduelle décrits |
| `sendFinalAvailabilityNotice`, `sendFinalNoticesNow` | Scheduler / callable admin | Jeton privé, budget partagé, erreurs explicites, cycle recontrôlé avant marquage |

## Vérifications reproductibles et limites

Commande locale :

```powershell
node --check functions/index.js
node --test --test-isolation=none scripts/backend-security.test.cjs scripts/boost.test.cjs scripts/security.test.cjs scripts/lifecycle-token.test.cjs
```

Résultat après corrections : **42 tests passent**, dont 14 nouveaux tests backend. Les fixtures sérialisent les transactions et conservent des snapshots isolés ; les scénarios de concurrence appellent les vrais handlers chargés en VM. Le SDK Resend installé est également exercé avec son transport remplacé. Les tests ne contactent aucun client ni moyen de paiement, ne transmettent aucun email et ne lisent aucun secret.

Ce sont des tests synthétiques : ils ne remplacent pas des tests d'intégration Auth/Firestore/Storage/Stripe, le contrôle des droits publiés et une revue indépendante. Aucun feu vert aux encaissements réels ne découle de cette seule sous-revue.
