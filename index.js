// index.js
import FtpDeploy from 'ftp-deploy';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const ftpDeploy = new FtpDeploy();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction pour lister les dossiers
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}

const folders = getDirectories(__dirname);

(async () => {
    const credentials = await inquirer.prompt([
        {
            type: 'input',
            name: 'user',
            message: 'Entrez le nom d\'utilisateur FTP:',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Entrez le mot de passe FTP:',
            mask: '*'
        },
        {
            type: 'input',
            name: 'host',
            message: 'Entrez l\'hôte FTP:',
        }
    ]);

    const folderAnswer = await inquirer.prompt([
        {
            type: 'list',
            name: 'buildFolder',
            message: 'Sélectionnez le dossier de build:',
            choices: folders
        }
    ]);

    const config = {
        user: credentials.user,
        password: credentials.password,
        host: credentials.host,
        port: 21,
        localRoot: `${__dirname}/${folderAnswer.buildFolder}`,
        remoteRoot: `/httpdocs/${folderAnswer.buildFolder}/`,
        include: ["*", "**/*"],
        deleteRemote: false,
        forcePasv: true
    };

    try {
        await ftpDeploy.deploy(config);
        console.log("Déploiement réussi dans " + folderAnswer.buildFolder + " sur le serveur !");
    } catch (err) {
        console.log(err);
    }
})();
