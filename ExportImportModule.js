const fs = require('fs').promises;
const path = require('path');
const CruParser = require('./CruParserSansLog');

async function exportData(fileName, folderName) {
    const folderPath = path.join(__dirname, folderName);
    const exportFilePath = path.join(folderPath, fileName.slice(12));

    // Create the directory if it doesn't exist
    try {
        await fs.mkdir(folderPath, { recursive: true });
        console.log('Directory created successfully!');
    } catch (err) {
        console.log(`Error creating directory: ${err.message}`);
        return;
    }

    // Read the file and write data to the new file
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

module.exports = {
    exportData,
    importData
};