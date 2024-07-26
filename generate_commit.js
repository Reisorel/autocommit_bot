const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { execSync } = require('child_process');

// Change le répertoire de travail
try {
  process.chdir('/home/lerosier/Projet_autocommit');
  console.log('Répertoire de travail changé avec succès.');
} catch (error) {
  console.error(`Erreur lors du changement de répertoire de travail: ${error.message}`);
  process.exit(1);
}

// Chemin du fichier HTML
const htmlFilePath = path.join(__dirname, 'index.html');

// Lit le contenu du fichier HTML
let htmlContent;
try {
  htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  console.log('Contenu du fichier HTML lu avec succès.');
} catch (error) {
  console.error(`Erreur lors de la lecture du fichier HTML: ${error.message}`);
  process.exit(1);
}

// Crée une instance JSDOM
let window, document;
try {
  ({ window } = new JSDOM(htmlContent));
  document = window.document;
  console.log('Instance JSDOM créée avec succès.');
} catch (error) {
  console.error(`Erreur lors de la création de JSDOM: ${error.message}`);
  process.exit(1);
}

// Fonction pour obtenir une date au format spécifié
function formatDate(date) {
  const options = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  };
  return date.toLocaleString('fr-FR', options).replace(/"/g, '\\"');
}

// Fonction pour générer un nombre aléatoire entre min et max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction pour ajouter un commit au DOM
function addCommit(commitMessage) {
  // Sélectionne l'élément avec l'ID "commitsList"
  const commitsList = document.querySelector('#commitsList');

  // Crée un nouvel élément <li> pour représenter le commit
  const newCommit = document.createElement('li');
  newCommit.textContent = commitMessage;

  // Ajoute l'élément <li> à la liste des commits
  commitsList.appendChild(newCommit);

  // Ajoute un retour à la ligne après chaque élément <li> pour améliorer la présentation
  commitsList.appendChild(document.createTextNode('\n\n'));
}

// Fonction pour effectuer les commits Git sur le dépôt distant 
function performGitCommits(commitMessage) {
  try {
    console.log('Ajout des fichiers pour le commit...');
    execSync('git add .', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });

    console.log('Vérification de l\'état du dépôt avant commit...');
    execSync('git status', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });

    console.log(`Création du commit avec le message: "${commitMessage}"`);
    execSync(`git commit -m "${commitMessage}"`, { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });

    console.log('Poussée des modifications...');
    execSync('git push origin master', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
    console.log('Modifications poussées avec succès.');
  } catch (error) {
    console.error(`Erreur lors de la réalisation du commit: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
}

// Fonction pour nettoyer le HTML en gardant un seul <li> par jour
function cleanCommitInfo() {
  try {
    const commitsList = document.querySelector('#commitsList');
    if (!commitsList) {
      throw new Error('Element #commitsList non trouvé dans le DOM');
    }

    const commits = Array.from(commitsList.querySelectorAll('li'));
    const commitsByDate = {};

    // Regroupe les commits par date
    commits.forEach(commit => {
      const textContent = commit.textContent;
      const dateMatch = textContent.match(/^Commit quotidien du (.+?) à/);
      if (dateMatch) {
        const dateKey = dateMatch[1];
        if (!commitsByDate[dateKey]) {
          commitsByDate[dateKey] = { count: 0, lastCommit: textContent };
        }
        commitsByDate[dateKey].count++;
        commitsByDate[dateKey].lastCommit = textContent; // Conserve le dernier commit du jour
      }
    });

    // Construit la liste finale des commits
    commitsList.innerHTML = '';
    Object.values(commitsByDate).forEach(({ count, lastCommit }) => {
      // Modifie le texte du dernier commit pour inclure le nombre total de commits
      const finalCommit = lastCommit.replace(/avec \d+ commits\./, `avec ${count} commits.`);
      const li = document.createElement('li');
      li.textContent = finalCommit;
      commitsList.appendChild(li);
      commitsList.appendChild(document.createTextNode('\n\n'));
    });

    console.log('HTML nettoyé pour ne conserver qu\'un seul <li> par jour avec le nombre total de commits.');
  } catch (error) {
    console.error(`Erreur lors du nettoyage du HTML: ${error.message}`);
    process.exit(1);
  }
}

// Détermine le nombre de commits à faire pour chaque ajout (entre 1 et 8)
const commitCount = getRandomInt(1, 8);
console.log(`Nombre de commits à réaliser pour chaque ajout: ${commitCount}`);

// Ajoute et commite chaque horodatage
for (let i = 0; i < commitCount; i++) {
  const today = new Date();
  const commitMessage = `Commit quotidien du ${formatDate(today)} avec ${commitCount} commits`;

  addCommit(commitMessage);

  try {
    fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);
    console.log('Fichier HTML enregistré avec succès.');

    // Effectue le commit
    performGitCommits(commitMessage);
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du fichier HTML ou du commit: ${error.message}`);
    process.exit(1);
  }
}

// Nettoie les horodatages superflus
cleanCommitInfo();

try {
  // Enregistre le fichier HTML modifié après nettoyage
  fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);
  console.log('Fichier HTML enregistré après nettoyage avec succès.');
} catch (error) {
  console.error(`Erreur lors de l'enregistrement du fichier HTML après nettoyage: ${error.message}`);
  process.exit(1);
}

// Ferme le processus
console.log('Processus terminé.');
process.exit();
