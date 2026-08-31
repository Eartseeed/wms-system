const fs = require("fs");
const path = require("path");
const { run, all } = require("../config/database");

class UploadService {

    // =========================================================
    // SAVE UPLOADED FILE
    // =========================================================

    async save(file, options = {}) {

        if (!file) {
            throw new Error("File is required");
        }

        const userId =
            options.user_id ??
            options.uploaded_by ??
            null;

        const uploadType =
            options.upload_type ??
            "GENERAL";

        const referenceType =
            options.reference_type ??
            null;

        const referenceId =
            options.reference_id ??
            null;

        const fileExtension =
            path.extname(
                file.originalname || ""
            )
            .replace(".", "")
            .toLowerCase();

        const result =
            await run(

                `
                    INSERT INTO uploads (

                        file_name,

                        original_name,

                        file_path,

                        file_extension,

                        mime_type,

                        file_size,

                        upload_type,

                        reference_type,

                        reference_id,

                        uploaded_by

                    )

                    VALUES (

                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?

                    )
                `,

                [

                    file.filename,

                    file.originalname,

                    file.path,

                    fileExtension,

                    file.mimetype,

                    file.size,

                    uploadType,

                    referenceType,

                    referenceId,

                    userId

                ]

            );

        return {

            id:
                result?.id,

            file_name:
                file.filename,

            original_name:
                file.originalname,

            file_path:
                file.path,

            file_extension:
                fileExtension,

            mime_type:
                file.mimetype,

            file_size:
                file.size,

            upload_type:
                uploadType,

            reference_type:
                referenceType,

            reference_id:
                referenceId,

            uploaded_by:
                userId

        };

    }


    // =========================================================
    // GET ALL FILES
    // =========================================================

    async getAll() {

        return await all(

            `
                SELECT

                    id,

                    file_name,

                    original_name,

                    file_path,

                    file_extension,

                    mime_type,

                    file_size,

                    upload_type,

                    reference_type,

                    reference_id,

                    uploaded_by,

                    created_at

                FROM uploads

                ORDER BY id DESC

            `

        );

    }


    // =========================================================
    // GET BY ID
    // =========================================================

    async getById(id) {

        return await all(

            `
                SELECT

                    id,

                    file_name,

                    original_name,

                    file_path,

                    file_extension,

                    mime_type,

                    file_size,

                    upload_type,

                    reference_type,

                    reference_id,

                    uploaded_by,

                    created_at

                FROM uploads

                WHERE id = ?

                LIMIT 1

            `,

            [id]

        );

    }


    // =========================================================
    // DELETE FILE
    // =========================================================

    async remove(id) {

        const files =
            await this.getById(id);

        if (
            !files ||
            !files.length
        ) {

            throw new Error(
                "File not found"
            );

        }

        const file =
            files[0];

        // -----------------------------------------------------
        // Delete physical file
        // -----------------------------------------------------

        if (
            file.file_path &&
            fs.existsSync(file.file_path)
        ) {

            try {

                fs.unlinkSync(
                    file.file_path
                );

            } catch (err) {

                console.error(
                    "Failed to delete physical file:",
                    err
                );

            }

        }

        // -----------------------------------------------------
        // Delete database record
        // -----------------------------------------------------

        const result =
            await run(

                `
                    DELETE

                    FROM uploads

                    WHERE id = ?

                `,

                [id]

            );

        if (
            !result ||
            result.changes === 0
        ) {

            throw new Error(
                "Failed to delete file record"
            );

        }

        return {

            id,

            deleted: true

        };

    }

}


// =========================================================
// EXPORT
// =========================================================

module.exports =
    new UploadService();