const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { execSync } = require('child_process');

try {
  process.chdir('/home/lerosier/Projet_autocommit');
  console.log('Répertoire de travail changé avec succès.');
} catch (error) {
  console.error(`Erreur lors du changement de répertoire de travail: ${error.message}`);
  process.exit(1);
}

const htmlFilePath = path.join(__dirname, 'index.html');

let htmlContent;
try {
  htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  console.log('Contenu du fichier HTML lu avec succès.');
} catch (error) {
  console.error(`Erreur lors de la lecture du fichier HTML: ${error.message}`);
  process.exit(1);
}

let window, document;
try {
  ({ window } = new JSDOM(htmlContent));
  document = window.document;
  console.log('Instance JSDOM créée avec succès.');
} catch (error) {
  console.error(`Erreur lors de la création de JSDOM: ${error.message}`);
  process.exit(1);
}

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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBiasedRandomInt() {
  const random = Math.random();
  if (random < 0.66) {
    return Math.random() < 0.5 ? 2 : 3;
  }
  return getRandomInt(0, 6);
}

function addCommit(commitMessage) {
  const commitsList = document.querySelector('#commitsList');
  const newCommit = document.createElement('li');
  newCommit.textContent = commitMessage;
  commitsList.appendChild(newCommit);
  commitsList.appendChild(document.createTextNode('\n\n'));
}

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

function cleanCommitInfo() {
  try {
    const commitsList = document.querySelector('#commitsList');
    if (!commitsList) {
      throw new Error('Element #commitsList non trouvé dans le DOM');
    }

    const commits = Array.from(commitsList.querySelectorAll('li'));
    if (commits.length === 0) return;

    const today = new Date();
    const todayString = today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const todayCommits = commits.filter((commit) =>
      commit.textContent.includes(`Commit quotidien du ${todayString}`)
    );

    if (todayCommits.length > 0) {
      const commitCount = todayCommits.length;
      const lastCommit = todayCommits[todayCommits.length - 1];
      lastCommit.textContent = `Commit quotidien du ${todayString} à ${today.toLocaleTimeString('fr-FR')} avec ${commitCount} commits.`;

      todayCommits.slice(0, -1).forEach((commit) => commit.remove());

      let nextNode = lastCommit.nextSibling;
      while (nextNode && nextNode.nodeType === 3) {
        commitsList.removeChild(nextNode);
        nextNode = lastCommit.nextSibling;
      }

      commitsList.appendChild(document.createTextNode('\n\n'));

      if (lastCommit.previousElementSibling) {
        let prevNode = lastCommit.previousElementSibling.nextSibling;
        while (prevNode && prevNode.nodeType === 3 && prevNode.textContent.trim() === '') {
          commitsList.removeChild(prevNode);
          prevNode = lastCommit.previousElementSibling.nextSibling;
        }
        commitsList.insertBefore(document.createTextNode('\n\n'), lastCommit);
      }
    }

    console.log("HTML nettoyé pour regrouper tous les commits du jour courant avec la mise en forme correcte.");
  } catch (error) {
    console.error(`Erreur lors du nettoyage du HTML: ${error.message}`);
    process.exit(1);
  }
}

const commitCount = getBiasedRandomInt();
console.log(`Nombre de commits à réaliser pour chaque ajout: ${commitCount}`);

if (commitCount > 0) {
  // Effectuer le nettoyage avant d'ajouter les commits du jour
  cleanCommitInfo();

  for (let i = 0; i < commitCount; i++) {
    const today = new Date();
    let commitMessage = `Commit quotidien du ${formatDate(today)} avec ${commitCount} commits.`;

    addCommit(commitMessage);

    try {
      fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);
      console.log('Fichier HTML enregistré avec succès.');
      performGitCommits(commitMessage);
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement du fichier HTML ou du commit: ${error.message}`);
      process.exit(1);
    }
  }
} else {
  cleanCommitInfo();

  try {
    fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);
    console.log('Aucun commit à réaliser aujourd\'hui. Fichier HTML enregistré localement sans commit.');
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement du fichier HTML: ${error.message}`);
    process.exit(1);
  }
}

console.log('Processus terminé.');
process.exit();

