// Définit la structure d'un objet UE
var UE = function(code, creneau){
    this.code = code;
    this.creneaux = [].concat(creneau);

}



UE.prototype.addCreneau = function(creneau){
    this.creneaux.push(creneau);
};


module.exports = UE;