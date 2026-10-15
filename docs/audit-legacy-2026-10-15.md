# Audit fonctionnel et ancien code — 15 octobre 2026

Périmètre : frontend React, routes, appels de fonctions, points d’entrée API/SSR, traductions, duplication et code historique. Ce volet complète l’audit des règles, du backend et de l’infrastructure. Aucun fichier, fonction, secret ou donnée métier n’a été supprimé. Les suppressions éventuelles nécessitent l’accord de l’utilisateur.

## Méthode et preuves

- Analyse AST avec `@babel/parser` des imports ESM, imports dynamiques et `require` littéraux, résolution des chemins `.js`, `.jsx`, `.cjs`, JSON et index.
- Racines du graphe : `src/index.js`, `middleware.js`, chaque handler `api/*.js` (entrées Vercel par nom de fichier), `functions/index.js`, chaque script `scripts/*` (outils manuels conservés comme entrées). Les tests sont exclus du graphe applicatif et conservés comme points d’entrée de vérification.
- Recherche `rg` des noms de fichiers/exportations pour contrôler les références hors graphe, commentaires et conventions de génération. Un fichier non atteint n’est qu’un candidat au nettoyage ; les conventions et entrées implicites ont été contrôlées séparément.
- Extraction des 20 routes React, comparaison des liens internes littéraux et destinations `navigate` avec les routes et fichiers `public/` : aucun lien littéral interne non résolu. Les chemins dynamiques, les données stockées et les flux authentifiés ne sont pas tous validés par cette analyse.
- Comparaison structurelle des catalogues : anglais 523 clés, français 523 clés avec exactement les mêmes clés, espagnol 342 clés, soit 181 clés anglaises absentes du catalogue espagnol.
- Vérification de la sémantique Firestore : sans `orderBy`, une requête trie par identifiant de document ; trier ensuite le sous-ensemble côté client ne sélectionne pas les messages les plus récents. Source primaire : <https://firebase.google.com/docs/firestore/query-data/order-limit-data>.

## Bugs corrigés dans le code local pendant cet audit

| Priorité | Problème confirmé et preuve initiale | Correction |
|---|---|---|
| P2 | `src/components/FavoritesPage.js` appelait `onVanClick(van)` mais `src/App.js` montait le composant sans ce callback. Cliquer un favori provoquait une exception. | Navigation directe vers `/van/:id` lorsque le callback est absent ; le callback explicite reste compatible. |
| P2 | `FavoritesPage.js` utilisait uniquement `favorites.slice(0, 10)` sans pagination ni limite correspondante à l’ajout de favoris. Tous les favoris après le dixième restaient invisibles. | Requêtes par lots de 10 pour toute la liste ; les réponses d’un chargement dépassé ne remplacent plus le résultat courant. |
| P2 | `src/components/MessagingPage.js` utilisait `query(messagesRef, limit(100))` puis triait localement. Au-delà de 100 messages, les nouveaux pouvaient être exclus au profit d’autres identifiants. | Sélection des 100 derniers par `createdAt desc`, puis affichage chronologique. Le chargement de l’historique antérieur reste une fonctionnalité à prévoir. |
| P2 | La messagerie conservait la conversation sélectionnée et les messages en mémoire au changement d’utilisateur ; `prev || convos[0]` gardait la sélection du compte précédent. Les règles empêchaient une nouvelle lecture, mais ne vidaient pas le contenu déjà chargé. | Résultats liés à l’UID du lecteur et à la conversation ; affichage immédiat masqué quand l’identité change, état réinitialisé, résultat tardif de l’ancien utilisateur inaffichable. |
| P2 | `src/components/VanPage.js` modifiait directement `status` pour pause/vendu/réactivation, tandis que « Mes annonces » appelait le serveur. Réactiver depuis la fiche conservait les anciens champs de rappel/expiration et ne synchronisait pas les conversations. | Toutes ces actions passent par `setListingAvailability`, que le volet backend étend à `paused`. Le résultat confirmé par le serveur détermine l’état affiché. |
| P2 | Dans `src/App.js`, les notifications activaient `showMessagingPage`, mais aucun composant ne consommait cet état pour afficher la messagerie. | Un pont dans le routeur transforme cet état en navigation `/messages`, puis le réinitialise. Les anciens callbacks restent présents. |

