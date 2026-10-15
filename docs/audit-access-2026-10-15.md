# Audit des accès, données et parcours vendeur — 15 octobre 2026

Ce volet couvre les règles Firestore et Storage, AuthContext, les profils et droits administrateur, les annonces et leur édition, les contacts, la messagerie, les images et les anciennes interfaces. Aucun élément ancien n'a été supprimé. Les scénarios offensifs ont été exécutés sur des documents synthétiques dans l'évaluateur officiel Firebase Rules ; aucune donnée de production n'a été modifiée pour ces essais. Les observations de production et de Stripe sont regroupées dans le rapport général.

## Résultat principal

Les droits administrateur sont fondés sur un custom claim Firebase, réécrit dans AuthContext après fusion du profil : modifier un profil ou le JavaScript du navigateur ne donne pas les droits serveur. Les commandes et dates de boost sont protégées contre les écritures clientes. Les coordonnées restent dans un document distinct ; les jetons de cycle de vie sont réservés au serveur. Ces protections ne suppriment pas les risques de spam, de coût ou les défauts de modération décrits ci-dessous.

## Défauts reproduits et corrections préparées

### P1 — Une annonce malformée pouvait casser les listes publiques

Avant correction, les règles d'édition validaient seulement le titre, le prix, la description et le statut. Un vendeur pouvait écrire `location: {invalid: true}` ou `images: 'not-an-array'` sur sa propre annonce. L'évaluateur officiel a confirmé ces écritures comme autorisées. `VanCard` rend la localisation directement comme enfant React et le carrousel appelle `images.slice(...).map(...)` : ces valeurs provoquent une exception pendant le rendu. Le risque porte sur les pages affichant cette annonce ; il ne donne pas accès au compte d'un autre vendeur.

Correction : liste explicite des champs éditables, validation du type et des bornes des champs publics modifiés et des équipements, listes d'images HTTPS limitées aux domaines Cloudinary/Firebase exacts. Les anciennes valeurs non modifiées restent éditables, afin de ne pas imposer une migration de tous les documents. Références : `firestore.rules` fonctions `hasValidImages`, `hasValidOptionalListingFields`, `validListingCreate`, `validListingUpdate` ; `src/components/VanCard.js` ; `scripts/security-rule-cases.cjs`.

### P2 — Un vendeur pouvait annuler une décision de modération

Le passage d'une annonce `hidden` ou `rejected` vers `active` était autorisé au propriétaire. Les cas synthétiques reproduisent ce comportement, malgré le bouton Masquer du tableau de bord administrateur.

Correction : un propriétaire ne peut changer le statut que depuis et vers `active`, `sold` ou `paused`. Les états `hidden`, `rejected` et `deleted` sont réservés à une intervention administrative pour être réactivés. Le callable `setListingAvailability` est corrigé dans le volet backend pour appliquer la même politique : modifier seulement les règles n'aurait pas suffi.

### P2 — Falsification possible de réputation et de fraîcheur à la création

Les créations clientes pouvaient ajouter `seller.rating`, `seller.reviewCount` et une date `createdAt` en 2099. Ces cas ont été autorisés par le simulateur avant correction. La fiche affiche la note issue de `seller.rating`, et le tri utilise la date de création.

Correction : création limitée aux champs attendus, objet vendeur limité à UID et nom, date de création égale à l'heure serveur. Les champs `finalNoticeSentAt`, les marqueurs de paiement et de boost sont exclus des écritures vendeur. Les données historiques éventuellement enrichies par le serveur ne sont pas supprimées.

### P2 — Métadonnées de conversation trop permissives

Un acheteur pouvait créer un nom de participant sous forme d'objet, modifier `lastMessageSenderId` pour imiter le vendeur ou remplacer `unreadCount` par une chaîne. Les noms sont utilisés par les avatars et le texte du chat : un objet pouvait rendre la messagerie inutilisable pour le destinataire. Les noms et textes clients ne sont pas une preuve d'identité.

Correction : noms et textes bornés, compteur et état de saisie typés, clés limitées aux participants, dernier expéditeur cohérent avec l'auteur de l'écriture, dates serveur, résumé du van typé et titre/prix rapprochés de l'annonce. Les messages refusent les noms objets et les champs supplémentaires utilisés pour imiter des messages système. Les contrôles d'ownership existants sont conservés. Les états `pending` et `resolved`, réellement proposés par l'interface mais auparavant refusés, sont autorisés en plus des anciens états.

