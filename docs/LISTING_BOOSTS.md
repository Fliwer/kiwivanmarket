# Mise en avant des annonces

Implémentation du 14 octobre 2026. Deux paiements uniques en NZD : 30 NZD pour 14 jours (`fortnight`), 50 NZD pour 28 jours (`month`). Les montants sont imposés par `functions/boostService.js`. Aucun abonnement et aucun transfert au vendeur.

## Parcours

Dans **Mes annonces**, le propriétaire d'une annonce active sélectionne « Mettre en avant ». Le serveur vérifie le compte, l'email vérifié et la propriété de l'annonce, réserve une commande et crée une session Stripe Checkout. Le prix, la durée et les URL de retour proviennent du serveur.

Une seule commande Checkout est ouverte par annonce. Une session peut être reprise ou annulée ; des demandes simultanées réutilisent la même commande et la même clé d'idempotence Stripe. Un boost actif ne peut pas être racheté avant son expiration.

Le webhook signé vérifie la session, le montant exact, la devise, le mode test/réel et l'identité de commande. Une transaction attribue le boost une seule fois et conserve le traitement de l'événement. Le retour navigateur peut également rapprocher la commande avec Stripe côté serveur, sans considérer l'URL de succès comme une preuve de paiement.

Si l'annonce est vendue ou supprimée pendant Checkout, le paiement confirmé est remboursé automatiquement au lieu d'activer une prestation indisponible. Un remboursement intégral désactive le boost. Un litige suspend sa visibilité ; le résultat courant du litige est relu dans Stripe pour résister à une livraison désordonnée des notifications. Un résultat favorable rétablit uniquement la durée restante, jamais une nouvelle période gratuite.

## Affichage et disponibilité

- La priorité s'applique après les filtres, sur l'accueil et les pages ville, marque et recherche. Les annonces sponsorisées alternent toutes les cinq minutes. Les annonces vendues n'ont aucune priorité.
- Le badge indique « Annonce sponsorisée ». Les anciens favoris éditoriaux `featured` sont distincts ; un vendeur ne peut pas modifier ce champ.
- Les dates de début et de fin sont protégées par les règles Firestore. Le contrôle de date retire la priorité dès l'expiration à la prochaine actualisation de l'affichage (toutes les dix secondes) ; la tâche horaire met aussi à jour le registre des commandes.
- L'achat confirme la disponibilité. Le nettoyage quotidien ignore les boosts actifs. La période continue de courir si le vendeur choisit de masquer ou de marquer son annonce vendue ; revenir en ligne ne décale pas sa date de fin. Les jours restants ne sont pas prolongés automatiquement. Les demandes de remboursement sont dirigées vers Contact.
- La réactivation d'une annonce en pause dans Mes annonces confirme maintenant sa disponibilité côté serveur, afin qu'elle ne soit pas remise en pause immédiatement.

## État actuel et ouverture réelle

Les paiements réels sont **désactivés par défaut** par `BOOST_PAYMENTS_LIVE_ENABLED=false`. Les tests nécessitent un compte administrateur propriétaire de l'annonce. Les boosts de test sont visibles dans son espace, mais **ne donnent aucune priorité publique** : les listes exigent `boostLivemode=true`.

Le contrôle de configuration a constaté une clé de test différente de l'ancienne clé exposée, un compte Stripe situé en Belgique avec `charges_enabled=false` et `details_submitted=false`. Deux sessions de test aux tarifs 30/50 NZD ont été acceptées par Stripe puis immédiatement expirées, sans paiement. Le webhook de test existant a été configuré pour :

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

Avant l'ouverture : terminer la validation du compte dans Stripe, confirmer les conditions de remboursement et la présentation fiscale des prix, terminer les essais de paiement réel simulé dans le sandbox, puis configurer **les secrets live et le webhook live ensemble**. Le pays du compte, la devise de présentation NZD et les conditions de conversion/versement doivent être vérifiés dans Stripe.

Rotation du 15 octobre 2026 : l'ancienne clé exposée conservée en version 1 est refusée par Stripe (HTTP 401). La nouvelle clé de test est enregistrée dans `STRIPE_SECRET_KEY`, version 3. Elle appartient à un environnement Stripe différent de la version 2 : le webhook correspondant utilise donc aussi `STRIPE_WEBHOOK_SECRET`, version 3. Les dix fonctions consommatrices ont été redéployées et vérifiées sur ces versions. Une notification de contrôle signée est acceptée par le serveur et une signature invalide est refusée (HTTP 400). Les versions 1 et 2 des deux secrets sont **désactivées**, sans destruction. Les trois anciens webhooks de test vers ce serveur sont désactivés pour éviter les doublons et signatures incompatibles. Les sessions 30/50 NZD ont été recréées puis expirées avec la nouvelle clé ; aucun paiement effectué. Désactiver une version dans Google ne révoque pas la clé côté Stripe : la clé de l'ancien environnement en version 2 reste distincte de la clé exposée et n'a pas été révoquée par cette opération.

Après ces validations seulement, définir `BOOST_PAYMENTS_LIVE_ENABLED=true` dans l'environnement des Functions et redéployer `getBoostPlans` et `createBoostCheckout`. Lors du passage à une clé live, les appels de rapprochement/remboursement test ne doivent pas continuer sur des commandes test : finir/expirer les essais avant de basculer. Les fonctions historiques d'acompte/Connect restent bloquées en mode réel et ne font pas partie de cette offre.

## Contrôles et exploitation

`boostOrders` contient le registre privé : `pending`, `active`, `cancelled`, `expired`, `refunded`, `refund_pending`, `disputed` ou `paid_unavailable`. Les vendeurs peuvent lire leurs commandes, jamais les écrire. Toute commande `refund_pending` ou `paid_unavailable` doit être suivie jusqu'à son remboursement ; l'identifiant PaymentIntent reste conservé.

Commandes :

```text
node --test scripts/boost.test.cjs scripts/security.test.cjs scripts/lifecycle-token.test.cjs
npm test -- --watchAll=false --runInBand --silent
node scripts/security-firebase-checks.cjs
node scripts/check-boost-stripe.cjs
```

Le script Stripe affiche seulement les états de configuration. `--verify-checkout` crée puis expire les sessions de validation **uniquement en test**. `--configure-test-webhook` ajoute les événements nécessaires au seul endpoint existant du site, sans remplacer son secret de signature et sans modifier de webhook live.

Le 15 octobre 2026, le propriétaire a terminé un paiement fictif dans Checkout depuis le site. Vérification directe Stripe et Firestore : 50 NZD, 28 jours, session `paid`, commande et boost `active`, `livemode=false`, événement `checkout.session.completed` enregistré par le webhook et aucun webhook en attente. Période de test du 15 octobre au 12 novembre 2026. Le boost reste exclu de la priorité publique grâce à `boostLivemode=false`. Les scénarios complets d'annulation, de refus et de remboursement restent à exercer dans le sandbox ; les tests automatisés correspondants utilisent des doubles de Stripe/Firestore.

Le dernier rappel de disponibilité utilise aussi `private/lifecycle`, conserve uniquement les jetons privés et ignore les boosts actifs. Les jetons publics réintroduits par l'ancien rappel ont été retirés ; ils ne sont jamais repris comme jetons privés valides. Les anciens liens concernés nécessitent une connexion via Mes annonces.
