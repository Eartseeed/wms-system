const { all, get, run } = require("../config/database");

class SupplierService {

    async getAll(search = "") {

        if (search && search.trim() !== "") {

            const keyword = `%${search}%`;

            return await all(
                `
                SELECT

                    id,
                    code,
                    name AS supplier_name,
                    contact_name,
                    phone,
                    email,
                    tax_number,
                    address,
                    note,
                    status,
                    created_at,
                    updated_at

                FROM suppliers

                WHERE

                    name LIKE ?
                    OR phone LIKE ?
                    OR address LIKE ?

                ORDER BY name
                `,
                [keyword, keyword, keyword]
            );

        }

        return await all(
            `
            SELECT

                id,
                code,
                name AS supplier_name,
                contact_name,
                phone,
                email,
                tax_number,
                address,
                note,
                status,
                created_at,
                updated_at

            FROM suppliers

            ORDER BY name
            `
        );

    }

    async getById(id) {

        return await get(
            `
            SELECT

                id,
                code,
                name AS supplier_name,
                contact_name,
                phone,
                email,
                tax_number,
                address,
                note,
                status,
                created_at,
                updated_at

            FROM suppliers

            WHERE id=?
            `,
            [id]
        );

    }

    async create(data) {

        return await run(
            `
            INSERT INTO suppliers
            (
                code,
                name,
                phone,
                address
            )
            VALUES
            (
                ?,?,?,?
            )
            `,
            [
                "SUP" + Date.now(),
                data.supplier_name,
                data.phone,
                data.address
            ]
        );

    }

    async update(id, data) {

        return await run(
            `
            UPDATE suppliers

            SET

                name=?,
                phone=?,
                address=?,
                updated_at=CURRENT_TIMESTAMP

            WHERE id=?
            `,
            [
                data.supplier_name,
                data.phone,
                data.address,
                id
            ]
        );

    }

    async delete(id) {

        return await run(
            `
            DELETE FROM suppliers
            WHERE id=?
            `,
            [id]
        );

    }

}

module.exports = new SupplierService();