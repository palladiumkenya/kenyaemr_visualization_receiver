#!/usr/bin/env node
//
// Mints a Bearer token for third-party access to the read API (GET /spot/:fid).
// The token is signed with ACCESS_JWT_SECRET, which middleware/jwt_auth.js verifies.
//
// Usage:
//   node scripts/generate_access_token.js <subject> [expiry]
//
// Examples:
//   node scripts/generate_access_token.js spot-hie            # expires in 365d
//   node scripts/generate_access_token.js spot-hie 90d
//   node scripts/generate_access_token.js spot-hie never      # no expiry (not recommended)
//
const jwt = require("jsonwebtoken");
require("dotenv").config();

const [, , subject, expiry = "365d"] = process.argv;

if (!subject) {
    console.error("Usage: node scripts/generate_access_token.js <subject> [expiry]");
    console.error("Example: node scripts/generate_access_token.js spot-hie 365d");
    process.exit(1);
}

const secret = process.env.ACCESS_JWT_SECRET;
if (!secret) {
    console.error("ACCESS_JWT_SECRET is not set. Add it to .env before generating a token.");
    process.exit(1);
}

const options = expiry === "never" ? {} : { expiresIn: expiry };
const token = jwt.sign({ sub: subject }, secret, options);
const decoded = jwt.decode(token);

console.log(`\nSubject : ${decoded.sub}`);
console.log(`Issued  : ${new Date(decoded.iat * 1000).toISOString()}`);
console.log(`Expires : ${decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "never"}`);
console.log(`\nToken (share over a secure channel; it cannot be retrieved again):\n\n${token}\n`);
console.log("Test it with:");
console.log(`  curl -H "Authorization: Bearer <token>" https://<host>/spot/<FID>\n`);
