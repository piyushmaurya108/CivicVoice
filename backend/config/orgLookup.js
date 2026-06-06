const orgs = require('./organisations.json');

const MAX_ORGS = 6;

function relevant(org, type) {
  if (!org.types || org.types === 'all') return true;
  if (Array.isArray(org.types)) return org.types.includes(type);
  return true;
}

/**
 * Select relevant organisations for a complaint type + state (Change 7).
 * National-relevant first, then state-specific; capped at ~6.
 * RTI Online is returned separately so the UI can pin it to the bottom.
 */
function getOrganisationsFor(type, state) {
  const list = [];
  const seen = new Set();
  const add = (org, scope) => {
    if (!org || seen.has(org.name)) return;
    seen.add(org.name);
    list.push({ ...org, scope });
  };

  // National first (the 5 mandated nationals are 'all'-type and always relevant)
  orgs.national.forEach((o) => {
    if (relevant(o, type)) add(o, 'national');
  });

  // State-specific relevant orgs
  const stateOrgs = (state && orgs.states[state]) || [];
  stateOrgs.forEach((o) => {
    if (relevant(o, type)) add(o, 'state');
  });

  return {
    list: list.slice(0, MAX_ORGS),
    rti: orgs._rti,
    meta: orgs._meta
  };
}

module.exports = { getOrganisationsFor };
