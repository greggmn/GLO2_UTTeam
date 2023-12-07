const fs = require('fs');
const readlineSync = require('readline-sync');
const CruParser = require('./CruParser.js');

function checkCru(){

    console.log("Vérifier si un fichier est bel et bien au format Cru");

    const questionPath = 'Entrez le path du fichier à checker:  \n';
    path = readlineSync.question(questionPath);

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

checkCru();