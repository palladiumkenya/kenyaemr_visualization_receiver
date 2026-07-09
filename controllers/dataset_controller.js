const _ = require("lodash");
const base64 = require("base64util");
const logger = require("../logger");

const { resolveFacility } = require("../utils/facility");
const { parseTimestamp } = require("../utils/timestamp");
const services = require("../services");
const schemas = require("../schemas");
const { envelopeSchema } = require("../schemas/envelope");
const { Version } = require("../models/version");

async function createDataset(req, res) {
    const dataset_type = req.body.dataset_type;

    // Validate dataset_type is present and supported (has both a service and a schema)
    const dataSchema = schemas[dataset_type];
    if (!dataset_type || typeof services[dataset_type] !== "function" || !dataSchema) {
        return res.status(400).json({
            success: false,
            msg: `Unknown or missing dataset_type: '${dataset_type}'`,
        });
    }

    // Validate the full payload (envelope + per-dataset_type data) with Zod.
    // Map issues to their full dotted path so nested/missing fields are actionable
    // (e.g. "data.2.schemes.0.statuses.1.count").
    const parsed = envelopeSchema.extend({ data: dataSchema }).safeParse(req.body);
    if (!parsed.success) {
        const errors = parsed.error.issues.map((issue) => ({
            field: issue.path.length ? issue.path.join(".") : "(root)",
            message: issue.message,
        }));
        return res.status(400).json({
            success: false,
            msg: 'Payload validation failed',
            errors,
        });
    }

    const { mfl_code, hie_facility_id, timestamp: timestamp_unix, version, data } = parsed.data;

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
        if (!_.isEmpty(version)) {
            await Version.upsert({
                ...facility_attributes,
                version: version,
                record_pk: base64.encode(mfl_code + timestamp_unix + version),
            });
        }

        const result = await services[dataset_type]({
            data,
            facility_attributes,
            mfl_code,
            hie_facility_id,
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
