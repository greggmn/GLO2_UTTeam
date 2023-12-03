#!/usr/bin/env ts-node


const {program} = require('@caporal/core');

const CruParser = require("./CruParserSansLog");

const fs = require("fs");
const path = require('path');


var analyzer = new CruParser();

program
    .command("Option2", "Liste toutes les salles disponibles à un horaire donné")
    .argument("<horaire>", "Horaire pour lequel vous voulez les salles disponibles (ex: 10:30)")
    .argument("<folder>", "Nom du dossier contenant les fichiers")
    .action(async ({ logger, args }) => {
        const folderName = args.folder;
        const folderPath = path.join(__dirname, folderName);

        logger.info(`Lecture des fichiers dans le dossier ${folderPath}`);

        // Lire le contenu du dossier
        const files = fs.readdirSync(folderPath);

        const horaireRecherche = args.horaire;
        const sallesOccupes = [];

        for (const file of files) {
            const filePath = path.join(folderPath, file);

            try {
                const data = fs.readFileSync(filePath, 'utf8');
                analyzer.parse(data);
            } catch (err) {
                logger.info(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
            }
        }

        // Réaliser des opérations après avoir analysé tous les fichiers
        analyzer.parsedUE.forEach((ue) => {
            ue.creneaux.forEach((creneau) => {
                const horaire = creneau.horaire;
                if (heureEstDansCreneau(horaireRecherche, horaire)) {
                    sallesOccupes.push(creneau.salle);
                }
            });
        });

        const sallesTotales = getSalleTotales(folderPath);
        const sallesDisponibles = sallesTotales.filter(salle => !sallesOccupes.includes(salle));

        if (sallesDisponibles.length > 0) {
            logger.info(`Salles disponibles pour l'horaire ${args.horaire} :`);
            sallesDisponibles.forEach((salle) => {
                logger.info(`- ${salle}`);
            });
        } else {
            logger.info(`Aucune salle disponible pour l'horaire ${args.horaire} dans tous les fichiers analysés.`);
        }
    });

function heureEstDansCreneau(heureRecherche, horaireCreneau) {
    if (horaireCreneau) {
        const [debutCreneau, finCreneau] = horaireCreneau.split('-');
        return heureRecherche >= debutCreneau && heureRecherche <= finCreneau;
    }
    return false;
}


function getSalleTotales(folderPath) {
    const files = fs.readdirSync(folderPath);
    const salles = new Set();

    for (const file of files) {
        const filePath = path.join(folderPath, file);

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const salleParser = new CruParser();
            salleParser.parse(data);
            salleParser.parsedUE.forEach((ue) => {
                ue.creneaux.forEach((creneau) => {
                    salles.add(creneau.salle);
                });
            });
        } catch (err) {
            console.error(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
        }
    }

    return Array.from(salles);
}
program
    .command("OccupationSalle", "Execute l'option 3 (occupation d’une salle)")
    .argument("<salle>", "salle dont on veut les disponibilités")
    .argument("<folder>", "nom du dossier contenant les fichiers")
    .action(async ({ logger, args }) => {
        const folderName = args.folder;
        const folderPath = path.join(__dirname, folderName);

        logger.info(`Lecture des fichiers dans le dossier ${folderPath}`);

        // Lire le contenu du dossier
        const files = fs.readdirSync(folderPath);

        // Initialiser l'analyseur en dehors de la boucle


        for (const file of files) {
            const filePath = path.join(folderPath, file);

            try {
                //logger.info(`Lecture du fichier ${filePath}`);
                const data = fs.readFileSync(filePath, 'utf8');

                // Exécuter l'analyse une seule fois
                analyzer.parse(data);
            } catch (err) {
                // Gérer les erreurs éventuelles ici
                logger.info(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
            }
        }

        // Réaliser des opérations après avoir analysé tous les fichiers
        const salle = args.salle;
        const disponibilites = [];

        analyzer.parsedUE.forEach((ue) => {
            ue.creneaux.forEach((creneau) => {
                if (creneau.salle === salle) {
                    disponibilites.push({
                        horaire: creneau.horaire,
                        jour: creneau.jour,
                    });
                }
            });
        });

        const uniqueDisponibilites = [...new Set(disponibilites)];

        if (uniqueDisponibilites.length > 0) {
            logger.info(`Occupation de la salle ${args.salle} dans tous les fichiers analysés :`);
            uniqueDisponibilites.forEach(({ horaire, jour }) => {
                logger.info(`- ${jour} ${horaire}`);
            });
        } else {
            logger.info(`Aucune occupation trouvée pour la salle ${args.salle} dans tous les fichiers analysés.`);
        }
    });


program
    .command("Option3", "Execute l'option 3 (disponibilités d’une salle)")
    .argument("<salle>", "salle dont on veut les disponibilités")
    .argument("<folder>", "nom du dossier contenant les fichiers")
    .action(async ({ logger, args }) => {
        const folderName = args.folder;
        const folderPath = path.join(__dirname, folderName);

        logger.info(`Lecture des fichiers dans le dossier ${folderPath}`);

        // Lire le contenu du dossier
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);

            try {
                const data = fs.readFileSync(filePath, 'utf8');
                analyzer.parse(data);
            } catch (err) {
                logger.info(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
            }
        }

        // Réaliser des opérations après avoir analysé tous les fichiers
        const salle = args.salle;
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

        // Calculer les périodes de disponibilité
        const disponibilites = [];


        const joursSemaine = ["L", "MA", "ME", "J", "V", "S"]; // Ajout du samedi

        for (const jour of joursSemaine) {
            const horairesJour = horairesOccupes
                .filter(creneau => creneau.jour === jour)
                .sort((a, b) => a.debut.localeCompare(b.debut)); // Trie les horaires occupés par début

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

                    // Mise à jour de la disponibilité en fonction du créneau
                    if (debutCreneau > debutDispo) {
                        disponibilites.push({
                            jour,
                            debut: debutDispo,
                            fin: debutCreneau,
                        });
                    }

                    debutDispo = finCreneau;
                }

                // Ajouter une disponibilité après le dernier créneau si nécessaire
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
            logger.info(`Disponibilités pour la salle ${args.salle} dans tous les fichiers analysés :`);
            disponibilites.forEach(({ jour, debut, fin }) => {
                logger.info(`- ${jour} ${debut}-${fin}`);
            });
        } else {
            logger.info(`Aucune disponibilité trouvée pour la salle ${args.salle} dans tous les fichiers analysés.`);
        }
    });










program.run();