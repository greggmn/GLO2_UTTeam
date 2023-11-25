var creneau = function(type, nbplaces, jour, horaire, groupe_cours, salle){
    this.type = type;
    this.nbplaces = nbplaces;
    this.jour = jour;
    this.horaire = horaire;
    this.groupe_cours = groupe_cours;
    this.salle = salle;
}



module.exports = creneau;