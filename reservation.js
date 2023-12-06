
const Creneau = require('./Creneau.js');
const Ue = require('./UE.js');
const creneau = require('./Creneau.js');
const readlineSync = require('readline-sync');
const { analyserDossier, analyserFichier, voirInfosSalles, calculerTauxOccupation, voirTauxOccupation } = require('./Spec_Util.js');
const specsGreg = require('./SpecsGreg.js');

var menuReservation = function(statut, identifiant){

    console.log("Tapez 1 pour réserver une salle ");
    console.log("Tapez 2 pour réserver voir vos réservations");
    const choixAction = 'Choix de réservation: \n';
    const reponseAction = readlineSync.question(choixAction);

    if (reponseAction === "2"){
        mesReservations();
    }
    else if (reponseAction === "1"){

        if (statut === "prof"){

            let reponse;
            let nomUe;
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
        

        const donnees = analyserDossier("./SujetA_data");
        console.log(voirInfosSalles(donnees));

        let salle;
        do {
            const choixSalle = "Entrez le nom de la salle à réserver \n";
            salle = readlineSync.question(choixSalle);
            var test = testDispo(salle, horaire, jour,allCreneaux);
        } while (test === false)

        
        if (reponse === "1"){
            reserver(salle, jour, horaire, nomUe);
        } else if (reponse === "2"){
            reserverSemestre(salle, jour, horaire, nomUe);
        }

            
        if (statut === "eleve" | "élève"){
            reserver(salle, jour, horaire,"Réservation");
        }

    }

}


var reserver = function(nomSalle, jour, horaire, nomUe){
    creneau = new Creneau("R0", "0", jour, horaire, "F1", nomSalle);
    ue = new Ue(nomUe, [creneau]);
}


var reserverSemestre = function (nomSalle, jour, horaire,nomUe){
    creneau = new Creneau("R0", "0", jour, horaire, "F1", nomSalle);
    ue = new Ue(nomUe, [creneau]);
}

var testDispo = function(nomSalle, horaire, jour, allCreneaux){
    let creneauExiste = allCreneaux.some(creneau => creneau.salle === nomSalle & creneau.horaire === horaire & creneau.jour === jour);
    return creneauExiste;
}

var mesReservations = function(){

}

menuReservation("prof");