const express = require("express");
const router = express.Router();
const { jwtAuth } = require("../middleware/jwt_auth");
const controller = require("../controllers/spot_controller");

router.get("/:fid", jwtAuth, controller.getShaClaims);

module.exports = router;
