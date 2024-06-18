// index.js
import dotenv from 'dotenv';
import FtpDeploy from 'ftp-deploy';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Charger les configurations du fichier .env
dotenv.config();

const ftpDeploy = new FtpDeploy();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction pour lister les dossiers en excluant certains répertoires
function getDirectories(path, exclude = []) {
    return fs.readdirSync(path, { withFileTypes: true })
             .filter(dirent => dirent.isDirectory() && !exclude.includes(dirent.name))
             .map(dirent => dirent.name);
}

// Utiliser le chemin de base à partir d'une variable d'environnement ou remonter de deux niveaux par rapport à __dirname
const basePath = process.env.BASE_PATH || join(__dirname, '../../');
const folders = getDirectories(basePath, ['node_modules', 'bin', '.git', 'some_other_folder_to_exclude']);

(async () => {
    // Utiliser directement les variables d'environnement
    const user = process.env.FTP_USER;
    const password = process.env.FTP_PASSWORD;
    const host = process.env.FTP_HOST;
    const link = process.env.FTP_LINK;

    // S'assurer que toutes les informations nécessaires sont présentes
    if (!user || !password || !host) {
        console.error("Erreur: Les informations d'authentification FTP (utilisateur, mot de passe, hôte) doivent être définies dans le fichier .env.");
        process.exit(1);
    }

    const folderAnswer = await inquirer.prompt([
        {
            type: 'list',
            name: 'buildFolder',
            message: 'Sélectionnez le dossier de build:',
            choices: folders
        }
    ]);

    const config = {
        user: user,
        password: password,
        host: host,
        port: 21,
        localRoot: `${basePath}/${folderAnswer.buildFolder}`,
        remoteRoot: `/httpdocs/${folderAnswer.buildFolder}/`,
        include: ["*", "**/*"],
        deleteRemote: false,
        forcePasv: true
    };

    try {
        await ftpDeploy.deploy(config);
        console.log('\x1b[35m\x1b[40m%s\x1b[0m', 'Déploiement réussi dans ' + folderAnswer.buildFolder + ' sur le serveur !' + '\n' + link + folderAnswer.buildFolder + '/');
    } catch (err) {
        console.log(err);
    }
})();
