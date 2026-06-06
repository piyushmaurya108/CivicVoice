const { draftPetition } = require('./geminiService');

/**
 * Generate a specific petition letter for a single anonymous citizen (Change 5).
 * Note: nearbyCount is intentionally NOT passed/used — the letter never mentions counts.
 */
async function generatePetition({ type, severity, userDescription, aiDescription, address, portal }) {
  return draftPetition({
    type,
    severity,
    userDescription: userDescription || '',
    aiDescription: aiDescription || '',
    address: address || {},
    portalOfficer: portal?.officer || 'The Concerned Government Authority',
    portalName: portal?.name || ''
  });
}

module.exports = { generatePetition };