Tests locaux ciblés exécutés : `npm test -- --watchAll=false --runInBand --silent --runTestsByPath src/components/FavoritesPage.test.js src/components/MessagingPage.test.js src/components/VanAvailability.test.js`.

Résultat : **3 suites, 11 tests réussis**. Couverture : 25 favoris, clic sans callback, réponse de favoris devenue obsolète, conversation de 101 messages, changement de compte avec résultat tardif, déconnexion, quatre transitions de statut et refus serveur. Les tests utilisent des identités et données fictives. Aucun envoi de message ou achat n’a été réalisé pour ces tests.

La publication de ces correctifs est coordonnée par l’audit principal ; ce fichier ne constitue pas une preuve de déploiement.

## Dysfonctionnements restant à traiter

| Priorité | Fichiers / preuve | Conséquence et proposition |
|---|---|---|
| P2 | `src/securityUtils.js:20` et `:34` encodent `&`, `<`, `>` avant stockage ; `src/components/AddVanForm.js:502`, `:511` réappliquent cet encodage à chaque enregistrement ; les textes sont ensuite rendus par React. Démonstration locale : `Tom & Jerry` devient `Tom &amp; Jerry`, puis `Tom &amp;amp; Jerry`. | Affichage d’entités HTML et corruption progressive des caractères à l’édition. Stocker du texte normal validé, laisser React/l’encodeur de sortie protéger l’affichage ; prévoir séparément la compatibilité des anciennes données. Ne pas décoder ni migrer les données en masse sans plan. |
| P3 — corrigé | Les appels à `common.loading`, `common.cancel` et `my_listings.sold` pouvaient afficher des clés brutes. | Les libellés communs ont été ajoutés aux trois catalogues et le statut vendu utilise désormais la clé existante `my_listings.status_sold`. |
| P3 | `src/locales/es/translation.json` : 181 clés en moins que EN/FR ; `src/i18n.js` propose pourtant `es` dans les langues prises en charge. Plusieurs écrans de messagerie, profil et formulaires utilisent aussi des textes anglais/français littéraux. | L’espagnol retombe sur l’anglais pour les clés manquantes ; la sélection FR ne traduit pas les textes littéraux. Traduire progressivement les parcours utiles avant de promettre une couverture complète. |
| P3 | `src/components/MessagingPage.js:50-94` écrit `users.lastSeen` et lit le document privé de l’interlocuteur. Les règles de confidentialité interdisent ce champ à l’écriture et la lecture du profil de l’autre utilisateur. | Indicateur de présence généralement « Offline », appels refusés masqués. Décider d’un modèle de présence minimal autorisé plutôt que d’ouvrir le profil complet. |
| P3 | `src/components/MessagingPage.js:107` initialise `isTyping` à `false`, mais aucun `setIsTyping` ne met à jour cet état. | L’indicateur « écrit… » ne peut pas s’activer malgré les écritures de `typing`. Synchroniser uniquement la présence de frappe autorisée avec la conversation ou retirer le comportement après accord. |
| P3 | `src/components/MessagingPage.js:264-265` ne traite que 50 messages non lus et ne retravaille ce lot qu’à la sélection de la conversation. La liste affichée est limitée aux 100 derniers, sans navigation vers l’historique. | Accusés de lecture incomplets au-delà d’un lot ; historique ancien inaccessible. Mettre en place un curseur et un traitement paginé si le besoin est confirmé. |
| P3 | `src/components/AddVanForm.js:177-202` convertit directement `imageFocusX/Y`, `imageZoom` et les coordonnées de `imageCrops` avec `Number(...)`. Les règles ne valident pas encore ces champs. Une map telle que `{toString:{}}` provoque `TypeError: Cannot convert object to primitive value`, hors du bloc qui intercepte les erreurs de chargement des coordonnées privées. | Une annonce contenant ce type de recadrage peut rester bloquée dans son éditeur. Valider et normaliser ces champs avant conversion, avec valeurs de repli et gestion d’erreur. Ces champs ne sont pas consommés par les cartes/fiches publiques : aucun crash public n’a été identifié via eux. Le contrôle des 94 annonces de production n’a trouvé aucun tableau d’images ni champ public sensible mal typé ; ce constat porte sur le corpus actuel et ne remplace pas la validation des nouvelles écritures. |
| P3 | `src/App.js` définit 20 routes sans route de repli `*`. | Une navigation interne SPA vers une URL inconnue peut afficher seulement l’en-tête et le pied de page. `middleware.js` sert déjà une vraie page HTTP 404 utile lors d’une entrée directe : ce comportement serveur est correct. Prévoir seulement un repli React cohérent. Aucun lien interne littéral non résolu n’a été trouvé. |

