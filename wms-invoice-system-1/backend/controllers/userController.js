const UserService =
    require(
        "../services/userService"
    );

class UserController {


    async getAll(
        req,
        res
    ) {

        try {

            const data =
                await UserService.getAll();


            return res.json({

                success:
                    true,

                total:
                    data.length,

                data

            });


        } catch (
            err
        ) {

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        err.message

                });

        }

    }


    async getById(
        req,
        res
    ) {

        try {

            const data =
                await UserService.getById(
                    req.params.id
                );


            if (
                !data
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "User not found"

                    });

            }


            return res.json({

                success:
                    true,

                data

            });


        } catch (
            err
        ) {

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        err.message

                });

        }

    }


    async create(
        req,
        res
    ) {

        try {

            const data =
                await UserService.create(
                    req.body
                );


            return res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "User created",

                    data

                });


        } catch (
            err
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        err.message

                });

        }

    }


    async update(
        req,
        res
    ) {

        try {

            const data =
                await UserService.update(
                    req.params.id,
                    req.body
                );


            return res.json({

                success:
                    true,

                    message:
                        "User updated",

                    data

                });


        } catch (
            err
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        err.message

                });

        }

    }


    async resetPassword(
        req,
        res
    ) {

        try {

            const data =
                await UserService.resetPassword(
                    req.params.id,
                    req.body.password
                );


            return res.json({

                success:
                    true,

                    message:
                        "Password reset successfully",

                    data

                });


        } catch (
            err
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        err.message

                });

        }

    }


    async delete(
        req,
        res
    ) {

        try {

            await UserService.delete(
                req.params.id
            );


            return res.json({

                success:
                    true,

                    message:
                        "User deleted"

            });


        } catch (
            err
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        err.message

                });

        }

    }

}


module.exports =
    new UserController();