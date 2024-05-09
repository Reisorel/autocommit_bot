const process = require('process');
process.chdir('/home/lerosier/Projet_autocommit');

// Importe le module fs (File System) de Node.js pour interagir avec les fichiers
const fs = require('fs');
// Importe le module path de Node.js pour gérer les chemins de fichiers
const path = require('path');
// Importe la classe JSDOM du module jsdom pour manipuler le DOM HTML côté serveur
const { JSDOM } = require('jsdom');
// Importe la fonction execSync du module child_process pour exécuter des commandes système synchrones
const { execSync } = require('child_process');

// Charge le fichier HTML
// Construit le chemin absolu vers le fichier HTML
const htmlFilePath = path.join(__dirname, 'index.html');
// Lit le contenu du fichier HTML en utilisant utf-8 comme encodage
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// Crée un objet JSDOM avec le contenu HTML
// Crée une instance JSDOM avec le contenu HTML pour manipuler le DOM
const { window } = new JSDOM(htmlContent);

// Obtenir le document à partir de la fenêtre
// Récupère l'objet document du DOM à partir de la fenêtre JSDOM
const { document } = window;

// Fonction pour générer un commit quotidien avec la date du jour
function generateCommit() {
  // Obtient la date actuelle
  const today = new Date();
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  };


  // Génère un message de commit avec la date actuelle
  const commitMessage = "Commit quotidien du " + today.toLocaleDateString('fr-FR');
  // Appelle la fonction addCommit pour ajouter le commit à la liste
  addCommit(commitMessage);
}

// Fonction pour ajouter un commit à la liste
function addCommit(commitMessage) {
  // Sélectionne l'élément <ul> qui contient la liste des commits
  const commitsList = document.querySelector('#commitsList');
  // Crée un nouvel élément <li> pour représenter le commit
  const newCommit = document.createElement('li');
  // Définit le texte du commit comme contenu de l'élément <li>
  newCommit.textContent = commitMessage;
  // Ajoute l'élément <li> à la liste des commits
  commitsList.appendChild(newCommit);
  // Ajoute un retour à la ligne après chaque élément <li> dans le HTML
  commitsList.appendChild(document.createTextNode('\n'+'    '));
}

generateCommit(); // Appelle la fonction pour générer un commit quotidien

// Enregistrer le fichier HTML modifié
fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML); // Écrit le contenu modifié du DOM dans le fichier HTML

// Ajouter tous les fichiers modifiés à l'index
// Ajoute tous les fichiers modifiés à l'index Git
execSync('git add .', { cwd: '/home/lerosier/Projet_autocommit' });

// Effectuer le commit avec un message prédéfini
// Effectue un commit avec le message "Auto commit"
execSync('git commit -m "Auto commit"', { cwd: '/home/lerosier/Projet_autocommit' });

// Pousser vers GitHub sur la branche principale (assumant que le remote est nommé "origin" et la branche est "main" ou "master")
// Pousse les modifications vers la branche principale sur le dépôt distant
execSync('git push origin master', { cwd: '/home/lerosier/Projet_autocommit' });

// Fermer le processus
process.exit(); // Termine le processus Node.js
