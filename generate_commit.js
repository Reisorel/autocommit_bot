const process = require('process');
process.chdir('/home/lerosier/Projet_autocommit');

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
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

// Fonction pour générer des commits quotidiens avec la date du jour
function generateCommits() {
  const commitCount = getRandomInt(1, 8); // Génère un nombre aléatoire de commits entre 1 et 8
  for (let i = 0; i < commitCount; i++) {
    const today = new Date();
    const options = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    // Génère un message de commit avec la date actuelle
    const commitMessage = `Commit quotidien du ${today.toLocaleString('fr-FR', options)}`;
    try {
      execSync('git add .', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
      execSync(`git commit -m "${commitMessage}"`, { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la commande :', err.message);
      console.error('stdout :', err.stdout ? err.stdout.toString() : 'Aucun stdout');
      console.error('stderr :', err.stderr ? err.stderr.toString() : 'Aucun stderr');
      throw err;
    }
  }
  return commitCount;
}

// Fonction pour ajouter le résumé des commits au DOM
function addCommitSummary(commitCount) {
  // Obtient la date actuelle pour le résumé
  const today = new Date();
  const options = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  };
  // Génère un message récapitulatif
  const summaryMessage = `Commit quotidien du ${today.toLocaleString('fr-FR', options)} avec ${commitCount} commits.`;

  // Sélectionne l'élément avec l'ID commitsList
  const commitsList = document.querySelector('#commitsList');
  // Crée un nouvel élément <li> pour représenter le résumé
  const newCommit = document.createElement('li');
  newCommit.textContent = summaryMessage;
  // Ajoute l'élément <li> à la liste des commits avec une gestion plus contrôlée des sauts de ligne
  if (commitsList.lastChild) {
    commitsList.appendChild(document.createTextNode('\n    '));
  }
  commitsList.appendChild(newCommit);
  // Ajoute un retour à la ligne après le dernier élément <li> seulement si nécessaire
  commitsList.appendChild(document.createTextNode('\n  '));
}

// Génère les commits et obtient le nombre de commits réalisés
const commitCount = generateCommits();
// Ajoute le résumé des commits au fichier HTML
addCommitSummary(commitCount);
// Enregistre le fichier HTML modifié
fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML); // Écrit le contenu modifié du DOM dans le fichier HTML
// Pousse les modifications vers la branche principale sur le dépôt distant
try {
  execSync('git push origin master', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
} catch (err) {
  console.error('Erreur lors du push :', err.message);
  console.error('stdout :', err.stdout ? err.stdout.toString() : 'Aucun stdout');
  console.error('stderr :', err.stderr ? err.stderr.toString() : 'Aucun stderr');
  throw err;
}
// Ferme le processus
process.exit();
