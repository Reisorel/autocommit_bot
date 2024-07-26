// Importe le module process pour changer le répertoire de travail
const process = require('process');
process.chdir('/home/lerosier/Projet_autocommit');

// Importe le module fs (File System) pour interagir avec les fichiers
const fs = require('fs');
// Importe le module path pour gérer les chemins de fichiers
const path = require('path');
// Importe la classe JSDOM du module jsdom pour manipuler le DOM HTML côté serveur
const { JSDOM } = require('jsdom');
// Importe la fonction execSync du module child_process pour exécuter des commandes système synchrones
const { execSync } = require('child_process');

// Construit le chemin absolu vers le fichier HTML
const htmlFilePath = path.join(__dirname, 'index.html');
// Lit le contenu du fichier HTML en utilisant utf-8 comme encodage
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
// Crée une instance JSDOM avec le contenu HTML pour manipuler le DOM côté serveur
const { window } = new JSDOM(htmlContent);
// Récupère l'objet document du DOM à partir de la fenêtre JSDOM
const { document } = window;

// Fonction pour générer un nombre entier aléatoire entre min et max (inclus)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction pour ajouter le commit au DOM
function addCommit(commitMessage) {
  // Sélectionner l'ID commitList
  const commitsList = document.querySelector('#commitsList');
  // Crée un nouvel élément <li> pour représenter le commit
  const newCommit = document.createElement('li');
  newCommit.textContent = commitMessage;
  // Ajoute l'élément <li> à la liste des commits avec une gestion plus contrôlée des sauts de ligne
  if (commitsList.lastChild) {
    commitsList.appendChild(document.createTextNode('\n    '));
  }
  commitsList.appendChild(newCommit);
  // Ajoute un retour à la ligne après le dernier élément <li> seulement si nécessaire
  commitsList.appendChild(document.createTextNode('\n  '));
}

// Fonction pour ajouter une ligne d'horodatage et le nombre de commits dans le fichier HTML
function addCommitInfoToHtml(commitCount) {
  // Obtient la date actuelle
  const today = new Date();
  const options = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  };
  // Génère le message d'horodatage
  const commitMessage = `Commit quotidien du ${today.toLocaleString('fr-FR', options)} avec ${commitCount} commits.`;

  // Ajoute le commit au DOM en utilisant la fonction addCommit
  addCommit(commitMessage);
}

// Fonction pour effectuer les commits Git
function performGitCommits(commitCount) {
  for (let i = 0; i < commitCount; i++) {
    // Obtient la date actuelle
    const today = new Date();
    const options = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    // Crée le message de commit
    const commitMessage = `Commit quotidien du ${today.toLocaleString('fr-FR', options)}`;
    // Effectue le commit avec le message généré
    execSync('git add .', { cwd: '/home/lerosier/Projet_autocommit' });
    execSync(`git commit -m "${commitMessage}"`, { cwd: '/home/lerosier/Projet_autocommit' });
  }
  // Pousse les modifications vers le dépôt distant
  execSync('git push origin master', { cwd: '/home/lerosier/Projet_autocommit' });
}

// Détermine le nombre de commits à faire
const commitCount = getRandomInt(1, 8); // Génère un nombre aléatoire de commits entre 1 et 8

// Ajoute les informations de commit dans le fichier HTML
addCommitInfoToHtml(commitCount);

// Enregistre le fichier HTML modifié
fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);

// Effectue les commits Git
performGitCommits(commitCount);

// Ferme le processus
process.exit();
