const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { JSDOM } = require('jsdom');

// Construit le chemin absolu vers le fichier HTML
const htmlFilePath = path.join(__dirname, 'index.html');

// Fonction pour générer un nombre entier aléatoire entre min et max (inclus)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction pour mettre à jour le fichier HTML avec l'horodatage des commits
function updateHtmlWithCommitInfo(commitCount) {
  const { window } = new JSDOM(fs.readFileSync(htmlFilePath, 'utf-8'));
  const { document } = window;

  // Obtient la date actuelle pour le résumé
  const today = new Date();
  const options = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  };
  const timestamp = today.toLocaleString('fr-FR', options);

  // Sélectionne l'élément avec l'ID commitsList
  const commitsList = document.querySelector('#commitsList');
  if (!commitsList) {
    console.error('L\'élément avec l\'ID "commitsList" est introuvable.');
    return;
  }

  // Crée un nouvel élément <li> pour représenter le résumé
  const newCommit = document.createElement('li');
  newCommit.textContent = `Commit quotidien du ${timestamp} avec ${commitCount} commits.`;

  // Ajoute l'élément <li> à la liste des commits avec une gestion plus contrôlée des sauts de ligne
  if (commitsList.lastChild) {
    commitsList.appendChild(document.createTextNode('\n    '));
  }
  commitsList.appendChild(newCommit);
  // Ajoute un retour à la ligne après le dernier élément <li> seulement si nécessaire
  commitsList.appendChild(document.createTextNode('\n  '));

  // Écrit le contenu modifié du DOM dans le fichier HTML
  fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML, 'utf-8');
}

// Fonction pour générer des commits quotidiens avec la date du jour
function generateCommits() {
  const commitCount = getRandomInt(1, 8); // Génère un nombre aléatoire de commits entre 1 et 8
  for (let i = 0; i < commitCount; i++) {
    // Ajoute une modification au fichier HTML pour garantir qu'il y ait quelque chose à commettre
    updateHtmlWithCommitInfo(commitCount);
    const today = new Date();
    const options = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    const commitMessage = `Commit quotidien du ${today.toLocaleString('fr-FR', options)}`;
    try {
      console.log('Adding changes...');
      execSync('git add .', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
      console.log('Committing...');
      execSync(`git commit -m "${commitMessage}"`, { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la commande :', err.message);
    }
  }
  return commitCount;
}

// Génère les commits et obtient le nombre de commits réalisés
const commitCount = generateCommits();

// Pousse les modifications vers la branche principale sur le dépôt distant
try {
  execSync('git push origin master', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
} catch (err) {
  console.error('Erreur lors du push :', err.message);
}
// Ferme le processus
process.exit();
