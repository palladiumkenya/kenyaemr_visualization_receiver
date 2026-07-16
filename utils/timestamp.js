// Convert the compact KenyaEMR timestamp (YYYYMMDDHHMMSS) into a
// "YYYY-MM-DD HH:MM:SS" string. Returns both the formatted string and the
// original compact value (used when building record_pk composites).
function parseTimestamp(timestamp_unix) {
    const year = timestamp_unix.substring(0, 4);
    const month = timestamp_unix.substring(4, 6); // Months are 0-based
    const day = timestamp_unix.substring(6, 8);
    const hours = timestamp_unix.substring(8, 10);
    const minutes = timestamp_unix.substring(10, 12);
    const seconds = timestamp_unix.substring(12, 14);

    const timestamp = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

    return { timestamp, timestamp_unix };
}

module.exports = { parseTimestamp };
