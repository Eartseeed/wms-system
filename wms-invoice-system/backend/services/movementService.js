const { all, get, run } = require("../config/database");

class MovementService {

    async getAll() {

        return await all(

            `
                SELECT

                    sm.*,

                    p.code,

                    p.name

                FROM stock_movements sm

                LEFT JOIN products p

                    ON p.id = sm.product_id

                ORDER BY sm.id DESC

            `

        );

    }

    async getById(id) {

        return await get(

            `
                SELECT *

                FROM stock_movements

                WHERE id = ?

            `,

            [id]

        );

    }

    async getByProduct(productId) {

        return await all(

            `
                SELECT *

                FROM stock_movements

                WHERE product_id = ?

                ORDER BY id DESC

            `,

            [productId]

        );

    }

    async create(data) {

        return await run(

            `
                INSERT INTO stock_movements (

                    product_id,

                    warehouse_id,

                    movement_type,

                    qty,

                    reference_no,

                    remark,

                    created_by

                )

                VALUES (?,?,?,?,?,?,?)

            `,

            [

                data.product_id,

                data.warehouse_id,

                data.movement_type,

                data.qty,

                data.reference_no,

                data.remark,

                data.created_by

            ]

        );

    }

    async delete(id) {

        return await run(

            `
                DELETE

                FROM stock_movements

                WHERE id = ?

            `,

            [id]

        );

    }

}

module.exports = new MovementService();