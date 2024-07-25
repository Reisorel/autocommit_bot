const process = require('process');
process.chdir('/home/lerosier/Projet_autocommit');

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { execSync } = require('child_process');

const htmlFilePath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
const { window } = new JSDOM(htmlContent);
const { document } = window;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCommits() {
  const commitCount = getRandomInt(1, 8);
  for (let i = 0; i < commitCount; i++) {
    const today = new Date();
    const options = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
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

function addCommitSummary(commitCount) {
  const today = new Date();
  const options = {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  };
  const summaryMessage = `Commit quotidien du ${today.toLocaleString('fr-FR', options)} avec ${commitCount} commits.`;

  const commitsList = document.querySelector('#commitsList');
  const newCommit = document.createElement('li');
  newCommit.textContent = summaryMessage;
  if (commitsList.lastChild) {
    commitsList.appendChild(document.createTextNode('\n    '));
  }
  commitsList.appendChild(newCommit);
  commitsList.appendChild(document.createTextNode('\n  '));
}

const commitCount = generateCommits();
addCommitSummary(commitCount);
fs.writeFileSync(htmlFilePath, window.document.documentElement.outerHTML);

try {
  execSync('git push origin master', { cwd: '/home/lerosier/Projet_autocommit', stdio: 'inherit' });
} catch (err) {
  console.error('Erreur lors du push :', err.message);
  console.error('stdout :', err.stdout ? err.stdout.toString() : 'Aucun stdout');
  console.error('stderr :', err.stderr ? err.stderr.toString() : 'Aucun stderr');
  throw err;
}

process.exit();
