const { draftPetition } = require('./geminiService');

/**
 * Generate a petition letter for a complaint cluster.
 * Wraps geminiService.draftPetition with sensible defaults.
 */
async function generatePetition({ type, severity, aiDescription, address, nearbyCount, portal }) {
  return draftPetition({
    type,
    severity,
    aiDescription: aiDescription || 'A civic infrastructure issue requiring urgent attention',
    address: address || {},
    nearbyCount: nearbyCount || 1,
    portalOfficer: portal?.officer || 'The Concerned Government Authority'
  });
}

module.exports = { generatePetition };
