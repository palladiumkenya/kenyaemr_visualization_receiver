const express = require("express");
const router = express.Router();
const controller = require("../controllers/dataset_controller");

router.post("/", controller.createDataset);

module.exports = router;