Les états UI de conversation `pending` / `resolved`, initialement refusés par les règles, sont traités par le volet règles de l’audit. Les coordonnées privées des vendeurs et les accès aux documents utilisateur relèvent également de ce volet.

## Candidats au nettoyage — accord requis avant toute suppression

Les 18 fichiers ci-dessous ne sont atteints par aucun des points d’entrée analysés. Les commentaires qui citent un module ne sont pas des imports effectifs. Les fichiers non suivis sont indiqués, car ils peuvent être du travail utilisateur en cours.

| Ensemble | Fichiers exacts | Confiance et dépendances / impact |
|---|---|---|
| Ancien paiement véhicule / Connect / réservations (7) | `src/components/PaymentSystem.js`, `src/components/StripeConnect.js`, `src/components/MyReservations.js`, `src/components/PaymentCallbacks.js`, `src/components/PhotoConfirmation.js`, `src/components/ReviewSystem.js`, `src/stripeConfig.js` | Élevée pour l’absence du parcours actuel. `PaymentSystem`/`PaymentCallbacks` utilisent `stripeConfig`, `MyReservations` utilise `PhotoConfirmation`. Les imports de reviews/Connect dans `UserProfile` sont commentés, tout comme leur rendu. Ne pas confondre avec les composants routés `ReservationSuccess.js`/`ReservationCancelled.js` ni avec les fonctions serveur toujours exportées. Supprimer doit être une décision explicite de retrait de fonctionnalité et inclure backend/tests/routes/documentation cohérents. |
| Ancienne messagerie (1) | `src/components/MessagingSystem.js` | Élevée : aucune référence active ; `MessagingPage.js` est le parcours courant. Vérifier les liens externes et la branche de travail avant suppression. |
| Ancienne navigation / langue / guides (4) | `src/components/MobileBottomNav.js`, `src/components/LanguageSelector.js`, `src/components/guides/GuideHowToBuy.jsx`, `src/components/guides/GuideLanguageSelector.jsx` | Élevée : pas d’import actif. `BottomNavigation.js`, `RegionSelector.js` et les pages de guides sont utilisés. Ne pas supprimer leurs remplaçants. |
| Badge / données de départ / doublon admin (3) | `src/components/SecurityBadge.js`, `src/seedData.js`, `src/adminHelper.js` | Élevée pour l’absence à l’exécution. Le helper utilisé est `src/utils/adminHelper.js`. `seedData.js` peut rester un outil manuel de développement ; sa suppression doit tenir compte de cet usage volontaire. |
| Fichiers utilisateur non suivis (3) | `src/constants/featuredGuide.js`, `src/firebaseExtras.js`, `src/utils/staticImageVariants.js` | Moyenne : pas d’import actif dans le dépôt principal, mais fichiers non suivis et potentiellement en préparation. Aucun retrait automatique. |

Autres ensembles à examiner séparément :

