# Bot d'Autocommit

Ce projet est un **bot d'autocommit** conçu pour automatiser les commits de code dans un dépôt Git en utilisant diverses technologies telles que SSH, JSDOM, JavaScript, et crontab. Le bot est conçu pour effectuer des commits réguliers et mettre à jour un fichier HTML avec des informations de commit (date du jour et nmombre de commits généré aléatoirement).

## Fonctionnalités

- **Automatisation des Commits** : Effectue des commits automatiquement dans un dépôt Git avec un message de commit généré dynamiquement.
- **Gestion des Fichiers HTML** : Utilise JSDOM pour manipuler le DOM d'un fichier HTML afin d'ajouter des informations de commit telles que le nombre de commits et l'horodatage.
- **Interaction avec Git** : Intègre les commandes Git pour ajouter des fichiers au stage, créer des commits avec des messages spécifiques, et pousser les modifications vers un dépôt distant.
- **Déploiement Cron** : Utilise crontab pour exécuter le script de manière planifiée, assurant des commits réguliers selon un intervalle défini.
- **Sécurité SSH** : Emploie SSH pour interagir avec le dépôt Git de manière sécurisée, garantissant que les opérations sont effectuées de manière protégée.

## Technologies Utilisées

- **JavaScript** : Langage principal pour le développement du script d'autocommit.
- **JSDOM** : Utilisé pour manipuler le DOM d'un fichier HTML côté serveur.
- **Git** : Pour gérer les commits et les mises à jour du dépôt distant.
- **SSH** : Pour des interactions sécurisées avec le dépôt Git.
- **Crontab** : Pour planifier l'exécution du script de manière régulière.
