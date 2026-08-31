// =====================================================
// ROLE MIDDLEWARE
//
// ใช้ร่วมกับ authMiddleware
//
// authMiddleware ต้องใส่ข้อมูล User ลง:
//
// req.user = {
//     id,
//     username,
//     role
// }
// =====================================================


const normalizeRole =
    (role) => {

        const value =
            String(
                role ||
                "EMPLOYEE"
            )
                .trim()
                .toUpperCase();


        if (
            value === "ADMIN"
        ) {

            return "ADMIN";

        }


        if (
            value === "SUPERVISOR"
        ) {

            return "SUPERVISOR";

        }


        return "EMPLOYEE";

    };


// =====================================================
// REQUIRE ROLE
//
// ตัวอย่าง:
//
// router.get(
//     "/users",
//     authMiddleware,
//     requireRole("ADMIN"),
//     controller
// );
//
// หรือ:
//
// router.post(
//     "/imports",
//     authMiddleware,
//     requireRole(
//         "ADMIN",
//         "SUPERVISOR",
//         "EMPLOYEE"
//     ),
//     controller
// );
// =====================================================

const requireRole =
    (
        ...allowedRoles
    ) => {

        const normalizedAllowedRoles =
            allowedRoles.map(
                (
                    role
                ) =>
                    normalizeRole(
                        role
                    )
            );


        return (
            req,
            res,
            next
        ) => {

            // ---------------------------------------------
            // AUTH USER
            // ---------------------------------------------

            if (
                !req.user
            ) {

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    message:
                        "Unauthorized"

                });

            }


            // ---------------------------------------------
            // USER ROLE
            // ---------------------------------------------

            const userRole =
                normalizeRole(
                    req.user.role
                );


            // ---------------------------------------------
            // CHECK ROLE
            // ---------------------------------------------

            if (
                !normalizedAllowedRoles.includes(
                    userRole
                )
            ) {

                return res.status(
                    403
                ).json({

                    success:
                        false,

                    message:
                        "You do not have permission to access this resource"

                });

            }


            return next();

        };

    };


// =====================================================
// EXPORT
// =====================================================

module.exports =
    {

        normalizeRole,

        requireRole

    };