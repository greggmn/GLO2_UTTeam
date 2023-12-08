const fs = require('fs');
const path = require('path');
const CruParser = require('./CruParser.js'); // Assurez-vous d'importer le bon module
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

    //Demander la salle à l'utilisateur
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

function listerDisponibilitesSalle(folderPath= 'SujetA_data') {
// Lecture des fichiers dans le dossier spécifié
    console.log(`Lecture des fichiers dans le dossier ${folderPath}`);
    const files = fs.readdirSync(folderPath);
    const analyzer = new CruParser(); // Création d'une instance de CruParser (non défini dans le code fourni)

// Boucle sur chaque fichier dans le dossier
    for (const file of files) {
        const filePath = path.join(folderPath, file);

        try {
            // Lecture du contenu du fichier
            const data = fs.readFileSync(filePath, 'utf8');
            analyzer.parse(data); // Analyse des données du fichier avec CruParser
        } catch (err) {
            console.log(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
        }
    }

// Demande à l'utilisateur de saisir la salle pour laquelle il souhaite connaître l'occupation
    const q = 'Entrer la salle dont vous voulez l \'occupation \n';
    const salle = readlineSync.question(q);

    const horairesOccupes = [];

// Parcours des Unités d'Enseignement (UE) analysées par CruParser
    analyzer.parsedUE.forEach((ue) => {
        // Parcours des créneaux de chaque UE
        ue.creneaux.forEach((creneau) => {
            // Vérification si la salle du créneau correspond à celle saisie par l'utilisateur
            if (creneau.salle === salle) {
                // Ajout des horaires occupés dans un tableau
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

// Initialisation d'un tableau pour stocker les disponibilités
    const disponibilites = [];

// Définition des jours de la semaine
    const joursSemaine = ["L", "MA", "ME", "J", "V", "S"];

// Parcours des jours de la semaine
    for (const jour of joursSemaine) {
        // Filtrage des horaires occupés pour le jour actuel et tri par ordre croissant
        const horairesJour = horairesOccupes
            .filter(creneau => creneau.jour === jour)
            .sort((a, b) => a.debut.localeCompare(b.debut));

        // Vérification des disponibilités pour le jour actuel
        if (horairesJour.length === 0) {
            disponibilites.push({
                jour,
                debut: "08:00",
                fin: "20:00",
            });
        } else {
            let debutDispo = "08:00";
            let finDispo = "20:00";

            // Parcours des horaires occupés pour le jour actuel
            for (const creneau of horairesJour) {
                const debutCreneau = creneau.debut;
                const finCreneau = creneau.fin;

                // Vérification et ajout des disponibilités entre les créneaux occupés
                if (debutCreneau > debutDispo) {
                    disponibilites.push({
                        jour,
                        debut: debutDispo,
                        fin: debutCreneau,
                    });
                }

                debutDispo = finCreneau;
            }

            // Ajout des disponibilités après le dernier créneau occupé
            if (debutDispo < finDispo) {
                disponibilites.push({
                    jour,
                    debut: debutDispo,
                    fin: finDispo,
                });
            }
        }
    }

// Affichage des disponibilités ou d'un message en cas d'absence de disponibilité
    if (disponibilites.length > 0) {
        console.log(`Disponibilités pour la salle ${salle} dans tous les fichiers analysés :`);
        disponibilites.forEach(({jour, debut, fin}) => {
            console.log(`- ${jour} ${debut}-${fin}`);
        });
    } else {
        console.log(`Aucune disponibilité trouvée pour la salle ${salle} dans tous les fichiers analysés.`);
    }

// Retourne les disponibilités
    return disponibilites;
}

// Fonction pour calculer le nombre total d'heures disponibles dans la semaine
function calculateTotalHoursAvailable() {
    const heuresDebutLimite = "08:00";
    const heuresFinLimite = "20:00";
    const joursSemaine = ["L", "MA", "ME", "J", "V", "S"];
    let heuresDisponibles = 0;

    // Parcours des jours de la semaine
    joursSemaine.forEach(jour => {
        heuresDisponibles += calculateHoursBetween(heuresDebutLimite, heuresFinLimite);
    });

    return heuresDisponibles;
}

// Fonction pour calculer le nombre total d'heures occupées pour une salle spécifiée
function calculateTotalOccupiedHours(salle, analyzer) {
    let heuresOccupees = 0;

    // Parcours des Unités d'Enseignement (UE) analysées par l'analyzer
    analyzer.parsedUE.forEach((ue) => {
        // Parcours des créneaux de chaque UE
        ue.creneaux.forEach((creneau) => {
            // Vérification si la salle du créneau correspond à celle spécifiée
            if (creneau.salle === salle) {
                heuresOccupees += calculateHoursBetween(creneau.horaire.split('-')[0], creneau.horaire.split('-')[1]);
            }
        });
    });

    return heuresOccupees;
}

// Fonction pour calculer le nombre d'heures entre deux horaires
function calculateHoursBetween(heureDebut, heureFin) {
    // Vérifier si les horaires existent
    if (!heureDebut || !heureFin) {
        return 0;
    }

    // Calculer le nombre d'heures entre deux horaires
    const debut = new Date(`2000-01-01 ${heureDebut}`);
    const fin = new Date(`2000-01-01 ${heureFin}`);
    return (fin - debut) / (1000 * 60 * 60); // Convertir la différence en heures
}

// Fonction pour trouver les salles disponibles à un horaire et jour spécifiés
var sallesDispoSelonHoraire = function() {
    const donnees = analyserDossier("./SujetA_data"); // Appel à une fonction non définie (analyserDossier)
    qJ = 'Entrer le jour (L, MA, ME, J, V, S) \n';
    jour = readlineSync.question(qJ);
    qH = 'Entrer horaire sous la forme HH:MM-HH:MM \n';
    horaireRecherche= readlineSync.question(qH);
    console.log("Salles disponibles et en accord avec votre recherche: ");
    let allSalles = [];
    let sallesIndispo = [];

    // Parcours des données extraites
    donnees.forEach(ue => {
        ue.creneaux.forEach(creneau => {
            // Ajout de toutes les salles rencontrées
            if (!allSalles.includes(creneau.salle)) {
                allSalles.push(creneau.salle);
            }
            // Vérification si la salle est indisponible à l'horaire et jour spécifiés
            if (creneau.horaire === horaireRecherche && creneau.jour === jour) {
                sallesIndispo.push(creneau.salle);
            }
        });
    });

    // Filtrage des salles disponibles
    allSalles = allSalles.filter(element => !sallesIndispo.includes(element));

    // Affichage des salles disponibles
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
