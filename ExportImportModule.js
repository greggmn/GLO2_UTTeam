const fs = require('fs').promises;
const path = require('path');
const CruParser = require('./CruParser');

async function exportData(fileName, folderName) {
    const folderPath = path.join(__dirname, folderName);
    const exportFilePath = path.join(folderPath, fileName.slice(12));

    try {
        await fs.access(folderPath);
        console.log('Directory already exists!');
    } catch (err) {
        try {
            await fs.mkdir(folderPath, { recursive: true });
            console.log('Directory created successfully!');
        } catch (err) {
            console.log(`Error creating directory: ${err.message}`);
            return;
        }
    }

    try {
        const data = await fs.readFile(fileName,'utf-8');
        const analyzer = new CruParser();
        analyzer.parse(data);

        await fs.writeFile(exportFilePath, data);
        console.log('Data written successfully!');
    } catch (err) {
        console.log(`Error processing file: ${err.message}`);
    }
}
async function importData(filename) {
    const filePath = "SujetA_data\\"+filename
    try {
        const data = await fs.readFile(filename, 'utf-8');
        const analyzer = new CruParser();
        analyzer.parse(data);

        await fs.writeFile(filePath, data);
        console.log('Data imported successfully!');
    } catch (err) {
        console.log(`Error reading file: ${err.message}`);
    }
}

function CRUification(data) {
    let result = '';

    for (const course of data) {
        result += `+${course.code}\n`;
        if (Array.isArray(course.creneaux) && course.creneaux.length > 0) {
            for (const creneau of course.creneaux) {
                const slot = creneau;
                result += `1,${slot.type || ''},P=${slot.nbplaces || ''},H=${slot.jour || ''} ${slot.horaire || ''},F1,S=${slot.salle || ''}//\n`;

            }
        }
    }
    return result;
}

module.exports = {
    exportData,
    importData,
    CRUification
};