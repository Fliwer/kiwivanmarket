# Audit de sécurité, fonctionnement et ancien code — 15 octobre 2026

## Décision

**Conserver les paiements réels désactivés.** Le boost fonctionne en test, mais ce seul parcours ne donne pas un feu vert pour les vrais encaissements. Les droits de l'infrastructure, la récupération des données et la maîtrise des uploads restent des priorités avant l'ouverture financière.

Cet audit couvre le dépôt et les contrôles de production accessibles au moment de la revue. Il ne garantit pas l'absence de toute faille et ne remplace pas un test d'intrusion indépendant. Aucun ancien module, fichier de sauvegarde ou document métier n'est supprimé pendant cet audit. La liste de nettoyage nécessite l'accord du propriétaire.

État des corrections : **validées et publiées**. Les preuves de publication figurent en fin de rapport. Les points ouverts restent explicitement listés ; aucun nettoyage de l'ancien code n'a été effectué.

## Périmètre et méthode

| Domaine | Travail effectué | Limites |
|---|---|---|
| Firebase Functions | Revue des exports, autorisations, quotas, emails, cycle de disponibilité, anciennes réservations et boosts Stripe ; scénarios concurrents sur les vrais handlers exécutés avec des doubles locaux | Aucun paiement réel, email de test envoyé à des tiers ou test de saturation en production |
| Données | Compilation et tests synthétiques des règles Firestore/Storage, comparaison avec les règles publiées, sondages anonymes et inspection des types des 94 annonces | Les tests Rules REST utilisent des mocks ; ils ne remplacent pas tous les parcours sur émulateur et appareils réels |
| Frontend | Authentification, profils, édition, favoris, messagerie, statuts, traductions et graphe des imports | Connexions privées et scénarios multicomptes vérifiés synthétiquement, sans utiliser les identifiants des vendeurs |
| Site public | 166 URL de sitemaps, 7 sitemaps, statuts HTTP, canonical, robots, JSON-LD ; navigation Chrome sur ordinateur et mobile | Quelques secondes d'observation ne prouvent pas tous les chargements ; l'accueil a aussi été contrôlé en attendant réellement les annonces |
| Infrastructure | Métadonnées des 32 fonctions, secrets sans leurs valeurs, IAM, sauvegardes, protection de base, TTL et plafonds d'instances | MFA des comptes humains, sessions administrateur, budgets de facturation et configuration interne Cloudinary non vérifiés |
| Dépendances et secrets | npm audit via le registre réel, scan des fichiers suivis et de l'historique sans restitution des secrets | La présence d'une dépendance vulnérable ne prouve pas son exploitation dans le navigateur ; les permissions des services externes restent à vérifier |
| Ancien code | Graphe AST des entrées React, Vercel, middleware, Functions et scripts ; contrôle des références et des conventions de génération | Les usages externes, outils lancés à la main et fichiers non suivis ne peuvent pas être déclarés inutiles avec certitude |

Volets détaillés : [backend](audit-backend-2026-10-15.md), [accès et règles](audit-access-2026-10-15.md), [fonctionnement et ancien code](audit-legacy-2026-10-15.md).

## Contrôles de production confirmés avant corrections

- **94 annonces parcourues, sans pagination restante : zéro jeton de modification public et zéro coordonnée vendeur dans les champs publics contrôlés.** Aucun type malformé trouvé parmi les champs `location`, `title`, `images`, `price`, `year`, `mileage` de ce stock.
- Les lectures anonymes de `users`, `reservations`, `stripeAccounts` et `securityRateLimits` retournent **403**. Les coordonnées restent volontairement accessibles aux comptes ayant un email vérifié ; cela n'empêche pas entièrement leur collecte par un utilisateur authentifié.
- Les règles Firestore et Storage publiées correspondent aux fichiers locaux au début de la revue. Les **51 cas de règles existants passent** ; l'audit a ajouté des scénarios absents de cette couverture.
- Les **32 fonctions sont actives** et partagent un seul compte de service. Les 10 fonctions utilisant Stripe sont sur les secrets version 3 et `BOOST_PAYMENTS_LIVE_ENABLED=false`.
- Pour les deux secrets Stripe, versions 1 et 2 désactivées, version 3 activée. La révocation de l'ancienne clé exposée avait été vérifiée lors de sa rotation du 15 octobre (Stripe HTTP 401). Désactiver une version Google ne révoque pas les clés d'un autre environnement Stripe.
- Le webhook courant de test est actif avec les événements des boosts ; les deux anciens endpoints du même environnement sont désactivés. Aucun secret n'est reproduit dans ce rapport.
- **166 pages dans 7 sitemaps : aucune erreur détectée** de statut HTTP, canonical, langue française, robots ou JSON-LD par le script de contrôle. Les en-têtes HTTPS, `nosniff`, protection de frame et politique de referrer sont présents.
- Aucun secret conforme aux motifs recherchés dans les fichiers suivis actuels. Une ancienne clé Stripe de test reste présente dans l'historique Git ; sa révocation reste plus importante que l'effacement de cet historique.

