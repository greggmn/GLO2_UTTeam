const {program} = require('@caporal/core');
const CruParser = require("./CruParserSansLog");
const fs = require("fs");
const path = require('path');

function exportData(filename,foldername){
        const fileName = filename
        const folderName = foldername
        const folderPath = path.join(__dirname, folderName);
        const exportFilePath = path.join(folderPath,fileName.slice(12))
        var analyzer = new CruParser()

        // If the file doesn't exist, create the directory
        if (!fs.existsSync(folderPath)) {
            fs.mkdir(folderPath, {recursive:true},(err)=> {
                if (err) {
                    console.log(err)
                }
                console.log('Directory created successfully!');
            })
        }

        // Read the file passed in parameters
        fs.readFile(fileName,null, (err,data)=> {
            if (err) {
                console.log(err);
            }
            fs.writeFile(exportFilePath, data, (err) => {
                if (err) {
                    console.log(err);
                }
                console.log('Data written successfully!');
            })
        })
    }
    module.exports = exportData;