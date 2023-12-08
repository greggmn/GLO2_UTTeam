
const {program} = require('@caporal/core');
const readlineSync = require('readline-sync');
const { exportData, importData, CRUification } = require('./ExportImportModule')
const {menuReservation} = require('./reservation');;

import('inquirer')
  .then((inquirerModule) => {
    const inquirer = inquirerModule.default;


const inscription = [
    {
        type: 'rawlist',
        name: 'choix',
        message: "Votre statut dans l'université:",
        choices: [
        "administrateur",
        "professeur",
        "élève"
        ],
    },
];


const actionAFaireAdmin = [
    {
        type: 'rawlist',
        name: 'choix',
        message: "Choisissez l'action que vous souhaitez réaliser:",
        choices: [
            "vérifier la validité du format CRU",
            "consulter les salles disponibles selon le créneau horaire",
            "consulter les disponibilités d’une salle",
            "consulter les informations d'une salle",
            "gérer les réservations",
            "annuler une réservation",
            "visualiser l’occupation des salles",
            "créer et/ou modifier une salle",
            "exporter un emploi du temps",
            "importer un emploi du temps",
            "exit"
          ],
    },
];


async function runMenu(){
    let enCours = true;

    const {choix} = await inquirer.prompt(inscription);
    statut = choix;

    const question1 = 'Entrez votre identifiant \n';
    identifiant = readlineSync.question(question1);

    while (enCours){       
        const {choix: action} =  await inquirer.prompt(actionAFaireAdmin);
            
        switch(action){
            case "vérifier la validité du format CRU":
    
                break;
            case "consulter les salles disponibles selon le créneau horaire":
    
                break;
            case "consulter les disponibilités d’une salle":
    
                break;
            case "consulter les informations d'une salle":
    
                break;
            case "gérer les réservations":
                menuReservation(statut, identifiant);
                break;
            case "annuler une réservation":
                break;
            case "visualiser l’occupation des salles":
    
                break;
            case "créer et/ou modifier une salle":
                if (statut !== "administrateur"){
                    console.log("Vous n'avez pas accès à cette fonction");
                }
                else{

                }
                break;
            case "exporter un emploi du temps":
                if (statut !== "administrateur"){
                    console.log("Vous n'avez pas accès à cette fonction");
                }
                else{
                    const ques = "Presse Enter + Entrez le path de l'emploi du temps (ex: SujetA_data\\edt1.cru):\n"
                    const ques2 ="Entrez le path du fichier dans lequel vous voulez exporter (ex: Export):\n"
                    const fileName = readlineSync.question(ques);
                    const folderName = readlineSync.question(ques2);
                    exportData(fileName,folderName)
                }
                
                break;
            case "importer un emploi du temps":
                if (statut !== "administrateur"){
                    console.log("Vous n'avez pas accès à cette fonction");
                }
                else{
                    const ques3 = "Presse Enter + Entrez le nom du fichier a importer\n"
                    const filename = readlineSync.question(ques3);
        
                    importData(filename)
                }
                break;
    
            case "exit":
                enCours = false;
                break;
            }
    }
}
runMenu();
  })


