const fs = require("fs");
const path = require("path");
const { run, all } = require("../config/database");

class UploadService {

    async save(file, userId = null) {

        return await run(

            `
                INSERT INTO uploads(

                    file_name,

                    original_name,

                    mime_type,

                    file_size,

                    file_path,

                    created_by

                )

                VALUES(?,?,?,?,?,?)

            `,

            [

                file.filename,

                file.originalname,

                file.mimetype,

                file.size,

                file.path,

                userId

            ]

        );

    }

    async getAll() {

        return await all(

            `
                SELECT *

                FROM uploads

                ORDER BY id DESC
            `

        );

    }

    async remove(id) {

        const files = await all(

            `
                SELECT *

                FROM uploads

                WHERE id = ?
            `,

            [id]

        );

        if (!files.length) {

            throw new Error("File not found");

        }

        const file = files[0];

        if (fs.existsSync(file.file_path)) {

            fs.unlinkSync(file.file_path);

        }

        await run(

            `
                DELETE

                FROM uploads

                WHERE id = ?
            `,

            [id]

        );

        return true;

    }

}

module.exports = new UploadService();