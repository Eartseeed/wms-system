const fs = require("fs");
const path = require("path");

class BackupService {

    constructor() {

        this.databaseFile = path.join(
            __dirname,
            "../database/cwms.db"
        );

        this.backupFolder = path.join(
            __dirname,
            "../backup"
        );

        if (!fs.existsSync(this.backupFolder)) {

            fs.mkdirSync(this.backupFolder, {

                recursive: true

            });

        }

    }

    async createBackup() {

        const filename =

            "backup_" +

            new Date()

                .toISOString()

                .replace(/:/g, "-")

                .replace(/\./g, "-") +

            ".db";

        const destination = path.join(

            this.backupFolder,

            filename

        );

        fs.copyFileSync(

            this.databaseFile,

            destination

        );

        return {

            filename,

            path: destination,

            createdAt: new Date()

        };

    }

    async getAllBackups() {

        const files = fs.readdirSync(

            this.backupFolder

        );

        return files.map(file => {

            const stat = fs.statSync(

                path.join(

                    this.backupFolder,

                    file

                )

            );

            return {

                filename: file,

                size: stat.size,

                createdAt: stat.birthtime

            };

        });

    }

    async deleteBackup(filename) {

        const file = path.join(

            this.backupFolder,

            filename

        );

        if (!fs.existsSync(file)) {

            throw new Error(

                "Backup file not found"

            );

        }

        fs.unlinkSync(file);

        return true;

    }

}

module.exports = new BackupService();