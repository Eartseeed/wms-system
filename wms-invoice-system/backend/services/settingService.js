const { all, get, run } = require("../config/database");

class SettingService {

    async getAll() {

        return await all(

            `
                SELECT *

                FROM settings

                ORDER BY setting_key
            `

        );

    }

    async getByKey(key) {

        return await get(

            `
                SELECT *

                FROM settings

                WHERE setting_key = ?
            `,

            [key]

        );

    }

    async save(key, value, userId = null) {

        const setting = await this.getByKey(key);

        if (setting) {

            return await run(

                `
                    UPDATE settings

                    SET

                        setting_value = ?,

                        updated_by = ?,

                        updated_at = CURRENT_TIMESTAMP

                    WHERE setting_key = ?
                `,

                [

                    value,

                    userId,

                    key

                ]

            );

        }

        return await run(

            `
                INSERT INTO settings(

                    setting_key,

                    setting_value,

                    created_by

                )

                VALUES(?,?,?)

            `,

            [

                key,

                value,

                userId

            ]

        );

    }

    async remove(key) {

        return await run(

            `
                DELETE

                FROM settings

                WHERE setting_key = ?
            `,

            [key]

        );

    }

}

module.exports = new SettingService();  