## Problèmes confirmés et corrections publiées

| Priorité | Problème prouvé | Correction et validation |
|---|---|---|
| P1 | Un vendeur pouvait enregistrer des types invalides dans son annonce, par exemple une localisation objet ou des images sous forme de chaîne. Ces valeurs peuvent faire échouer le rendu des listes publiques. | Validation des types et bornes dans les règles, avec cas de publication et modification complets pour préserver les formulaires légitimes. Voir le volet accès pour les cas et résultats. |
| P1 | Le vendeur pouvait remettre une annonce `hidden` ou `rejected` en ligne ; un ancien lien email valide pouvait aussi contourner la modération. | Refus côté règles et endpoint de disponibilité ; contrôle transactionnel dans l'action email. L'administration conserve son droit explicite de modération. |
| P1 | Des notifications concurrentes ou conversations répétées déclenchaient des emails en rafale. Les contrôles précédents pouvaient tous observer le même état libre. | Réservation transactionnelle, déduplication par événement, délai par destinataire, plafond par expéditeur et budget partagé sur tous les envois Resend. Scénarios à 20 requêtes concurrentes et test du SDK installé. |
| P1 | Le cron pouvait mettre en pause une annonce dont le boost venait d'être payé après la lecture initiale du stock. | Relecture et décision transactionnelles sur le document actuel ; scénario de course avec activation de boost après le snapshot. |
| P2 | À la création, un vendeur pouvait ajouter une réputation dans son objet vendeur et prolonger la visibilité avec une date de création future. | Objet vendeur limité à l'identité et au nom ; date de création imposée à l'horodatage serveur. |
| P2 | Une erreur retournée par Resend pouvait être traitée comme un rappel envoyé, puis déclencher à tort le délai de mise en pause. | Le compteur de rappel n'est posé qu'après succès ; relecture du cycle avant écriture. Un quota email épuisé ne bloque pas une pause déjà justifiée. |
| P2 | L'ouverture GET d'un lien email modifiait immédiatement le statut de l'annonce. Un scanner de liens pouvait donc déclencher une action. | GET affiche une confirmation sans écriture ; seul POST validé applique l'action. Page non indexable, non mise en cache, sans referrer et non intégrable dans une frame. |
| P2 | Les boutons de statut de la fiche van utilisaient encore une écriture cliente directe, sans les remises à zéro du cycle et la synchronisation serveur. | Utilisation de `setListingAvailability` pour disponible, vendu et pause, avec contrôle des erreurs. |
| P2 | Au changement de compte, des messages du compte précédent pouvaient rester visibles en mémoire. Les règles ne retirent pas automatiquement un état React déjà chargé. | Isolation des résultats par utilisateur et conversation, remise à zéro de sélection et brouillon, tests de changement de compte/déconnexion. |
| P2 | La requête des messages limitait un sous-ensemble sans tri serveur ; au-delà de 100 messages, certains nouveaux messages pouvaient manquer. | Lecture des 100 derniers messages ordonnés côté Firestore, puis affichage chronologique. L'historique au-delà de ces 100 messages reste un chantier distinct. |
| P2 | Les favoris n'ouvraient pas la fiche quand le callback absent était appelé ; seuls les dix premiers favoris étaient chargés. | Navigation de secours vers la fiche, chargement par lots de tous les favoris et exclusion des résultats de chargement obsolètes. |
| P2 | Les notifications changeaient un état de messagerie qui n'était plus rendu. | Pont de navigation vers la route active `/messages`, sans supprimer les anciens éléments. |
| P3 | Des clés brutes `common.loading`, `common.cancel` et `my_listings.sold` pouvaient apparaître dans l'interface. | Ajout des libellés communs dans les trois langues et réutilisation de `my_listings.status_sold`. |
| P2 | Le téléphone ou WhatsApp privé pouvait être enregistré sous forme d'objet, puis casser le bouton de contact. | Champs limités à une chaîne de 64 caractères, null ou absence ; conservation des formats et champs vides actuels. Tests de création et modification. |

