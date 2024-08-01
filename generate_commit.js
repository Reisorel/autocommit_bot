const fs = require('fs'); // Module Node.js pour interagir avec le système de fichiers
const path = require('path'); // Module Node.js pour manipuler les chemins de fichiers et de répertoires
const { JSDOM } = require('jsdom'); // Module jsdom pour simuler un environnement DOM dans Node.js
const { execSync } = require('child_process'); // Module Node.js pour exécuter des commandes shell de manière synchrone

// Change le répertoire de travail vers '/home/lerosier/Projet_autocommit'
try {
  process.chdir('/home/lerosier/Projet_autocommit');
  console.log('Répertoire de travail changé avec succès.');
} catch (error) {
  console.error(`Erreur lors du changement de répertoire de travail: ${error.message}`);
  process.exit(1);
}

// Construit le chemin complet vers le fichier 'index.html' dans le répertoire courant
const htmlFilePath = path.join(process.cwd(), 'index.html');

// Lit le fichier 'index.html' de manière synchrone en utilisant l'encodage 'utf-8'
let htmlContent;
try {
  htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  console.log('Contenu du fichier HTML lu avec succès.');
} catch (error) {
  console.error(`Erreur lors de la lecture du fichier HTML: ${error.message}`);
  process.exit(1);
}

// Crée une nouvelle instance JSDOM pour simuler un DOM sur l'environnement Node.
let window, document;
try {
  ({ window } = new JSDOM(htmlContent));
  document = window.document;
  console.log('Instance JSDOM créée avec succès.');
} catch (error) {
  console.error(`Erreur lors de la création de JSDOM: ${error.message}`);
  process.exit(1);
}

// Fonction génération date du jour
function formatDate(date) {
  const options = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  };
  return date.toLocaleString('fr-FR', options).replace(/"/g, '\\"');
}

// Fonction génération nombre aléatoire entre min et max inclus
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction de génération de nombre aléatoire biaisé (66% de chance d'obtenir 2 ou 3; 33% une valeur entre 0 et 6 inclus)
function getBiasedRandomInt() {
  const random = Math.random();
  if (random < 0.66) {
    return Math.random() < 0.5 ? 2 : 3;
  }
  return getRandomInt(0, 6);
}

// Fonction d'ajout d'un commit au DOM
function addCommit(commitMessage) {
  const commitsList = document.querySelector('#commitsList');
  if (!commitsList) {
    console.error('Erreur : Élément #commitsList non trouvé dans le DOM');
    return;
  }
  const newCommit = document.createElement('li');
  newCommit.textContent = commitMessage;
  commitsList.appendChild(newCommit);
  // Ajoute un retour à la ligne pour chaque élément
  commitsList.appendChild(document.createTextNode('\n'));

  // Log du dernier commit ajouté
  console.log(`Commit ajouté : ${commitMessage}`);
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

// Fonction de nettoyage de l'archive pour ne conserver qu'un seul <li> par jour avec le nombre total de commits
function cleanCommitInfo() {
  try {
    const commitsList = document.querySelector('#commitsList');
    if (!commitsList) {
      throw new Error('Element #commitsList non trouvé dans le DOM');
    }

    const commits = Array.from(commitsList.querySelectorAll('li'));
    const commitsByDate = {};

    commits.forEach(commit => {
      const textContent = commit.textContent;
      const dateMatch = textContent.match(/^Commit quotidien du (.+?) à/);
      if (dateMatch) {
        const dateKey = dateMatch[1];
        // Initialisation correcte
        if (!commitsByDate[dateKey]) {
          // Initialisation de l'objet pour cette date avec 1 commit déjà compté
          commitsByDate[dateKey] = { count: 1, lastCommit: textContent };
        } else {
          // Incrémentation du compteur si la date est déjà présente
          commitsByDate[dateKey].count++;
        }
      }
    });

    commitsList.innerHTML = '';

    Object.values(commitsByDate).forEach(({ count, lastCommit }) => {
      // Remplacement du texte avec le nombre correct de commits
      const finalCommit = lastCommit.replace(/avec \d+ commits?\.?/, `avec ${count} commits.`);
      const li = document.createElement('li');
      li.textContent = finalCommit;
      commitsList.appendChild(li);
      commitsList.appendChild(document.createTextNode('\n')); // Ajouter une nouvelle ligne après chaque commit

      // Log du dernier commit nettoyé
      console.log(`Commit finalisé pour la journée : ${finalCommit}`);
    });

    console.log('HTML nettoyé pour ne conserver qu\'un seul <li> par jour avec le nombre total de commits.');
  } catch (error) {
    console.error(`Erreur lors du nettoyage du HTML: ${error.message}`);
    process.exit(1);
  }
}

// Utilise getBiasedRandomInt pour déterminer le nombre de commits
const commitCount = getBiasedRandomInt();
console.log(`Nombre de commits à réaliser pour chaque ajout: ${commitCount}`);

// Réalise les commits, sauf le dernier qui sera un commit de nettoyage (-1) ici
for (let i = 0; i < commitCount - 1; i++) {
  const today = new Date();
  const commitMessage = `Commit quotidien du ${formatDate(today)} avec ${commitCount} commits.`;

  // Ajoute le commit au DOM
  addCommit(commitMessage);

  try {
    // Enregistre le fichier HTML modifié
    fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML, 'utf-8');
    console.log('Fichier HTML enregistré avec succès.');
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du fichier HTML: ${error.message}`);
    process.exit(1);
  }

  // Effectue le commit avec le message spécifié
  performGitCommits(commitMessage);
}

// Appel de la fonction de nettoyage des commits avant le dernier commit
cleanCommitInfo();

try {
  // Enregistre le fichier HTML modifié après nettoyage
  fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML, 'utf-8');
  console.log('Fichier HTML enregistré après nettoyage avec succès.');

  // Affichage du contenu du DOM juste avant la sauvegarde finale
  console.log('Contenu final du fichier HTML:\n', window.document.documentElement.outerHTML);

  // Création du message de commit pour le nettoyage
  const today = new Date();
  const commitMessage = `Commit quotidien du ${formatDate(today)} avec ${commitCount} commits.`;

  // Effectue le dernier commit avec le message de nettoyage
  performGitCommits(commitMessage);

  // Log indiquant que l'archive du jour a été inscrite
  console.log('L\'archive du jour a été inscrite dans le fichier HTML.');
} catch (error) {
  console.error(`Erreur lors de l'enregistrement du fichier HTML après nettoyage: ${error.message}`);
  process.exit(1);
}

console.log('Processus terminé.');
process.exit();
