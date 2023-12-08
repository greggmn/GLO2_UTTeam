
const Creneau = require('./Creneau.js');
const Ue = require('./UE.js');
const readlineSync = require('readline-sync');
const ics = require('ics');
const fs = require('fs');

// fonction qui gère l'ensemble de la partie réservation de salle (création de réservation/annulation)
var menuReservation = function(statut, identifiant,donnees){

    console.log("Tapez 1 pour réserver une salle ");
    console.log("Tapez 2 pour voir vos réservations");
    console.log("Tapez 3 pour annuler une réservation");
    const choixAction = 'Choix de réservation: \n';
    const reponseAction = readlineSync.question(choixAction);

    //si volonté de voir ses réservations
    if (reponseAction === "2"){
        mesReservations(donnees, identifiant);
    }
    // volonté de réserver une salle
    else if (reponseAction === "1"){

        // Si l'utilisateur est un professeur alors choisir réservation tout le semestre ou non
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
                // check le respect de l'expression régulière d'un nom d'UE
                if (nomUe.match(/[A-Z]{1,4}\d{0,3}/)===null)
                    console.log("UE saisie non valide");
            } while((reponse!=="1" | reponse!=="2")&&(nomUe.match(/[A-Z]{1,4}\d{0,3}/)===null))

        }

        //saisie du jour souhaité pour la réservation
        let jour;
        do{
            const choixJour = 'Entrez le jour pour lequel vous voulez réserver une salle (L, MA, ME, J, V, S)\n';
            jour = readlineSync.question(choixJour);
            // check le respect de l'expression régulière d'un jour
            matched = jour.match(/(L|MA|ME|J|V|S)/);
            if (matched === null)
                console.log("Jour saisi invalide");
        } while(matched === null)
        
        // saisie de l'horaire souhaité pour la réservation
        let horaire;
        do{
            const choixHoraire = "Entrez l'heure à laquelle vous voulez réserver une salle (ex: 10:00-12:00, uniquement créneaux de 2h) \n";
            horaire = readlineSync.question(choixHoraire);
            // check le respect de l'expression régulière d'un horaire
            matched = horaire.match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/)
            if (matched === null)
                console.log("Horaire saisi invalide");
        } while(matched===null)
        
        // appel de la fonction pour afficher les salles disponibles en fonction des infos saisies précédemment
        var sallesDispos = sallesDispoSelonHoraire(donnees, horaire, jour);        

        // saisie du nom de la salle à réserver
        let salle;
        do {
            const choixSalle = "Entrez le nom de la salle à réserver \n";
            salle = readlineSync.question(choixSalle);
            // check si la salle souhaitée est bien disponible
            var test = testDispo(salle, sallesDispos); 
            if (test === false)
                console.log("La salle saisie n'est pas disponible");
        } while (test === false)

        //Si l'utilisateur est un professeur voulant souhaiter une salle exceptionnellement
        if (reponse === "1"){
            reserver(salle, jour, horaire, nomUe, donnees,identifiant); 
        // Si l'utilisateur est un professeur qui veut réserver une salle tout un semestre
        } else if (reponse === "2"){
            reserverSemestre(salle, jour, horaire, nomUe, donnees, identifiant); 
        }

        
        if (statut === "eleve" | "élève"){
            reserver(salle, jour, horaire,"Réservation", donnees, identifiant); 
        }

    }
    // Volonté d'annuler une de ses réservations
    else if (reponseAction === "3") {
        //Saisie du nom de l'UE, de la salle, du jour et de l'horaire de la réservation à supprimer
        // check la validité de chaque information
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

//permet de réserver une salle
var reserver = function(nomSalle, jour, horaire, nomUe, donnees, identifiant){
    const creneau = new Creneau("R0", "0", jour, horaire, identifiant, nomSalle);
    const ue = new Ue(nomUe, [creneau]);
    donnees.push(ue);
    console.log("Salle réservée!");
}

//permet de réserver une salle pour l'ensemble d'un semestre
var reserverSemestre = function (nomSalle, jour, horaire,nomUe, donnees, identifiant){
    const creneau = new Creneau("R0", "0", jour, horaire, identifiant, nomSalle);
    const ue = new Ue(nomUe, [creneau]);
    donnees.push(ue);
    console.log("Salle réservée!");
}

//check si la salle saisie appartient aux salles disponibles
var testDispo = function(nomSalle, sallesDispos){
    let possibiliteReservation = sallesDispos.includes(nomSalle);
    return possibiliteReservation;
}

//Affichage de ses réservations en fonction de son identifiant
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
        // demander si l'utilisateur veut exporter ses réservations
        const choixExport = "Voulez-vous exporter vos réservations dans un fichier ics ? (oui/non) \n";
        let reponseExport = readlineSync.question(choixExport);
        if (reponseExport === "oui") {
            creerFichierIcs(reservations, identifiant);
    }
        else {
            console.log("Vous n'avez pas exporté vos réservations");
        }
    }
}


// Obtenir les salles disponibles à un horaire particulier
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

//Annuler une de ses réservations
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

function creerFichierIcs(events, identifiant) {
    let icsEvents = [];

    events.forEach(event => {
        const [heureDebut, heureFin] = event.horaire.split('-').map(h => h.trim());
        const [heure, minute] = heureDebut.split(':').map(h => parseInt(h, 10));
        const date = convertirJourEnDate(event.jour);

        const icsEvent = {
            start: [date.getFullYear(), date.getMonth() + 1, date.getDate(), heure, minute],
            end: [date.getFullYear(), date.getMonth() + 1, date.getDate(), ...heureFin.split(':').map(h => parseInt(h, 10))],
            title: `Réservation de la salle ${event.nomSalle}`,
            description: `Réservation effectuée par ${identifiant}`,
            location: event.nomSalle,
            status: 'CONFIRMED',
            busyStatus: 'BUSY'
        };

        ics.createEvent(icsEvent, (error, value) => {
            if (error) {
                console.log(error);
                return;
            }
            icsEvents.push(value);
        });
    });

    fs.writeFileSync(`${identifiant}-reservations.ics`, icsEvents.join('\r\n'));
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