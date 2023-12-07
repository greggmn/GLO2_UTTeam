
const Creneau = require('./Creneau.js');
const Ue = require('./UE.js');
const readlineSync = require('readline-sync');
const { analyserDossier } = require('./Spec_Util.js');



var menuReservation = function(statut, identifiant){

    const donnees = analyserDossier("./SujetA_data");
    //console.log(donnees[0]);

    console.log("Tapez 1 pour réserver une salle ");
    console.log("Tapez 2 pour réserver voir vos réservations");
    const choixAction = 'Choix de réservation: \n';
    const reponseAction = readlineSync.question(choixAction);

    if (reponseAction === "2"){
        mesReservations(donnees, identifiant);
    }
    else if (reponseAction === "1"){

        let reponse;
        let nomUe;
        if (statut === "prof"){
            
            do{
                console.log("Tapez 1 pour réserver la salle sur un créneau particulier");
                console.log("Tapez 2 pour réserver la salle tout un semestre");
                const choix = "Choix de réservation: \n";
                reponse = readlineSync.question(choix); 
                if (reponse!=="1" && reponse!=="2")
                    console.log("Choix non valide");
                
                const saisieUe = "Entrez le nom de l'UE pour laquelle vous réservez la salle: \n";
                nomUe = readlineSync.question(saisieUe);
                if (nomUe.match(/[A-Z]{1,4}\d{0,3}/)===null)
                    console.log("UE saisie non valide");
            } while((reponse!=="1" | reponse!=="2")&&(nomUe.match(/[A-Z]{1,4}\d{0,3}/)===null))

        }

        let jour;
        do{
            const choixJour = 'Entrez le jour pour lequel vous voulez réserver une salle (ex: L, MA, ME)\n';
            jour = readlineSync.question(choixJour);
            matched = jour.match(/(L|MA|ME|J|V|S)/);
            if (matched === null)
                console.log("Jour saisi invalide");
        } while(matched === null)
        
        let horaire;
        do{
            const choixHoraire = "Entrez l'heure à laquelle vous voulez réserver une salle (ex: 10:00 - 12:00) \n";
            horaire = readlineSync.question(choixHoraire);
            matched = horaire.match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/)
            if (matched === null)
                console.log("Horaire saisi invalide");
        } while(matched===null)
        
        var sallesDispos = sallesDispoSelonHoraire(donnees, horaire, jour);        

        let salle;
        do {
            const choixSalle = "Entrez le nom de la salle à réserver \n";
            salle = readlineSync.question(choixSalle);
            var test = testDispo(salle, sallesDispos); 
            if (test === false)
                console.log("La salle saisie n'est pas disponible");
        } while (test === false)

        
        if (reponse === "1"){
            reserver(salle, jour, horaire, nomUe, donnees); 
        } else if (reponse === "2"){
            reserverSemestre(salle, jour, horaire, nomUe, donnees, identifiant); 
        }

            
        if (statut === "eleve" | "élève"){
            reserver(salle, jour, horaire,"Réservation", donnees, identifiant); 
        }

    }

}


var reserver = function(nomSalle, jour, horaire, nomUe, donnees, identifiant){
    const creneau = new Creneau("R0", "0", jour, horaire, identifiant, nomSalle);
    const ue = new Ue(nomUe, [creneau]);
    donnees.push(ue);
    console.log("Salle réservée!");
}


var reserverSemestre = function (nomSalle, jour, horaire,nomUe, donnees, identifiant){
    const creneau = new Creneau("R0", "0", jour, horaire, identifiant, nomSalle);
    const ue = new Ue(nomUe, [creneau]);
    donnees.push(ue);
    console.log("Salle réservée!");
}

var testDispo = function(nomSalle, sallesDispos){
    let possibiliteReservation = sallesDispos.includes(nomSalle);
    return possibiliteReservation;
}

var mesReservations = function(donnees, identifiant){

    console.log("Vos réservations: ");

    let reservations = [];
    donnees.forEach(ue => {
        ue.creneaux.forEach(creneau => {
            if (creneau.groupe_cours === identifiant) {
                reservations.push(creneau);
                console.log("Salle " + creneau.salle + ", horaire: " + creneau.horaire);
            }
        });
    });

    return reservations;
}


var sallesDispoSelonHoraire = function(donnees, horaireRecherche, jour){
    console.log("Salles disponibles et en accord avec votre recherche: ");
    let allSalles = [];
    let sallesIndispo = [];
    donnees.forEach(ue => {
        ue.creneaux.forEach(creneau => {
            if (allSalles.includes(creneau.salle) === false) {
                allSalles.push(creneau.salle);
            }
            if (creneau.horaire === horaireRecherche && creneau.jour === jour){
                sallesIndispo.push(creneau.salle);
            }
        });
    });

    allSalles = allSalles.filter(element => !sallesIndispo.includes(element));

    allSalles.forEach(salle => {
        console.log(salle);
    });

    return allSalles;
}

module.exports = {menuReservation};