Ces validations ne constituent pas une limite de débit. Le spam de créations/messages et l'amplification des emails restent traités séparément dans le volet backend.

### P2 — Réactivation incohérente entre fiche et Mes annonces

Les boutons de la fiche écrivaient directement `status`, sans remettre à zéro la date de rappel ni synchroniser les conversations. Une annonce réactivée après une pause automatique pouvait donc être remise en pause au prochain passage quotidien. Les handlers de `VanPage` utilisent désormais le callable commun ; correction et tests dans le volet interfaces/backend.

### P3 — Coordonnées privées de type incorrect

La relecture a identifié que le propriétaire pouvait écrire un objet, une liste ou un nombre dans `private/contact.phone` ou `whatsapp`. Le bouton WhatsApp appelle `phone.replace(...)`, qui échoue sur ces types.

Correction : les deux champs acceptent uniquement une chaîne de 64 caractères au maximum, null, ou l'absence du champ. Les chaînes vides et formats actuels avec espaces, parenthèses, tirets et préfixe international sont conservés. L'email reste égal à celui du compte Auth et le contrôle du propriétaire reste inchangé. Aucune coordonnée existante n'a été réécrite et aucun contrôle de format plus restrictif n'a été ajouté aux formulaires.

### P2 — Derniers messages et changement de compte

La requête `limit(100)` sans tri choisissait les documents par identifiant, puis les triait après réception : elle ne garantissait pas de charger les 100 derniers messages. Le composant conservait aussi la conversation sélectionnée et ses messages lors d'un changement de compte. Le volet interfaces ajoute le tri serveur décroissant, le tri d'affichage croissant, et l'association des messages à leur lecteur avec nettoyage lors du changement d'identité.

## Risques et fonctions restant à traiter

| Priorité | Observation | Conséquence et suite proposée |
|---|---|---|
| P2 | `src/cloudinaryConfig.js` utilise un preset d'upload non signé embarqué dans le navigateur. | La validation locale et la connexion au site ne limitent pas un appel direct à Cloudinary. Vérifier la configuration réelle du preset et les plafonds ; privilégier des signatures d'upload courtes délivrées par un endpoint authentifié et limité. Aucun essai d'upload abusif n'a été effectué. |
| P2 | La limite de 20 annonces est seulement vérifiée dans `SellPage` et `AddVanForm`, et les messages sont limités par localStorage. | Un client direct peut contourner ces compteurs. Mettre quotas, idempotence des conversations et limitation de débit côté serveur ; conserver le retour visuel côté client. |
| P2 | Les règles Storage autorisent des uploads par chemin UID, sans quota global ni contrôle du statut `banned`. | Un compte vérifié, même banni dans Firestore, conserve le droit d'écrire des fichiers à son chemin. Un upload signé et des quotas communs sont nécessaires ; les limites par fichier ne limitent pas le nombre de fichiers. |
| P2 | Les vues peuvent être incrémentées directement par tout compte authentifié. | Un script peut gonfler les statistiques et le badge Hot. Compter côté serveur avec déduplication et limites, sans bloquer les vues publiques. Le compteur ne contrôle pas l'activation des boosts. |
| P3 | Les avis sont créables par un compte non vérifié, sans unicité vendeur/auteur ni preuve d'interaction. | Manipulation de réputation possible si ces avis sont exploités. La page dédiée d'avis est surtout une ancienne interface ; définir la politique avant de la réactiver. |
| P3 | `MessagingPage` écrit `users.lastSeen` et lit le profil du correspondant. | Ces opérations sont refusées par les règles privées des profils, erreurs masquées : présence toujours hors ligne. Créer une donnée de présence minimale séparée et limitée aux participants ; ne pas rendre tous les profils publics. |
| P3 | `isTyping` n'est jamais alimenté dans `MessagingPage`. | L'interface « typing... » ne fonctionne pas malgré les écritures. Brancher un abonnement contrôlé au document de conversation ou retirer l'élément après accord. |
| P3 | `AddVanForm` échappe les caractères HTML avant de les stocker, alors que React échappe déjà leur rendu. | Une annonce contenant `&` peut devenir `&amp;`, puis `&amp;amp;` après éditions successives. Stocker le texte brut et échapper à chaque destination HTML côté serveur. Aucun contenu historique n'a été réécrit. |
| P3 | `securityUtils.isValidImageUrl` accepte un domaine par `hostname.includes(...)`. | Accepte aussi un domaine suffixé malveillant. Ce helper de préparation ne semble pas être le chemin actif du formulaire ; les nouvelles règles imposent les hôtes exacts. Nettoyage/correction à regrouper avec l'inventaire des utilitaires anciens. |

