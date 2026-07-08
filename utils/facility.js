const http = require("https");
require("dotenv").config();
const logger = require("../logger");

const FACILITY_CACHE_TTL_MS = (parseInt(process.env.FACILITY_CACHE_TTL_HOURS, 10) || 24) * 60 * 60 * 1000;
const facilityCache = new Map();

// Check Empty Json
function isEmptyJSON(jsonObject) {
    return JSON.stringify(jsonObject) === '{}' || JSON.stringify(jsonObject) === '[]';
}

// Pull Facility Locator Information ie Name, County & Sub County from HIS list
function fetchData(mfl_code) {
    const cached = facilityCache.get(mfl_code);
    if (cached && (Date.now() - cached.timestamp < FACILITY_CACHE_TTL_MS)) {
        logger.debug(`Facility cache hit for MFL code: ${mfl_code}`);
        return Promise.resolve(cached.data);
    }

    const options = {
        rejectUnauthorized: false
    };
    const fullUrl = `${process.env.HIS_LIST}${mfl_code}`;
    logger.debug(`Full HIS URL: ${fullUrl}`);
    return new Promise((resolve, reject) => {

        http.get(process.env.HIS_LIST + mfl_code, options, (response) => {

            let data = '';

            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    facilityCache.set(mfl_code, { data: parsedData, timestamp: Date.now() });
                    logger.debug(`Facility cache set for MFL code: ${mfl_code}`);
                    resolve(parsedData);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Resolve a facility's locator details. Returns null when the facility is
// missing/empty so callers can respond with the appropriate error.
async function resolveFacility(mfl_code) {
    const facility_details = await fetchData(mfl_code);
    if ((isEmptyJSON(facility_details.facilities) === true) || (facility_details.facilities === undefined)) {
        return null;
    }
    return {
        county: facility_details.facilities[0]._county,
        sub_county: facility_details.facilities[0]._subcounty,
        facility_name: facility_details.facilities[0].name,
    };
}

module.exports = { fetchData, isEmptyJSON, resolveFacility, facilityCache };
