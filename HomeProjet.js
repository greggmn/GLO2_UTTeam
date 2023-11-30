#!/usr/bin/env ts-node


const {program} = require('@caporal/core');
const readlineSync = require('readline-sync');
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


program.run();
