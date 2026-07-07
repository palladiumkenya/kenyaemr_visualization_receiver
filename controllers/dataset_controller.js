const _ = require("lodash");
const base64 = require("base64util");
const logger = require("../logger");

const { resolveFacility } = require("../utils/facility");
const { parseTimestamp } = require("../utils/timestamp");
const services = require("../services");
const { Version } = require("../models/version");

async function createDataset(req, res) {
    const mfl_code = req.body.mfl_code;
    const timestamp_unix = req.body.timestamp;
    const dataset_type = req.body.dataset_type;
    const data = req.body.data;

    // Validate dataset_type is present and supported
    if (!dataset_type || typeof services[dataset_type] !== "function") {
        return res.status(400).json({
            success: false,
            msg: `Unknown or missing dataset_type: '${dataset_type}'`,
        });
    }

    // Validate data payload
    if (_.isEmpty(data)) {
        return res.status(400).json({
            success: false,
            msg: 'Missing or empty data payload',
        });
    }

    const { timestamp } = parseTimestamp(timestamp_unix);

    const facility = await resolveFacility(mfl_code);
    if (facility === null) {
        return res.status(500).json({
            success: false,
            msg: 'An Error Occurred, Missing Facility Locator Information',
            data: {
                "timestamp": timestamp,
                "mfl_code": mfl_code,
            },
        });
    }

    const facility_attributes = {
        "timestamp": timestamp,
        "mfl_code": mfl_code,
        "county": facility.county,
        "sub_county": facility.sub_county,
        "facility_name": facility.facility_name,
    };

    logger.debug('dataset_type: %s, facility_attributes: %o', dataset_type, facility_attributes);

    try {
        if (!_.isEmpty(req.body.version)) {
            await Version.upsert({
                ...facility_attributes,
                version: req.body.version,
                record_pk: base64.encode(mfl_code + timestamp_unix + req.body.version),
            });
        }

        const result = await services[dataset_type]({
            data,
            facility_attributes,
            mfl_code,
            timestamp,
            timestamp_unix,
        });
        return res.status(200).json({
            success: true,
            msg: 'Record/s Created Successfully',
            data: result,
        });
    } catch (error) {
        logger.error('Error processing dataset_type %s: %s', dataset_type, error.message);
        return res.status(500).json({
            success: false,
            msg: 'An Error Occurred, Could Not Create Record',
            data: facility_attributes,
        });
    }
}

module.exports = { createDataset };
