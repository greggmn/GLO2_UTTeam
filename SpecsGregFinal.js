const fs = require('fs');
const path = require('path');
const CruParser = require('./CruParserSansLog'); // Assurez-vous d'importer le bon module
const readlineSync = require('readline-sync');
const { analyserDossier } = require('./Spec_Util.js');


function PourcentageOccupation(folderPath= 'SujetA_data') {

    console.log(`Lecture des fichiers dans le dossier ${folderPath}`);

    // Lire le contenu du dossier
    const files = fs.readdirSync(folderPath);

    // Initialiser l'analyseur en dehors de la boucle
    const analyzer = new CruParser();

    for (const file of files) {
        const filePath = path.join(folderPath, file);

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            // Exécuter l'analyse une seule fois
            analyzer.parse(data);
        } catch (err) {
            // Gérer les erreurs éventuelles ici
            console.log(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
        }
    }

    const q= 'Entrer la salle dont vous voulez l \'occupation \n';
    const salle = readlineSync.question(q);

    // Réaliser des opérations après avoir analysé tous les fichiers
    const heuresDisponibles = calculateTotalHoursAvailable();
    const heuresOccupees = calculateTotalOccupiedHours(salle, analyzer);

    if (heuresDisponibles > 0) {
        const pourcentageOccupation = (heuresOccupees / heuresDisponibles) * 100;
        console.log(`Pourcentage d'occupation de la salle ${salle} dans tous les fichiers analysés : ${pourcentageOccupation.toFixed(2)}%`);
    } else {
        console.log(`Aucune plage horaire disponible pour la salle ${salle} dans tous les fichiers analysés.`);
    }
}
/*
function classementDesSalles(folderPath) {
    console.log(`Lecture des fichiers dans le dossier ${folderPath}`);

    // Lire le contenu du dossier
    const files = fs.readdirSync(folderPath);


    // Initialiser l'analyseur en dehors de la boucle
    const analyzer = new CruParser();
    const salleOccupationMap = new Map();

    for (const file of files) {
        const filePath = path.join(folderPath, file);

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            // Exécuter l'analyse une seule fois
            analyzer.parse(data);

            // Calculer le pourcentage d'occupation pour chaque salle
            analyzer.parsedUE.forEach((ue) => {
                ue.creneaux.forEach((creneau) => {
                    const salle = creneau.salle;
                    const heuresOccupées = calculateHoursBetween(creneau.horaire.split('-')[0], creneau.horaire.split('-')[1]);
                    salleOccupationMap.set(salle, (salleOccupationMap.get(salle) || 0) + heuresOccupées);
                });
            });
        } catch (err) {
            // Gérer les erreurs éventuelles ici
            console.log(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
        }
    }

    // Trier les salles par pourcentage d'occupation décroissant
    const sortedSalles = Array.from(salleOccupationMap.keys()).sort((salleA, salleB) => {
        const pourcentageA = (salleOccupationMap.get(salleA) / calculateTotalHoursAvailable()) * 100;
        const pourcentageB = (salleOccupationMap.get(salleB) / calculateTotalHoursAvailable()) * 100;
        return pourcentageB - pourcentageA;
    });

    console.log("Classement des salles en fonction de leur pourcentage d'occupation :");
    sortedSalles.forEach((salle) => {
        const pourcentageOccupation = (salleOccupationMap.get(salle) / calculateTotalHoursAvailable()) * 100;
        console.log(`- ${salle}: ${pourcentageOccupation.toFixed(2)}%`);
    });
}
*/

