const Sequelize = require("sequelize");
const logger = require("../logger");

const { ShaClaims } = require("../models/sha_claims");

// Maps raw claim statuses to report buckets by wildcard: a status qualifies when
// it *contains* one of the keywords (case-insensitive), so SUBMITTED_PROVIDER ->
// submitted. Rules are evaluated in order and the first match wins, so outcome
// buckets are listed before `submitted`. Statuses matching nothing (e.g. DRAFT)
// are counted in no bucket.
const STATUS_BUCKET_RULES = [
    { bucket: "sent_back", keywords: ["SENT_BACK", "SENTBACK", "RETURNED"] },
    { bucket: "failed", keywords: ["REJECTED", "DENIED", "FAILED"] },
    { bucket: "successful", keywords: ["APPROVED", "PAID", "SUCCESS"] },
    { bucket: "submitted", keywords: ["SUBMITTED"] },
];

// Returns the bucket a raw status belongs to, or null when it matches none.
function bucketFor(status) {
    const value = String(status || "").toUpperCase();
    const rule = STATUS_BUCKET_RULES.find((r) => r.keywords.some((k) => value.includes(k)));
    return rule ? rule.bucket : null;
}

function emptyBuckets() {
    return {
        submitted: { count: 0, amount: 0 },
        successful: { count: 0, amount: 0 },
        failed: { count: 0, amount: 0 },
        sent_back: { count: 0, amount: 0 },
    };
}

// GET /spot/:fid — SHA claims for a facility (by hie_facility_id), aggregated
// per claim_date + scheme, bucketed by status.
async function getShaClaims(req, res) {
    const fid = (req.params.fid || "").trim();
    if (!fid) {
        return res.status(400).json({ success: false, msg: "Missing facility id" });
    }

    try {
        // paranoid: false — the model is paranoid but the table has no deleted_at
        // column, so a default-scoped read would fail at the DB.
        const rows = await ShaClaims.findAll({
            attributes: [
                "claim_date",
                "scheme_code",
                "status",
                [Sequelize.fn("SUM", Sequelize.col("count")), "total_count"],
                [Sequelize.fn("SUM", Sequelize.col("amount")), "total_amount"],
            ],
            where: { hie_facility_id: fid },
            group: ["claim_date", "scheme_code", "status"],
            order: [["claim_date", "ASC"]],
            raw: true,
            paranoid: false,
        });

        // date -> scheme -> buckets
        const byDate = {};
        rows.forEach((row) => {
            const date = row.claim_date;
            const type = row.scheme_code ?? "UNKNOWN";
            const count = Number(row.total_count) || 0;
            const amount = Number(row.total_amount) || 0;

            byDate[date] = byDate[date] || {};
            byDate[date][type] = byDate[date][type] || emptyBuckets();
            const buckets = byDate[date][type];

            const bucket = bucketFor(row.status);
            if (bucket) {
                buckets[bucket].count += count;
                buckets[bucket].amount += amount;
            }
        });

        const data = Object.keys(byDate).sort().map((date) => ({
            date,
            claim_types: Object.keys(byDate[date]).sort().map((type) => ({
                type,
                ...byDate[date][type],
            })),
        }));

        return res.status(200).json({ success: true, fid, data });
    } catch (error) {
        logger.error("Error fetching spot sha claims for fid %s: %s", fid, error.message);
        return res.status(500).json({ success: false, msg: "An Error Occurred, Could Not Fetch Claims" });
    }
}

module.exports = { getShaClaims, STATUS_BUCKET_RULES, bucketFor };
