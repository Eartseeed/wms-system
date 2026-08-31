
const express =
    require(
        "express"
    );


const router =
    express.Router();


const SyncController =
    require(
        "../controllers/syncController"
    );


const {
    authenticate,
    authorize
} =
    require(
        "../middleware/auth"
    );


// =====================================================
// ALL SYNC ROUTES REQUIRE LOGIN
// =====================================================

router.use(
    authenticate
);


// =====================================================
// LAST SYNC
//
// ADMIN + SUPERVISOR
// =====================================================

router.get(
    "/last",
    authorize(
        "admin",
        "supervisor"
    ),
    SyncController.getLastSync
);


// =====================================================
// SYNC HISTORY
//
// ADMIN + SUPERVISOR
// =====================================================

router.get(
    "/history",
    authorize(
        "admin",
        "supervisor"
    ),
    SyncController.history
);


// =====================================================
// GET CHANGES
//
// ADMIN + SUPERVISOR
// =====================================================

router.get(
    "/changes",
    authorize(
        "admin",
        "supervisor"
    ),
    SyncController.getChanges
);


// =====================================================
// SYNC NOW
//
// ADMIN + SUPERVISOR
// =====================================================

router.post(
    "/",
    authorize(
        "admin",
        "supervisor"
    ),
    SyncController.sync
);


module.exports =
    router;
