const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

// This is the standard and recommended way to protect routes with Clerk
const clerkAuthMiddleware = ClerkExpressWithAuth();

module.exports = { clerkAuthMiddleware };
