#!/usr/bin/env ts-node


const {program} = require('@caporal/core');
const readlineSync = require('readline-sync');
const CruParser = require("./CruParserSansLog");

const fs = require("fs");
const path = require('path');
const buffer = require("buffer");


var analyzer = new CruParser();


program
    .command('accueil', 'Enonce les options du programme')
    .action(() => {

        const question1 = 'Entrer votre mot de passe \n';
        const reponse2 = readlineSync.question(question1);


        console.log("Voici les options du programme:")
        console.log("Taper 1 pour vérifier la validité du format CRU")
        console.log("Taper 2 pour consulter les salles disponibles selon le créneau horaire") //Greg
        console.log("Taper 3 pour consulter les disponibilités d’une salle")  //Greg
        console.log("Taper 4 pour consulter les informations d'une salle")
        console.log("Taper 5 pour réserver une salle")
        console.log("Taper 6 pour voir vos réservations")
        console.log("Taper 7 pour annuler une réservation")

        //Si admin
        if (reponse2 === "admin") {
            console.log("Taper 8 pour visualiser l’occupation des salles") //Greg
            console.log("Taper 9 pour créer et/ou modifier une salle")
            console.log("Taper 10 pour exporter un emploi du temps")
            console.log("Taper 11 pour importer un emploi du temps")


        }
        const question = '\n Entrer le numéro de la fonction à utiliser \n';
        const reponse = readlineSync.question(question);

        switch (reponse) {
            case '1':

                break;
            case '2':

                break;
            case '3':


                break;
            case '4':

                break;
            case '5':

                break;
            case '6':

                break;
            case '7':

                break;
            case '8':
                if (reponse2 !== "admin") {
                    console.log("Accès interdit");
                }

                break;
            case '9':
                if (reponse2 !== "admin") {
                    console.log("Accès interdit");
                }
                break;


        }


    });

// ...

program
    .command("Option3", "Execute l'option 3 (disponibilités d’une salle)")
    .argument("<salle>", "salle dont on veut les disponibilités")
    .argument("<folder>", "nom du dossier contenant les fichiers")
    .action(async ({ logger, args }) => {
        const folderName = args.folder;
        const folderPath = path.join(__dirname, folderName);

        // Créer un tableau pour stocker les résultats
        const allResults = [];

        // Lire le contenu du dossier
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                return logger.warn(err);
            }

            // Créer une promesse pour chaque fichier
            const promises = files.map(file => {
                const filePath = path.join(folderPath, file);

                return new Promise((resolve, reject) => {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            reject(err);
                        }

                        // Exécuter l'analyse en arrière-plan
                        analyzer.parse(data);

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

                        // Stocker les résultats dans le tableau
                        allResults.push({
                            file,
                            disponibilites: [...new Set(disponibilites)], // Utiliser un ensemble pour éviter les doublons
                        });

                        resolve();
                    });
                });
            });

            // Attendre que toutes les promesses soient résolues
            Promise.all(promises)
                .then(() => {
                    // Afficher les résultats une fois toutes les analyses terminées
                    allResults.forEach(result => {
                        const { file, disponibilites } = result;

                        const uniqueDisponibilites = [...new Set(disponibilites)]; // Utiliser un ensemble pour éviter les doublons

                        if (uniqueDisponibilites.length > 0) {
                            logger.info(`Disponibilités pour la salle ${args.salle} dans le fichier ${file}:`);
                            uniqueDisponibilites.forEach(({ horaire, jour }) => {
                                logger.info(`- ${jour} ${horaire}`);
                            });
                        } else {
                            logger.info(`Aucune disponibilité trouvée pour la salle ${args.salle} dans le fichier ${file}.`);
                        }

                    });

                    // Vous pouvez ajouter du code ici pour afficher des résultats globaux
                    logger.info("Toutes les analyses sont terminées.");
                })
                .catch((err) => {
                    // Gérer les erreurs éventuelles ici
                    logger.error(err);
                });
        });
    });


program
    .command('Option10','export edt au format cru')
    .argument('<file>',"l'edt que l'on souhaite exporter")
    .argument('<folder>',"le dossier dans lequel l'edt sera exporter")
    .action(({args,logger})=> {
        const fileName = args.file
        const folderName = args.folder;
        const folderPath = path.join(__dirname, folderName);
        const exportFilePath = path.join(folderPath,fileName.slice(14))

        // If the file doesn't exist, create the directory
        if (!fs.existsSync(folderPath)) {
            fs.mkdir(folderPath, {recursive:true},(err)=> {
                if (err) {
                    logger.warn(err)
                }
                console.log('Directory created successfully!');
            })
        }

        // Read the file passed in parameters
        fs.readFile(args.file,null, (err,data)=> {
            if (err) {
                return logger.warn(err);
            }

            fs.writeFile(exportFilePath, data, (err) => {
                if (err) {
                    return logger.warn(err);
                }
                console.log('Data written successfully!');
            })
        })


    })

program.run();


