// Fonction pour générer un commit quotidien avec la date du jour
function genererateCommit() {
  // Obtient la date actuelle
  const today = new Date();
  // Génère le message de commit avec la date du jour
  const commitMessage = "Commit quotidien du " + today.toDateString();
  // Appelle la fonction pour ajouter le commit à la liste
  addCommit(commitMessage);
}
// Fonction pour ajouter un commit à la liste
function addCommit(commitMessage) {
  // Récupère l'élément <ul> qui contient la liste des commits
  const commitsList = document.getElementById('commitsList')
  // Crée un nouvel élément <li> pour représenter le commit
  const newCommit = document.createElement('li');

  // Définit le texte du commit comme contenu de l'élément <li>
  newCommit.textContent = commitMessage;
  // Ajoute l'élément <li> à la liste des commits
  commitsList.appendChild(newCommit);
}
// Appelle la fonction pour générer un commit quotidien
genererateCommit();