function listerDisponibilitesSalle( folderPath = 'SujetA_data') {

    console.log(`Lecture des fichiers dans le dossier ${folderPath}`);

    const files = fs.readdirSync(folderPath);
    const analyzer = new CruParser();

    for (const file of files) {
        const filePath = path.join(folderPath, file);

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            analyzer.parse(data);
        } catch (err) {
            console.log(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
        }
    }

    const q= 'Entrer la salle dont vous voulez l \'occupation \n';
    const salle = readlineSync.question(q);

    const horairesOccupes = [];

    analyzer.parsedUE.forEach((ue) => {
        ue.creneaux.forEach((creneau) => {
            if (creneau.salle === salle) {
                const jour = creneau.jour;
                const debut = creneau.horaire.split('-')[0];
                const fin = creneau.horaire.split('-')[1];
                horairesOccupes.push({
                    jour,
                    debut,
                    fin,
                });
            }
        });
    });

    const disponibilites = [];

    const joursSemaine = ["L", "MA", "ME", "J", "V", "S"];

    for (const jour of joursSemaine) {
        const horairesJour = horairesOccupes
            .filter(creneau => creneau.jour === jour)
            .sort((a, b) => a.debut.localeCompare(b.debut));

        if (horairesJour.length === 0) {
            disponibilites.push({
                jour,
                debut: "08:00",
                fin: "20:00",
            });
        } else {
            let debutDispo = "08:00";
            let finDispo = "20:00";

            for (const creneau of horairesJour) {
                const debutCreneau = creneau.debut;
                const finCreneau = creneau.fin;

                if (debutCreneau > debutDispo) {
                    disponibilites.push({
                        jour,
                        debut: debutDispo,
                        fin: debutCreneau,
                    });
                }

                debutDispo = finCreneau;
            }

            if (debutDispo < finDispo) {
                disponibilites.push({
                    jour,
                    debut: debutDispo,
                    fin: finDispo,
                });
            }
        }
    }

    if (disponibilites.length > 0) {
        console.log(`Disponibilités pour la salle ${salle} dans tous les fichiers analysés :`);
        disponibilites.forEach(({jour, debut, fin}) => {
            console.log(`- ${jour} ${debut}-${fin}`);
        });
    } else {
        console.log(`Aucune disponibilité trouvée pour la salle ${salle} dans tous les fichiers analysés.`);
    }

    return disponibilites;
}

    function calculateTotalHoursAvailable() {
        // Calculer le nombre total d'heures disponibles dans la semaine
        const heuresDebutLimite = "08:00";
        const heuresFinLimite = "20:00";
        const joursSemaine = ["L", "MA", "ME", "J", "V", "S"];
        let heuresDisponibles = 0;

        joursSemaine.forEach(jour => {
            heuresDisponibles += calculateHoursBetween(heuresDebutLimite, heuresFinLimite);
        });

        return heuresDisponibles;
    }

    function calculateTotalOccupiedHours(salle, analyzer) {
        // Calculer le nombre total d'heures occupées pour la salle spécifiée
        let heuresOccupees = 0;

        analyzer.parsedUE.forEach((ue) => {
            ue.creneaux.forEach((creneau) => {
                if (creneau.salle === salle) {
                    heuresOccupees += calculateHoursBetween(creneau.horaire.split('-')[0], creneau.horaire.split('-')[1]);
                }
            });
        });

        return heuresOccupees;
    }

    function calculateHoursBetween(heureDebut, heureFin) {
        // Vérifier si creneau.horaire existe
        if (!heureDebut || !heureFin) {
            return 0;
        }

        // Calculer le nombre d'heures entre deux horaires
        const debut = new Date(`2000-01-01 ${heureDebut}`);
        const fin = new Date(`2000-01-01 ${heureFin}`);
        return (fin - debut) / (1000 * 60 * 60); // Convertir la différence en heures
    }


var sallesDispoSelonHoraire = function(){
    const donnees = analyserDossier("./SujetA_data");
    qJ = 'Entrer le jour (L, MA, ME, J, V, S) \n';
    jour = readlineSync.question(qJ);
    qH = 'Entrer horaire sous la forme HH:MM-HH:MM \n';
    horaireRecherche= readlineSync.question(qH);
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

// Exemple d'utilisation

//PourcentageOccupation();
//listerDisponibilitesSalle();
//sallesDispoSelonHoraire();
module.exports= {sallesDispoSelonHoraire, PourcentageOccupation, listerDisponibilitesSalle, calculateHoursBetween, calculateTotalHoursAvailable, calculateTotalOccupiedHours};
