#!/usr/bin/env ts-node
const readlineSync = require('readline-sync');

import('inquirer')
  .then((inquirerModule) => {
    const inquirer = inquirerModule.default;

function demarrage(){
    const inscription = [
        "administrateur",
        "professeur",
        "élève"
    ];

    return inquirer.prompt([
        {
            type: 'rawlist',
            name: 'choix',
            message: "Votre statut dans l'université:",
            choices: inscription
        },
    ]) ;
}
    

function actionAFaire(){
    const rawList = [
        "vérifier la validité du format CRU",
        "consulter les salles disponibles selon le créneau horaire",
        "consulter les disponibilités d’une salle",
        "consulter les informations d'une salle",
        "réserver une salle",
        "voir vos réservations",
        "annuler une réservation"
      ];

      return inquirer.prompt([
        {
            type: 'rawlist',
            name: 'choix',
            message: "Choisissez l'action que vous souhaitez réaliser:",
            choices: rawList
          },
    ]) ;
}

function actionAFaireAdmin(){
    const rawList = [
        "vérifier la validité du format CRU",
        "consulter les salles disponibles selon le créneau horaire",
        "consulter les disponibilités d’une salle",
        "consulter les informations d'une salle",
        "réserver une salle",
        "voir vos réservations",
        "annuler une réservation",
        "visualiser l’occupation des salles",
        "créer et/ou modifier une salle"
      ];

      return inquirer.prompt([
        {
            type: 'rawlist',
            name: 'choix',
            message: "Choisissez l'action que vous souhaitez réaliser:",
            choices: rawList
          },
    ]) ;
}


let statut, action, identifiant;
demarrage()
    .then((reponseDemarrage) => {
        statut = reponseDemarrage.choix;

        const question1 = 'Entrez votre identifiant \n';
        identifiant = readlineSync.question(question1);

        if (statut === "administrateur")
            return actionAFaireAdmin();
        else
            return actionAFaire();
    })
    .then((reponseAction) => {
        action = reponseAction.choix;

        switch(action){
            case "vérifier la validité du format CRU":

                break;
            case "consulter les salles disponibles selon le créneau horaire":


                break;
            case "consulter les disponibilités d’une salle":


                break;
            case "consulter les informations d'une salle":

                break;
            case "réserver une salle":
                const reservation = require('./reservation');
                reservation.menuReservation(statut, identifiant);
                break;
            case "voir vos réservations":

                break;
            case "annuler une réservation":

                break;
            case "visualiser l’occupation des salles":

                break;
            case "créer et/ou modifier une salle":

                break;
        }

    })
    .catch((erreur) => {
        console.log('Erreur :', erreur);
    });

  })




/*

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
                logger.info(`Lecture du fichier ${filePath}`);
                const data = fs.readFileSync(filePath, 'utf8');

                // Exécuter l'analyse
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

                const uniqueDisponibilites = [...new Set(disponibilites)];

                if (uniqueDisponibilites.length > 0) {
                    logger.info(`Disponibilités pour la salle ${args.salle} dans le fichier ${file}:`);
                    uniqueDisponibilites.forEach(({ horaire, jour }) => {
                        logger.info(`- ${jour} ${horaire}`);
                    });
                } else {
                    logger.info(`Aucune disponibilité trouvée pour la salle ${args.salle} dans le fichier ${file}.`);
                }
            } catch (err) {
                // Gérer les erreurs éventuelles ici
                logger.error(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
            }
        }

        // Afficher un message une fois toutes les analyses terminées
        logger.info("Toutes les analyses sont terminées.");
    });
*/
/*
program.run;


/*

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
                logger.info(`Lecture du fichier ${filePath}`);
                const data = fs.readFileSync(filePath, 'utf8');

                // Exécuter l'analyse
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

                const uniqueDisponibilites = [...new Set(disponibilites)];
                if (uniqueDisponibilites.length > 0) {
                    logger.info(`Disponibilités pour la salle ${args.salle} dans le fichier ${file}:`);
                    uniqueDisponibilites.forEach(({ horaire, jour }) => {
                        logger.info(`- ${jour} ${horaire}`);
                    });
                } else {
                    logger.info(`Aucune disponibilité trouvée pour la salle ${args.salle} dans le fichier ${file}.`);
                }
            } catch (err) {
                // Gérer les erreurs éventuelles ici
                logger.error(`Erreur lors de la lecture du fichier ${file}: ${err.message}`);
            }
        }

        // Afficher un message une fois toutes les analyses terminées
        logger.info("Toutes les analyses sont terminées.");
    });
*/