## Politiques de données à connaître

- `vans/{id}` est lisible publiquement, y compris un document `paused`, `hidden` ou `sold` dont l'identifiant est connu. La disparition d'une annonce des résultats n'est pas une garantie de confidentialité. Le document ne doit donc jamais contenir un secret ou des coordonnées privées. Restreindre cette lecture exigerait aussi de revoir les requêtes publiques et le rendu serveur ; ce changement n'a pas été appliqué pendant cet audit.
- `vans/{id}/private/contact` est lisible par tout compte vérifié non banni, conformément au fonctionnement actuel du produit. Cela bloque l'aspiration anonyme, pas celle d'un utilisateur vérifié. Une politique plus restrictive devrait utiliser une API avec un plafond de consultations.
- Les chemins Storage d'images de vans et d'avatars sont publics par conception. Les confirmations de réservation restent réservées aux participants et à l'administrateur.
- Les liens WhatsApp et téléphone transmettent volontairement les coordonnées au service ou à l'application sélectionnée par l'utilisateur.
- Aucun chemin concret de XSS stockée n'a été identifié dans les champs d'annonce rendus comme texte React. Les blocs HTML directs examinés de l'indice des prix utilisent du texte statique et des nombres calculés. Cette conclusion est limitée au code examiné, sans prétendre à l'absence de toute XSS.

## Vérifications

Avant correction : 15 scénarios synthétiques exécutés avec le comportement constaté comme attente ; les 15 attentes sont confirmées. Cela comprend les écritures malformées acceptées, les réactivations de modération acceptées, le heartbeat de présence refusé et les statuts de chat proposés par l'interface refusés.

Après correction : **133 cas Firestore réussis**, compilation Firestore et Storage sans erreur ni avertissement. Le résultat complet est dans `reports/audit-access-rules-2026-10-15.jsonl` (rapport local ignoré par Git). Sont notamment couverts :

- création et édition complètes avec dix URLs distinctes et les 31 équipements du formulaire ;
- édition avec placeholders publics de contact à null et écriture séparée du contact privé de la même annonce ;
- création et édition des contacts avec numéros locaux/internationaux, null, chaîne vide, champ omis, borne exacte de 64 caractères ; rejet des objets, listes, nombres, booléens et chaînes dépassant la borne pour téléphone et WhatsApp ;
- préservation des anciens champs inchangés et rejet des types malformés modifiés ;
- dates falsifiées, réputation injectée, hôtes d'image usurpés, image objet/null, trop d'images ;
- réactivation vendeur interdite pour hidden/rejected/deleted, permise pour paused ;
- conversation complète réelle, message normal et refus de noms objets / champs arbitraires ;
- impossibilité de modifier les commandes de boost, d'obtenir les jetons privés ou de lire les profils d'autres utilisateurs.

Les deux cas « image objet » produisent un message d'évaluation indiquant qu'une map ne peut pas être jointe en chaîne : leur résultat est bien DENY et leur test réussit. Les variantes valides à dix photos passent, ce qui vérifie aussi la limite de 1000 expressions des règles.

Les essais sont synthétiques et ne sont pas une campagne de charge sur la production. Ils ne vérifient pas la configuration effective du preset Cloudinary, tous les chemins des fournisseurs OAuth, une compromission historique ou le comportement de tous les appareils. Après publication, le contrôle principal confirme les 133 cas réussis et la correspondance exacte des règles Firestore et Storage avec les fichiers locaux ; voir le bilan principal pour la preuve de déploiement.

Références primaires : [tests Firebase Rules REST](https://firebase.google.com/docs/reference/rules/rest/v1/projects/test), [validation de champs Firestore](https://firebase.google.com/docs/firestore/security/rules-fields), [opérations sur les listes Rules](https://firebase.google.com/docs/reference/rules/rules.List).
