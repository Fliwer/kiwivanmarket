# Audit de sécurité — Kiwi Van Market — 12 octobre 2026

## Décision

**Paiements réels : ne pas activer.** Les vulnérabilités confirmées et les correctifs sont décrits ci-dessous. Le backend refuse désormais les clés Stripe réelles à la création de Checkout et de comptes Connect. Les remboursements existants et le webhook ne sont pas désactivés. Ce contrôle doit rester en place jusqu'à validation du cycle financier complet.

Périmètre : code React, routes Vercel et pré-rendu HTML, Firebase Functions, règles Firestore/Storage, dépendances npm, fichiers suivis et historique Git local, règles publiées, IAM du projet et contrôles HTTP anonymes. Les tests ne constituent pas une garantie d'absence de faille. Aucun numéro de carte, secret, adresse email ou numéro de téléphone n'est reproduit dans ce rapport.

## Constats prioritaires

| Priorité | Constat vérifié | Correctif / état |
|---|---|---|
| Critique | 74 annonces contenaient un jeton de modification dans leur document public. Le lien permettait de déclarer une annonce vendue ou disponible. | Champs retirés en production. Nouveaux jetons dans `private/lifecycle`, inaccessible aux clients. L'endpoint refuse les anciens jetons publics. Les anciens liens email deviennent invalides : utiliser la connexion et « My listings ». |
| Haute | Les 91 annonces exposaient des coordonnées vendeurs à une lecture anonyme Firestore. Le verrou visuel n'empêchait pas leur extraction. | Migration atomique de chaque annonce vers `private/contact`, conservation des coordonnées privées déjà présentes. 91 migrations, zéro conflit. Relecture anonyme : zéro annonce avec coordonnées ou jeton public. |
| Haute | Le JSON-LD des pages d'annonces et du rendu partagé insérait des chaînes utilisateur sans neutraliser `</script>`. | Échappement de `<` avant inclusion dans le HTML. Deux tests avec des annonces malveillantes. |
| Haute | Remboursement d'une destination charge sans récupération du transfert vendeur : la plateforme pouvait financer le remboursement. Les réservations `confirmed` n'étaient pas remboursées. | `reverse_transfer`, `refund_application_fee`, clé d'idempotence ; traitement de `paid` et `confirmed`, validation de l'état de remboursement. À vérifier avec Stripe test. |
| Haute | Annulation directe Firestore après paiement ou avec une session ouverte, contournant l'expiration Checkout et le remboursement backend. | Refus par les règles ; une réservation pending sans Checkout reste annulable. Le backend expire une session ouverte et refuse une annulation lorsque le paiement est en cours de rapprochement. |
| Haute | Webhook : comparaison arrondie, prix courant mutable, absence de contrôle de devise, de statut payé et de correspondance exacte de session/participants. | Contrôle exact en centimes sur le montant sauvegardé à Checkout, NZD, statut payé, session, PaymentIntent et métadonnées ; transition Firestore transactionnelle. Une anomalie retourne un échec et déclenche une nouvelle tentative. |
| Haute | Destinataires email pris dans des champs de conversation contrôlés par le client ; création d'un profil avec une adresse différente du jeton Auth. | Destinataires lus dans les profils protégés, email de profil lié au jeton ; vendeur de conversation lié à l'annonce, acheteur lié au demandeur. |
| Haute | Compte de service d'exécution avec `roles/editor` sur tout le projet, confirmé par IAM. | **À traiter** : compte dédié et droits minimaux, après inventaire des besoins Functions, Eventarc, Auth, Firestore et secrets. Ne pas retirer le rôle sans préparer et tester les droits de remplacement. |
| Haute | Une véritable clé secrète Stripe **de test** apparaît dans l'historique Git, notamment dans `functions/.env` et `functions/index.js` au commit `9eadf6d`. | Absente des fichiers suivis actuels. **Révocation dans Stripe requise** ; son état actuel de validité n'a pas été testé. La suppression d'un fichier ne révoque pas une clé. Aucun secret live détecté par les motifs recherchés. |

## Autres correctifs

- URLs de retour Checkout limitées aux origines du site ; localhost admis uniquement dans l'émulateur. Refus des URL avec identifiants, des références invalides, annonces indisponibles et auto-réservations. Email vérifié exigé et jetons Firebase révoqués vérifiés.
- Création de comptes Connect idempotente. Contrôle de compte banni pour Firestore et les endpoints soumis aux quotas.
- Quotas persistants par compte/IP et plafonds globaux pour contact, signalement, alertes, génération IA, CarJam, Checkout et onboarding ; plafonnement du fan-out des nouvelles annonces. Limites d'instances sur les formulaires publics. Les limitations côté navigateur ne sont pas considérées comme une protection serveur.
- Réglages privés réservés à l'administration ; seul `settings/public` est public. Champs de notification email réservés au serveur, secrets de cycle d'annonce non modifiables par le propriétaire côté client.
- Suppression du journal complet des conversations ; erreurs webhook et génération IA moins bavardes. Prix des emails converti en nombre et paramètres des liens de messagerie encodés pour empêcher des insertions HTML. Coordonnées privées illisibles après suppression de l'annonce parente.
- Ajout des routes, réécritures et autorisations du middleware de retour Stripe, dont les deux URL renvoyaient 404 avant correction. Aucun statut de paiement n'est établi par une page de retour.
- CSP minimale (`base-uri`, `object-src`) et protection des frames sur Firebase Hosting ; une politique stricte de scripts reste à construire et à tester avec Firebase Auth, Stripe et les analytics.
- Exclusion Git des environnements, dépendances imbriquées et nouveaux journaux de débogage. Les fichiers déjà présents dans l'historique ne sont pas effacés par `.gitignore`.

## Dépendances

