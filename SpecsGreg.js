#!/usr/bin/env ts-node


const {program} = require('@caporal/core');
const readlineSync = require('readline-sync');
const CruParser = require("./CruParserSansLog");

const fs = require("fs");
const path = require('path');


var analyzer = new CruParser();
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
            logger.info(`Disponibilités pour la salle ${args.salle} dans tous les fichiers analysés :`);
            uniqueDisponibilites.forEach(({ horaire, jour }) => {
                logger.info(`- ${jour} ${horaire}`);
            });
        } else {
            logger.info(`Aucune disponibilité trouvée pour la salle ${args.salle} dans tous les fichiers analysés.`);
        }
    });

program.run();