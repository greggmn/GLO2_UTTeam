
const Creneau = require('./Creneau.js');
const Ue = require('./UE.js');
const readlineSync = require('readline-sync');
const { analyserDossier } = require('./Spec_Util.js');
const ics = require('ics');
const fs = require('fs');


var menuReservation = function(statut, identifiant,donnees){
    //console.log(donnees[0]);

    console.log("Tapez 1 pour réserver une salle ");
    console.log("Tapez 2 pour voir vos réservations");
    console.log("Tapez 3 pour annuler une réservation");
    const choixAction = 'Choix de réservation: \n';
    const reponseAction = readlineSync.question(choixAction);

    if (reponseAction === "2"){
        mesReservations(donnees, identifiant);
    }
    else if (reponseAction === "1"){

        let reponse;
        let nomUe;
        if (statut === "professeur"){
            
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
            reserver(salle, jour, horaire, nomUe, donnees,identifiant); 
        } else if (reponse === "2"){
            reserverSemestre(salle, jour, horaire, nomUe, donnees, identifiant); 
        }

            
        if (statut === "eleve" | "élève"){
            reserver(salle, jour, horaire,"Réservation", donnees, identifiant); 
        }

    }
    else if (reponseAction === "3") {
        console.log("Annulation d'une réservation");
        const choixUe = "Entrez le nom de l'UE pour laquelle vous voulez annuler une réservation: \n";
        let nomUe = readlineSync.question(choixUe);

        const choixSalle = "Entrez le nom de la salle de la réservation à annuler: \n";
        let nomSalle = readlineSync.question(choixSalle);

        const choixJour = "Entrez le jour de la réservation à annuler (ex: L, MA, ME): \n";
        let jour = readlineSync.question(choixJour);

        const choixHoraire = "Entrez l'horaire de la réservation à annuler (ex: 10:00 - 12:00): \n";
        let horaire = readlineSync.question(choixHoraire);

        annulerReservation(identifiant, nomSalle, jour, horaire, donnees);
    }
    return donnees;
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
                console.log("Salle " + creneau.salle + ", horaire: " + creneau.horaire + ", jour: " + creneau.jour);
            }
        });
    });

    if (reservations.length > 0) {
        reservations.forEach((reservation, index) => {
            console.log(`Génération du fichier iCalendar pour la réservation ${index + 1}`);
            creerFichierIcs(reservation.salle, reservation.jour, reservation.horaire, identifiant);
        });
    } else {
        console.log("Aucune réservation trouvée.");
    }
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
// const creneau = new Creneau("R0", "0", jour, horaire, identifiant, nomSalle);
// const ue = new Ue(nomUe, [creneau]);
// donnees.push(ue);
// console.log("Salle réservée!");
// }
var annulerReservation = function(identifiant, nomSalle, jour, horaire, donnees, nomUe) {
    let reservationFound = false;

    for (let i = 0; i < donnees.length; i++) {
        let ue = donnees[i];
        if (ue.nom === nomUe) { 
            for (let j = 0; j < ue.creneaux.length; j++) {
                let creneau = ue.creneaux[j];
                if (creneau.groupe_cours === identifiant && creneau.salle === nomSalle && creneau.jour === jour && creneau.horaire === horaire) {
                    reservationFound = true;
                    ue.creneaux.splice(j, 1);
                    console.log("Réservation annulée.");
                }
            }
        }
    }
    if (!reservationFound) {
        console.log("Aucune réservation trouvée correspondant à ces détails.");
    }
};

function creerFichierIcs(nomSalle, jour, horaire, identifiant) {
    const [heureDebut, heureFin] = horaire.split('-').map(h => h.trim());
    const [heure, minute] = heureDebut.split(':').map(h => parseInt(h, 10));

    // Convertir le jour en une date (vous devrez définir une logique pour cela)
    const date = convertirJourEnDate(jour);

    const event = {
        start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), heure, minute],
        end: [date.getFullYear(), date.getMonth() + 1, date.getDate(), ...heureFin.split(':').map(h => parseInt(h, 10))],
        title: `Réservation de la salle ${nomSalle}`,
        description: `Réservation effectuée par ${identifiant}`,
        location: nomSalle,
        status: 'CONFIRMED',
        busyStatus: 'BUSY'
    };

    ics.createEvent(event, (error, value) => {
        if (error) {
            console.log(error);
            return;
        }

        // Écrivez le fichier .ics ou envoyez-le à l'utilisateur
        // Par exemple, enregistrer le fichier localement ou l'envoyer par email
        fs.writeFileSync(`${identifiant}-${nomSalle}-reservation.ics`, value);
    });
}

function convertirJourEnDate(jour) {
    const jours = { "L": 1, "MA": 2, "ME": 3, "J": 4, "V": 5, "S": 6, "D": 0 };
    const today = new Date();
    const todayDayOfWeek = today.getDay();
    const targetDayOfWeek = jours[jour];

    let date = new Date(today);
    date.setDate(today.getDate() + ((7 + targetDayOfWeek - todayDayOfWeek) % 7));

    return date;
}



module.exports = {menuReservation};