const readlineSync = require('readline-sync');
const { exportData, importData, CRUification } = require('./ExportImportModule')
const {menuReservation} = require('./reservation');;
const { analyserDossier, checkCru, voirInfosSalles, voirTauxOccupation } = require('./Spec_Util.js');
const {sallesDispoSelonHoraire, PourcentageOccupation, listerDisponibilitesSalle} = require('./OccupationSalles.js');

// inquirer permet d'améliorer le design du menu
import('inquirer')
  .then((inquirerModule) => {
    const inquirer = inquirerModule.default;

//choix possibles pour le statut de l'utilisateur au sein de l'université
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

//choix possibles pour l'action à réaliser depuis le menu
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

// fonction principale du projet, gestion du menu et du démarrage/arrêt du programme
async function runMenu(){
    let enCours = true;

    const {choix} = await inquirer.prompt(inscription);
    statut = choix;

    let donnees = analyserDossier("./SujetA_data");

    const question1 = 'Entrez votre identifiant \n';
    identifiant = readlineSync.question(question1);

    while (enCours){       
        const {choix: action} =  await inquirer.prompt(actionAFaireAdmin);
            
        switch(action){
            // spec 1
            case "vérifier la validité du format CRU":
                checkCru();
                break;
            //spec 2
            case "consulter les salles disponibles selon le créneau horaire":
                sallesDispoSelonHoraire();
                break;
            //spec 3
            case "consulter les disponibilités d’une salle":
                listerDisponibilitesSalle();
                break;
            //spec 4 , 12
            case "consulter les informations d'une salle":
                if (statut === "administrateur"){
                    console.log(voirTauxOccupation(donnees));
                }
                else {
                    console.log(voirInfosSalles(donnees));
                }
                break;
            //specs 5, 5.1, 6, 7, 8, 9
            case "gérer les réservations":
                donnees = menuReservation(statut, identifiant, donnees);
                break;
            //spec 12
            case "visualiser l’occupation des salles":
                if (statut !== "administrateur"){
                    console.log("Vous n'avez pas accès à cette fonction");
                }
                else{
                    PourcentageOccupation();
                }
                break;
            //spec 13
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
            // spec 11
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