`npm audit fix --ignore-scripts`, sans forcer de changements majeurs :

| Périmètre | Avant | Après |
|---|---|---|
| Frontend et outils de construction | 108 alertes, dont 4 critiques et 81 hautes | 103 alertes : 0 critique, 68 hautes, 32 modérées, 3 faibles |
| Functions, outils de test inclus | 31 alertes, dont 3 critiques et 10 hautes | 29 modérées, aucune critique ou haute |
| Functions, dépendances de production | Non isolé avant mise à jour | 8 modérées, aucune critique ou haute |

Ces nombres incluent les dépendances transitives et leurs parents : ils ne représentent pas autant d'exploits indépendants. L'arbre frontend contient la chaîne Create React App/Jest/webpack et du code Firebase pour Node ; l'exposition effective doit être distinguée du bundle navigateur. Les alertes résiduelles doivent être traitées, notamment par une migration planifiée de la chaîne de build et des mises à jour majeures testées. `npm audit fix --force` proposait notamment une rétrogradation de Firebase et `react-scripts@0.0.0` : non appliqué.

## Vérifications

- 8 tests Node : retours de phishing, refus de clés live, webhook falsifié/mauvaise devise/montant exact, récupération du transfert au remboursement, quotas persistants, injection JSON-LD dans les deux rendus et routage du middleware de retour de paiement.
- 26 tests de règles Firestore avec documents synthétiques et mocks, via l'API Firebase Rules : parcours autorisés et refus d'accès, fausse adresse email, élévation admin, falsification de paiement, annulation contournée, secrets privés, identité de conversation et refus de réintroduire des coordonnées publiques. Aucune écriture de document par ces tests.
- Compilation des règles Firestore et Storage par Firebase ; quatre tests React existants ; build de production réussi.
- En production avant modification : accès anonymes à `users`, `reservations`, `stripeAccounts`, `securityRateLimits` refusés (403). Pages accueil, vente, profil et sitemaps : 200. Retours de paiement : 404 avant correction.
- Migration : parcours des 91 annonces sans pagination restante ; vérification anonyme après migration, zéro champ de coordonnées ou jeton exposé. Les règles Storage publiées ont été comparées au fichier local.
- JSON des traductions FR/EN validés. Aucun nouveau texte produit ajouté ; les composants de paiement existants présentent encore une dette de traduction.

Commandes reproductibles : `node --test scripts/security.test.cjs`, `node scripts/security-firebase-checks.cjs`, `node scripts/security-checks.cjs`, `npm test -- --watchAll=false --runInBand`, `npm run build`. Les deux scripts Firebase utilisent la connexion CLI existante sous Windows. La migration est en simulation sans `--apply` et reste relançable.

## Conditions avant Stripe live

1. Révoquer la clé de test retrouvée dans Git ; vérifier les clés Stripe actives et séparer strictement test/live, comptes Connect, secrets et endpoints webhook.
2. Choisir le modèle financier. Le code utilise `transfer_data.destination`, qui transfère les fonds au vendeur immédiatement. L'interface décrit une libération après confirmations et contient encore un TODO de payout : **cette promesse ne correspond pas au backend**. Décider du moment réel du transfert et aligner toute l'interface avant activation.
3. Implémenter une réservation exclusive du van et un verrou transactionnel commun au paiement, à l'acceptation, à l'annulation et au remboursement. La création Checkout et la confirmation vendeur restent exposées à des courses concurrentes. Deux acheteurs peuvent encore payer pour le même van en mode test. Les correctifs ponctuels ne constituent pas un cycle financier terminé.
4. Tester avec Stripe test : signatures invalides, doublons et événements désordonnés, paiement pendant annulation, reprise après crash, prix modifié, expiration, remboursement pending/failed, vendeur désactivé, transfert échoué, chargeback et rapprochement financier. Le stockage des événements webhook n'est pas atomique avec leur traitement ; le marquage payé est transactionnel, mais un journal financier complet reste nécessaire.
5. Traiter les remboursements différés, remboursements externes et litiges par webhook ; ajouter surveillance, rapprochement et alertes exploitables. Vérifier l'expiration des réservations et les délais annoncés : aucun système complet de remboursement automatique à 48 h n'a été validé.
6. Supprimer les changements d'état final pilotés par le navigateur. Les confirmations photo reposent sur une URL libre et un composant tente encore de déclarer `depositReleased` directement, refusé par les règles. Une preuve de rencontre ne doit pas valider seule un versement.
7. Durcir IAM et les accès administrateurs ; vérifier MFA des comptes propriétaires/Stripe/GitHub/Vercel, sessions actives, accès aux secrets et sauvegardes. Ces contrôles de comptes personnels ne sont pas validés par la présente revue.
8. Ajouter App Check/anti-bot, double opt-in des alertes email, nettoyage TTL de `securityRateLimits`, restrictions Cloudinary côté prestataire et protection contre les uploads anonymes du preset public. Vérifier budgets et quotas Google Cloud : un quota applicatif ou une alerte de budget ne garantit pas une limite totale de dépenses.
9. Compléter les tests d'intégration avec Auth/Firestore/Storage et les parcours navigateur après authentification ; la compilation et les mocks ne prouvent pas tous les comportements réels, notamment les photos et les comptes bannis côté Storage. Mettre en place des contrôles automatiques en CI.

Les modifications des droits IAM, la révocation Stripe et les validations financières restent des points ouverts : **l'audit ne donne pas un feu vert pour encaisser de l'argent réel.**

Références : [destination charges Stripe](https://docs.stripe.com/connect/destination-charges), [tests Firebase Rules](https://firebase.google.com/docs/reference/rules/rest/v1/projects/test), [tests de règles avec émulateurs](https://firebase.google.com/docs/rules/unit-tests).