Le budget email publié est de **80 tentatives par jour UTC**, **40 par heure**, **10 par expéditeur et par heure**, avec un délai de **30 minutes par destinataire** sur les notifications. Il protège contre le coût et les rafales ; il peut limiter des notifications légitimes à fort trafic et ne constitue pas un plafond global de dépenses cloud. Les paramètres devront être ajustés aux volumes et au forfait Resend après observation.

## Points ouverts avant les vrais encaissements

### 1. Droits du compte de service — P1

IAM confirme encore `roles/editor` sur le compte d'exécution partagé par les fonctions. Une compromission d'une fonction pourrait donc avoir un impact bien au-delà de sa seule fonctionnalité.

Préparer un compte de service dédié et une matrice minimale Firestore/Auth/Secrets/Eventarc/Storage ; tester puis basculer progressivement. **Aucun retrait de rôle à l'aveugle n'a été effectué.** [Recommandations Google](https://cloud.google.com/blog/products/application-development/least-privilege-for-cloud-functions-using-cloud-iam).

### 2. Récupération des données — P1

Les métadonnées Firestore montrent : **PITR désactivé**, **aucune sauvegarde planifiée**, **protection contre la suppression désactivée**. Une erreur ou suppression de données financières serait donc difficile à réparer avec les mécanismes natifs actuellement configurés.

Activer une politique de sauvegarde/rétention et tester une restauration dans une base distincte avant de stocker des encaissements réels. Décider du coût et des durées de conservation avant toute configuration ou purge. Cela n'a pas été changé pendant l'audit.

### 3. Uploads et maîtrise des coûts — P1 à traiter côté prestataire

Le navigateur utilise un preset Cloudinary **unsigned public**. Les limites de poids/type appliquées uniquement dans JavaScript peuvent être contournées. Aucune tentative d'upload abusif n'a été effectuée ; les restrictions réelles du preset et les budgets du compte Cloudinary n'ont pas pu être vérifiés.

Vérifier formats autorisés, limites, transformations et quotas chez Cloudinary, puis envisager des signatures serveur délivrées après authentification et quota. Un preset public n'est pas un secret ; le renommer ne remplace pas ces contrôles. [Documentation Cloudinary](https://cloudinary.com/documentation/upload_presets).

### 4. Validation Stripe et scénarios financiers — P1 avant ouverture

Le parcours hébergé de paiement fictif de 50 NZD/28 jours a été vérifié le 15 octobre : paiement accepté, boost activé, événement reçu et aucun webhook restant. Les tests automatisés couvrent montants, propriété, doublons, remboursements et litiges, mais utilisent des doubles locaux pour ces scénarios.

Compléter les essais hébergés de refus, annulation, remboursement et authentification bancaire ; vérifier l'activation du **compte réel**, les conditions des boosts et leur présentation fiscale. Les informations d'un sandbox ne prouvent pas que le compte réel a terminé sa validation. Définir les secrets et le webhook live ensemble seulement après ces validations. Les anciens flux Connect/acompte restent bloqués pour les créations réelles et ne font pas partie de la vente de boosts.

### 5. Dépendances — P2, migration contrôlée

Contrôle réseau effectif du registre npm, sans installation ni `audit fix --force` :

| Périmètre | Résultat |
|---|---|
| Dépôt principal, frontend et outils | **103 alertes : 68 hautes, 32 modérées, 3 faibles, aucune critique** |
| Functions, dépendances de production | **8 modérées, aucune haute ni critique** ; avis sous-jacent `uuid` et parents transitifs |

Ces nombres comprennent les parents transitifs et la chaîne CRA/Jest/webpack ; ils ne représentent pas 103 failles indépendantes accessibles aux visiteurs. L'inspection des 559 modules du build navigateur n'y retrouve ni `@grpc/grpc-js`, `sharp`, `webpack-dev-server`, `webpack-dev-middleware`, `postcss`, `serialize-javascript`, `node-forge`, `nth-check`, `svgo`, `underscore`, ni `uuid`. Cela réduit l'exposition de ces avis dans le navigateur, sans rendre la chaîne de développement ou le backend invulnérables.

Planifier la migration de `react-scripts@5.0.1` et mettre à jour les dépendances de manière testée. Le correctif automatique proposé pour certains avis rétrograde Firebase ou installe `react-scripts@0.0.0` : **non appliqué**. Les mises à jour majeures de `firebase-admin` et `sharp` nécessitent une validation séparée.

### 6. Autres durcissements et dette fonctionnelle

- Alertes email : création possible sans double confirmation de l'adresse. Le budget partagé limite les rafales, mais ne prouve pas le consentement du destinataire. Prévoir un double opt-in.
- La politique CSP actuelle limite objets et base URL, mais ne définit pas une liste stricte des scripts autorisés. Concevoir et tester une politique avec Firebase Auth, Stripe, les polices et analytics avant de l'imposer ; préserver le calculateur embarquable.
- App Check/anti-bot n'est pas une protection active vérifiée. À déployer progressivement avec observation avant enforcement.
- La limite de 20 annonces et certains délais de messagerie sont seulement côté client. Les appels directs peuvent les contourner ; les budgets email ne limitent pas ces écritures Firestore. Prévoir des quotas serveur pour la création d'annonces, de conversations et de messages. Storage impose des limites par fichier, mais pas un quota cumulé, et n'applique pas le bannissement Firestore aux uploads.
- `securityRateLimits.expiresAt` n'a pas de TTL activé. Le nouveau registre email contient aussi une échéance mais ne sera pas purgé automatiquement sans configuration. Toute rétention/purge doit être approuvée.
- Suppression de compte : les sous-collections, photos, conversations et commandes ne sont pas toutes nettoyées par la suppression des documents racines. Définir une politique cohérente, en conservant les justificatifs nécessaires. **Aucune purge réalisée.**
- La suppression d'une annonce laisse aussi ses sous-documents privés et médias orphelins. L'existence du parent est exigée pour lire le contact privé, mais cela ne constitue pas une purge des données ou des coûts de stockage.
- Les appels clients de présence/frappe, certains états de conversations et les types de métadonnées de messagerie ont été examinés dans le volet accès ; se référer à sa matrice finale pour les changements autorisés.
- L'historique de messagerie avant les 100 derniers messages et les accusés de lecture de très longues conversations restent à paginer.
- `sanitizeString`/`sanitizeText` encodent les entités HTML avant stockage, puis React les échappe de nouveau. Des éditions successives peuvent dégrader les textes. Corriger les frontières d'encodage avec une stratégie pour les données existantes, sans migration aveugle.
- Des métadonnées de recadrage d'image malformées peuvent bloquer l'éditeur. Elles ne sont pas utilisées par les cartes et fiches publiques ; voir le cas P3 détaillé du volet ancien code.
- Le catalogue espagnol reste incomplet et utilise le fallback anglais. Les clés FR/EN sont alignées ; les clés brutes identifiées pendant cette revue sont corrigées.
- Le middleware donne une vraie 404 aux entrées directes inconnues. Une navigation interne SPA vers un chemin inconnu n'a pas de route React de repli dédiée ; aucun lien littéral interne cassé n'a été trouvé.
- Les tests ne sont pas encore imposés par une CI versionnée dans le dépôt. Prévoir une chaîne sans secrets de production, exécutant React, Node, le bundle et les tests de règles synthétiques. Le déploiement Vercel seul ne remplace pas ces tests.

## Ancien code : rien supprimé, accord requis

L'inventaire précis, la preuve de non-utilisation et les exceptions figurent dans [le volet ancien code](audit-legacy-2026-10-15.md#candidats-au-nettoyage--accord-requis-avant-toute-suppression).

Lots proposés pour décision :

1. **Ancien paiement du véhicule / Connect** : 7 fichiers frontend non atteints, SDK Stripe frontend associés, ancienne interface de réservations. Examiner séparément les endpoints serveur encore déployés, les données et liens externes. Le SDK `stripe` des Functions et les boosts doivent rester.
2. **Anciens composants remplacés** : messagerie, navigation, langue, guides, doublon de helper admin et ancienne modale « Mes vans » non rendue.
3. **Sauvegardes et journaux suivis** : `.bak`, `tmp_prev*`, anciens logs de build, `ref_index.html`, `structure.txt`. Leur retrait ne doit pas effacer l'historique de travail sans accord.
4. **Fichiers non suivis et copie `kiwivanmarket/`** : conserver tant que leur propriétaire n'a pas confirmé qu'il s'agit d'une copie abandonnée.

**À conserver malgré leur apparence de doublon** : miroirs SEO `.js`/`.cjs` générés, entrées Vercel `api/*.js`, middleware, scripts manuels/migrations, fixtures et `setupTests.js`, composants actifs `AddVanForm`, `VanCard`, les deux parcours de profil tant qu'ils ne sont pas unifiés. Le graphe a repéré 18 fichiers inatteignables ; cela ne vaut pas autorisation de suppression.

## Reproduction et preuves

Les sorties brutes d'audit sont gardées dans `reports/`, exclu de Git. Elles n'affichent ni clés ni valeurs de coordonnées.

```text
npm test -- --watchAll=false --runInBand --silent
node --test --test-isolation=none scripts/*.test.cjs
node scripts/security-firebase-checks.cjs
node scripts/security-checks.cjs
node scripts/audit-indexing.cjs
node scripts/check-boost-stripe.cjs
npm audit --json --ignore-scripts
npm audit --omit=dev --json --ignore-scripts   # depuis functions/
npm run build
```

Les contrôles Firebase nécessitent le compte CLI autorisé. Ils compilent et simulent les règles sans modifier de document métier. Le script Stripe est en lecture seule sans ses options explicites de configuration/vérification Checkout.

Les audits réseau ont été relancés avec l'accès effectif au registre : une sortie locale sans accès réseau avait indiqué zéro alerte et n'a pas été retenue comme preuve d'absence de vulnérabilités.

## Validation finale et publication

- **67 tests React dans 18 suites : réussis.** Navigation favoris, changements de compte en messagerie et actions de disponibilité inclus.
- **71 tests Node : réussis.** Scénarios de concurrence email et de cycle de disponibilité ajoutés aux tests de paiement, de sécurité et de rendu existants.
- **133 cas de règles : réussis**, y compris le complément de validation des coordonnées privées. Compilation Firestore et Storage sans erreur ni avertissement ; règles publiées relues et identiques aux fichiers locaux.
- **Build de production : réussi**, sans avertissement de compilation ESLint. L'outil CRA émet un avertissement de dépréciation Node pour `fs.F_OK`.
- Le nombre et les noms des **32 exports de fonctions sont inchangés**. Aucun endpoint historique n'a été supprimé.

Les règles Firestore et les 32 fonctions ont été publiées avec succès. La vérification des métadonnées confirme **32 fonctions actives**, toutes avec un plafond d'instances, les secrets Stripe version 3 et les paiements réels toujours désactivés. Les requêtes invalides GET/POST de disponibilité retournent 400, PUT retourne 405, avec les en-têtes de protection attendus. Les cinq collections privées sondées, dont le nouveau registre d'emails, refusent la lecture anonyme (403). Les 94 annonces relues n'exposent aucun jeton ni coordonnée dans les champs contrôlés.

Le commit de correctifs est `19abb14`, poussé sur `main`. Le déploiement Vercel [`dpl_3cmw73xJNHNqN3ieD6pUe8egrEPc`](https://kiwivanmarket-dblz49p04-pauls-projects-5d056a3f.vercel.app) est **Ready**, avec les alias `kiwivanmarket.com` et `www.kiwivanmarket.com` confirmés à sa publication. **17 navigations Chrome** ont ensuite été vérifiées sur le domaine public, en largeurs 1280 et 390 px : toutes en HTTP 200, aucune erreur JavaScript observée, aucun écran d'erreur ni débordement horizontal ; l'accueil affiche réellement 12 liens d'annonces après attente du chargement. Les parcours privés authentifiés restent couverts par les tests synthétiques et les limites de périmètre ci-dessus.

Les résultats initiaux étaient de **56 tests React**, **56 tests Node** et **51 cas de règles** ; les nouveaux cas couvrent les régressions identifiées par cet audit. Les preuves locales finales sont `reports/audit-published-rules-2026-10-15.jsonl`, `reports/audit-published-runtime-2026-10-15.jsonl`, `reports/audit-published-http-2026-10-15.jsonl`, `reports/audit-published-browser-2026-10-15.jsonl` et les journaux de build/déploiement datés du même jour.

## Références techniques

- [Validation de champs et types Firestore](https://firebase.google.com/docs/firestore/security/rules-fields).
- [Tri et limites de requêtes Firestore](https://firebase.google.com/docs/firestore/query-data/order-limit-data).
- [Identité d'exécution des fonctions Google Cloud](https://docs.cloud.google.com/functions/docs/securing/function-identity).
- [Upload presets et sécurité Cloudinary](https://cloudinary.com/documentation/upload_presets).
- [Idempotence des emails Resend](https://resend.com/changelog/idempotency-keys).
- [Détail de l'avis uuid](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
