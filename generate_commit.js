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
const htmlFilePath = path.join(__dirname, 'index.html');

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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
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
  const newCommit = document.createElement('li');
  newCommit.textContent = commitMessage;
  commitsList.appendChild(newCommit);
  // Assurer une ligne vide après chaque entrée
  commitsList.appendChild(document.createTextNode('\n\n'));
}

// Fonction pour effectuer les commits Git sur le dépôt distant
function performGitCommits(commitMessage) {
  try {
    console.log('Ajout des fichiers pour le commit...');
    execSync('git add .', {
      cwd: '/home/lerosier/Projet_autocommit',
      stdio: 'inherit'
    });

    console.log("Vérification de l'état du dépôt avant commit...");
    execSync('git status', {
      cwd: '/home/lerosier/Projet_autocommit',
      stdio: 'inherit'
    });

    console.log(`Création du commit avec le message: "${commitMessage}"`);
    execSync(`git commit -m "${commitMessage}"`, {
      cwd: '/home/lerosier/Projet_autocommit',
      stdio: 'inherit'
    });

    console.log('Poussée des modifications...');
    execSync('git push origin master', {
      cwd: '/home/lerosier/Projet_autocommit',
      stdio: 'inherit'
    });
    console.log('Modifications poussées avec succès.');
  } catch (error) {
    console.error(`Erreur lors de la réalisation du commit: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
}

// Fonction de nettoyage de l'archive pour regrouper tous les commits du jour actuel en un seul avec le nombre total de commits
function cleanCommitInfo() {
  try {
    const commitsList = document.querySelector('#commitsList');
    if (!commitsList) {
      throw new Error('Element #commitsList non trouvé dans le DOM');
    }

    const commits = Array.from(commitsList.querySelectorAll('li'));
    if (commits.length === 0) return;

    // Récupérer la date actuelle sans l'heure pour comparer les commits du jour
    const today = new Date();
    const todayString = today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Filtrer tous les commits du jour courant
    const todayCommits = commits.filter((commit) =>
      commit.textContent.includes(`Commit quotidien du ${todayString}`)
    );

    if (todayCommits.length > 0) {
      // Compter le nombre de commits réalisés ce jour
      const commitCount = todayCommits.length;

      // Conserver le dernier commit et mettre à jour son message avec le nombre total de commits
      const lastCommit = todayCommits[todayCommits.length - 1];
      lastCommit.textContent = `Commit quotidien du ${todayString} à ${today.toLocaleTimeString('fr-FR')} avec ${commitCount} commits.`;

      // Supprimer les autres commits du jour pour n'en garder qu'un seul
      todayCommits.slice(0, -1).forEach((commit) => commit.remove());

      // Supprimer les nœuds texte supplémentaires après le dernier commit du jour
      let nextNode = lastCommit.nextSibling;
      while (nextNode && nextNode.nodeType === 3) { // Vérifie si c'est un nœud texte
        commitsList.removeChild(nextNode);
        nextNode = lastCommit.nextSibling;
      }

      // Ajouter un seul saut de ligne après le dernier commit du jour
      commitsList.appendChild(document.createTextNode('\n\n'));

      // Supprimer les sauts de ligne en trop entre le dernier commit du jour courant et le commit du jour précédent
      if (lastCommit.previousElementSibling) {
        let prevNode = lastCommit.previousElementSibling.nextSibling;
        while (prevNode && prevNode.nodeType === 3 && prevNode.textContent.trim() === '') {
          commitsList.removeChild(prevNode);
          prevNode = lastCommit.previousElementSibling.nextSibling;
        }
        // Ajouter exactement un saut de ligne entre les jours
        commitsList.insertBefore(document.createTextNode('\n\n'), lastCommit);
      }
    }

    console.log("HTML nettoyé pour regrouper tous les commits du jour courant avec la mise en forme correcte.");
  } catch (error) {
    console.error(`Erreur lors du nettoyage du HTML: ${error.message}`);
    process.exit(1);
  }
}

// Utilise getBiasedRandomInt pour déterminer le nombre de commits
const commitCount = getBiasedRandomInt();
console.log(`Nombre de commits à réaliser pour chaque ajout: ${commitCount}`);

if (commitCount > 0) {
  // Réalise les commits, sauf le dernier qui sera un commit de nettoyage (-1) ici
  for (let i = 0; i < commitCount - 1; i++) {
    const today = new Date();
    const commitMessage = `Commit quotidien du ${formatDate(today)} avec ${commitCount} commits.`;

    // Ajoute le commit au DOM
    addCommit(commitMessage);

    try {
      // Enregistre le fichier HTML modifié
      fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);
      console.log('Fichier HTML enregistré avec succès.');

      // Effectue le commit avec le message spécifié
      performGitCommits(commitMessage);
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement du fichier HTML ou du commit: ${error.message}`);
      process.exit(1);
    }
  }

  // Appel de la fonction de nettoyage des commits avant le dernier commit
  cleanCommitInfo();

  try {
    // Enregistre le fichier HTML modifié après nettoyage
    fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);
    console.log('Fichier HTML enregistré après nettoyage avec succès.');

    // Création du message de commit pour le nettoyage
    const today = new Date();
    const commitMessage = `Commit quotidien du ${formatDate(today)} avec ${commitCount} commits.`;

    // Effectue le dernier commit avec le message de nettoyage
    performGitCommits(commitMessage);
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du fichier HTML après nettoyage: ${error.message}`);
    process.exit(1);
  }
} else {
  // Si le nombre de commits est 0, on enregistre le fichier sans faire de commit
  cleanCommitInfo();

  try {
    // Enregistre le fichier HTML modifié
    fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);
    console.log('Aucun commit à réaliser aujourd\'hui. Fichier HTML enregistré localement sans commit.');
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du fichier HTML: ${error.message}`);
    process.exit(1);
  }
}

console.log('Processus terminé.');
process.exit();

