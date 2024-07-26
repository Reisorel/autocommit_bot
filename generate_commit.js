// Importe le module process pour changer le répertoire de travail
const process = require('process');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { execSync } = require('child_process');

try {
  // Changer le répertoire de travail
  process.chdir('/home/lerosier/Projet_autocommit');
  console.log('Répertoire de travail changé avec succès.');
} catch (error) {
  console.error(`Erreur lors du changement de répertoire de travail: ${error.message}`);
  process.exit(1);
}

// Construit le chemin absolu vers le fichier HTML
const htmlFilePath = path.join(__dirname, 'index.html');

let htmlContent;
try {
  // Lit le contenu du fichier HTML
  htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  console.log('Contenu du fichier HTML lu avec succès.');
} catch (error) {
  console.error(`Erreur lors de la lecture du fichier HTML: ${error.message}`);
  process.exit(1);
}

let window, document;
try {
  // Crée une instance JSDOM avec le contenu HTML
  ({ window } = new JSDOM(htmlContent));
  document = window.document;
  console.log('Instance JSDOM créée avec succès.');
} catch (error) {
  console.error(`Erreur lors de la création de JSDOM: ${error.message}`);
  process.exit(1);
}

// Fonction pour générer un nombre entier aléatoire entre min et max (inclus)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction pour ajouter le commit au DOM
function addCommit(commitMessage) {
  try {
    const commitsList = document.querySelector('#commitsList');
    if (!commitsList) {
      throw new Error('Element #commitsList non trouvé dans le DOM');
    }
    const newCommit = document.createElement('li');
    newCommit.textContent = commitMessage;
    if (commitsList.lastChild) {
      commitsList.appendChild(document.createTextNode('\n    '));
    }
    commitsList.appendChild(newCommit);
    commitsList.appendChild(document.createTextNode('\n  '));
    console.log(`Commit ajouté au DOM: ${commitMessage}`);
  } catch (error) {
    console.error(`Erreur lors de l'ajout du commit au DOM: ${error.message}`);
    process.exit(1);
  }
}

// Fonction pour ajouter une ligne d'horodatage et le nombre de commits dans le fichier HTML
function addCommitInfoToHtml(commitCount) {
  try {
    const today = new Date();
    const options = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    const commitMessage = `Commit quotidien du ${today.toLocaleString('fr-FR', options)} avec ${commitCount} commits.`;
    addCommit(commitMessage);
  } catch (error) {
    console.error(`Erreur lors de l'ajout des informations de commit au HTML: ${error.message}`);
    process.exit(1);
  }
}

// Fonction pour effectuer les commits Git
function performGitCommits(commitCount) {
  try {
    for (let i = 0; i < commitCount; i++) {
      const today = new Date();
      const options = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      };
      const commitMessage = `Commit quotidien du ${today.toLocaleString('fr-FR', options).replace(/"/g, '\\"')}`;

      console.log(`Ajout des fichiers pour commit ${i + 1}...`);
      execSync('git add .', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });

      // Vérifier si des fichiers sont en attente de commit
      console.log('Vérification de l\'état du dépôt avant commit...');
      execSync('git status', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });

      console.log(`Création du commit ${i + 1} avec le message: "${commitMessage}"`);
      try {
        execSync(`git commit -m "${commitMessage}"`, { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
      } catch (commitError) {
        console.error(`Erreur lors du commit ${i + 1}: ${commitError.message}`);
        console.error(`Stack: ${commitError.stack}`);
        throw commitError; // Rethrow to ensure the outer catch handles it
      }
    }

    console.log('Poussée des modifications...');
    execSync('git push origin master', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
    console.log('Modifications poussées avec succès.');
  } catch (error) {
    console.error(`Erreur lors de la réalisation des commits Git: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
}


// Détermine le nombre de commits à faire
const commitCount = getRandomInt(1, 8);
console.log(`Nombre de commits à réaliser: ${commitCount}`);

// Ajoute les informations de commit dans le fichier HTML
addCommitInfoToHtml(commitCount);

try {
  // Enregistre le fichier HTML modifié
  fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);
  console.log('Fichier HTML enregistré avec succès.');
} catch (error) {
  console.error(`Erreur lors de l'enregistrement du fichier HTML: ${error.message}`);
  process.exit(1);
}

// Effectue les commits Git
performGitCommits(commitCount);

// Ferme le processus
console.log('Processus terminé.');
process.exit();