- **Ancienne modale « Mes vans »** : `src/components/MyVans.js` est encore déclaré en lazy import dans `src/App.js:47`, mais le binding `MyVans` n’est jamais utilisé/rendu (preuve via scope Babel). Candidat de confiance élevée, après retrait approuvé de l’import mort. Ce composant contient encore l’ancien `updateDoc` direct des statuts et la synchronisation cliente des conversations désormais refusée par les règles. `MyListingsPage.js` est le parcours actuel.
- **Sauvegardes et sorties temporaires suivies par Git** : `src/App.js.bak`, `tmp_prev_vancard.js`, `tmp_prev.json`, `ref_index.html`, `build_log.txt`, `build_log_final.txt`, `build_log_final_2.txt`, `structure.txt`. Aucune référence depuis les configurations de build, routes, API, fonctions ou scripts recherchés. Confiance élevée pour leur absence à l’exécution ; conserver dans l’historique Git si l’utilisateur approuve le nettoyage. Aucun contenu sensible de ces fichiers n’est reproduit ici.
- **Copie de projet non suivie `kiwivanmarket/`** : 152 fichiers et environ 16 Mio hors `node_modules`, `.git`, `build`. Cette copie n’est pas un point d’entrée du projet principal. Confiance moyenne sur l’inutilité : elle peut constituer une sauvegarde ou un travail distinct ; comparer avant de proposer une suppression.
- **Dépendances Stripe du frontend** : `@stripe/react-stripe-js` n’a aucun import actif identifié ; `@stripe/stripe-js` est importé uniquement depuis l’ancien `src/stripeConfig.js`, lui-même non atteint. L’achat de boost actuel redirige vers Checkout via une fonction serveur. Retrait possible après accord sur les modules historiques et réinstallation/build/tests ; la dépendance `stripe` des Functions est indispensable et doit rester.
- **Imports morts dans `src/App.js`** : notamment `AddVanForm`, `MyVans`, `NotificationBell`, `VanCard`, `GuidePreviewSection` et plusieurs icônes/helpers. Un import mort ne signifie pas que son fichier est inutilisé ailleurs : `AddVanForm` sert à l’édition, `VanCard` aux listes. Aucun retrait n’a été fait.
- **Deux interfaces de profil** : `ProfilePage.js` est routé et `UserProfile.js` est encore ouvert en modale par `App.js`. Ce sont deux parcours actifs ; ne supprimer aucun sans unification et tests préalables.
- **Deux branches de formulaire** : création dans `SellPage.js`, édition via `EditListingPage.js` / `AddVanForm.js`, plus une ancienne branche création dans `AddVanForm`. Ne pas supprimer le fichier entier : l’édition actuelle en dépend.
- **Fonctions serveur historiques** : le volet backend répertorie les endpoints Connect/dépôts, la migration de contacts et les rappels. Un frontend non atteint ne rend pas un endpoint serveur inaccessible ; inventorier et fermer les usages avant toute suppression.

## Fichiers qui ressemblent à des doublons mais doivent rester

- `src/setupTests.js` est une entrée implicite de Jest/CRA ; son absence du graphe d’imports de l’application ne prouve pas une inutilité.
- Les paires `src/data/seo/*.js` / `*.cjs` sont délibérément générées par `scripts/sync-seo-modules.cjs` pour partager les mêmes règles entre React et Node/Vercel. `src/data/seo/crawlers.js` est aussi importé par le middleware Edge.
- Les handlers `api/*.js`, `middleware.js`, les scripts de vérification/génération/migration et les fixtures de tests sont des entrées indépendantes ; l’absence d’import depuis `src/index.js` ne justifie pas leur suppression.
- `src/utils/boostVisibility.js` utilise actuellement CommonJS pour le partage navigateur/serveur et possède un test de bundle dédié. Il ne faut pas réintroduire des helpers ESM dans ce module sans vérifier le bundle CRA réel, à cause de la régression `rankVans is not a function` déjà rencontrée.
- `AGENTS.md`, les images et autres fichiers non suivis présents avant l’audit ne font pas partie d’un nettoyage autorisé.

## Limites

Le graphe statique ne découvre pas les appels externes par URL, les intégrations hors dépôt, les outils humains exécutés manuellement, les chemins calculés inconnus et les futures fonctionnalités en cours d’écriture. Le statut « candidat » ne signifie donc jamais « supprimable sans accord ». Les tests de ce volet ne prouvent pas un achat réel, un envoi d’email, un rendu authentifié dans tous les navigateurs ni l’absence absolue de vulnérabilités. Les limites et vérifications de production figurent dans le rapport principal.
