import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distFolder = path.join(__dirname, '../AugmentedSteam/dist'); // Adjust the path as needed

async function deleteMapFiles(folder) {
    try {
        const files = await fs.readdir(folder);

        for (const file of files) {
            const filePath = path.join(folder, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                // Recursively call deleteMapFiles for directories
                await deleteMapFiles(filePath);
            } else if (file.endsWith('.map')) {
                await fs.unlink(filePath);
                console.log(`Deleted: ${filePath}`);
            }
        }
    } catch (err) {
        console.error(`Error processing folder ${folder}: ${err}`);
    }
}

// Run the function
deleteMapFiles(distFolder);
