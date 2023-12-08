const readlineSync = require('readline-sync');
const fs = require('fs');
const CruParser = require("./CruParser");
const path = require('path');

//Teste si un fichier saisi respecte l'ensemble des règles du format Cru
function checkCru(){

    console.log("Vérifier si un fichier est bel et bien au format Cru");

    const questionPath = 'Entrez le path du fichier à checker:  \n';
    const path = readlineSync.question(questionPath);

    fs.readFile(path, 'utf8', function (err,data) {
        if (err) {
            return logger.warn(err);
        }
  
        var analyzer = new CruParser();

        analyzer.parse(data);

        if(analyzer.errorCount === 0){
            console.log("The .cru file is a valid cru file");            
        }else{
            console.log("The .cru file contains error");
        }
    });
}

function analyserDossier(folderPath) {
    try {
        const files = fs.readdirSync(folderPath); // Utilise readdirSync pour la lecture synchrone
        let allResults = []; // Utiliser un seul tableau pour toutes les données

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const data = fs.readFileSync(filePath, 'utf8'); // Utilise readFileSync pour la lecture synchrone
            
            var analyzer = new CruParser(false, false);
            analyzer.parse(data);
            allResults = allResults.concat(analyzer.parsedUE); // Fusionner les données
        }

        return allResults;
    } catch (err) {
        throw err;
    }
}

function analyserFichier(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8'); // Utilise readFileSync pour la lecture synchrone
            
        var analyzer = new CruParser(false, false);
        analyzer.parse(data);
        allResults = analyzer.parsedUE;
        return allResults;
    }
    catch (err) {
        throw err;
    }
}

function voirInfosSalles(donnees) {
    let infosSalles = {}; // Créer un objet pour stocker les infos par salle

    // Remplir l'objet avec les données
    donnees.forEach(ue => {
        ue.creneaux.forEach(creneau => {
            if (!infosSalles[creneau.salle]) {
                infosSalles[creneau.salle] = [];
            }
            infosSalles[creneau.salle].push({
                NbPlaces: creneau.nbplaces,
                Jour: creneau.jour,
                Horaire: creneau.horaire,
                GroupeCours: creneau.groupe_cours
            });
        });
    });

    // Afficher les informations
    Object.keys(infosSalles).forEach(salle => {
        console.log(`Salle: ${salle}`);
        infosSalles[salle].forEach(creneau => {
            console.log(`    NbPlaces: ${creneau.NbPlaces}, Jour: ${creneau.Jour}, Horaire: ${creneau.Horaire}, GroupeCours: ${creneau.GroupeCours}`);
        });
    });
}

function calculerTauxOccupation(donnees) {
    const heuresOuvertureParJour = 12; // de 8h à 20h
    const joursOuvrables = 5; // Supposons qu'il y a 5 jours ouvrables dans une semaine
    let tauxOccupationSalles = {};

    donnees.forEach(ue => {
        ue.creneaux.forEach(creneau => {
            if (!tauxOccupationSalles[creneau.salle]) {
                tauxOccupationSalles[creneau.salle] = 0;
            }
            if (creneau.horaire) { // Vérifier si le champ horaire existe
                let [heureDebut, heureFin] = creneau.horaire.split('-').map(heure => parseFloat(heure));
                tauxOccupationSalles[creneau.salle] += heureFin - heureDebut;
            }
        });
    });

    Object.keys(tauxOccupationSalles).forEach(salle => {
        tauxOccupationSalles[salle] = (tauxOccupationSalles[salle] / (heuresOuvertureParJour * joursOuvrables)) * 100;
    });

    return Object.entries(tauxOccupationSalles).sort((a, b) => b[1] - a[1]);
}

function voirTauxOccupation(donnees) {
    const heuresOuvertureParJour = 12; // de 8h à 20h
    const joursOuvrables = 5; // Supposons qu'il y a 5 jours ouvrables dans une semaine
    let tauxOccupationSalles = {};

    donnees.forEach(ue => {
        ue.creneaux.forEach(creneau => {
            if (!tauxOccupationSalles[creneau.salle]) {
                tauxOccupationSalles[creneau.salle] = 0;
            }
            if (creneau.horaire) { // Vérifier si le champ horaire existe
                let [heureDebut, heureFin] = creneau.horaire.split('-').map(heure => parseFloat(heure));
                tauxOccupationSalles[creneau.salle] += heureFin - heureDebut;
            }
        });
    });

    Object.keys(tauxOccupationSalles).forEach(salle => {
        tauxOccupationSalles[salle] = (tauxOccupationSalles[salle] / (heuresOuvertureParJour * joursOuvrables)) * 100;
    });

    return Object.entries(tauxOccupationSalles).sort((a, b) => b[1] - a[1]);
}

module.exports = { analyserDossier, analyserFichier, voirInfosSalles, calculerTauxOccupation, voirTauxOccupation, checkCru };
