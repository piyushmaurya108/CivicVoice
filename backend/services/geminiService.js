const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

let _client = null;
function client() {
  if (!_client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    _client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _client;
}

const VALID_TYPES = ['broken_road', 'waterlogging', 'garbage', 'streetlight', 'sewage', 'water_supply', 'other'];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];

const FALLBACK_ANALYSIS = {
  type: 'other',
  severity: 'medium',
  aiDescription: 'A civic issue requiring immediate attention from the relevant authorities.',
  landmark: null,
  confidence: 0.5
};

const TYPE_LABELS = {
  broken_road: 'broken/damaged road',
  waterlogging: 'waterlogging and flooding',
  garbage: 'garbage accumulation',
  streetlight: 'non-functional streetlight',
  sewage: 'sewage overflow',
  water_supply: 'water supply disruption',
  other: 'civic infrastructure issue'
};

// Type-specific demanded action used in the petition (Change 5).
const TYPE_DEMANDS = {
  broken_road:
    'carry out an immediate site inspection and repair/re-lay the damaged road surface, fill the potholes, and restore safe motorable condition',
  waterlogging:
    'clear and de-silt the storm-water drains, pump out the accumulated water, and undertake permanent drainage works to prevent recurrence',
  garbage:
    'arrange immediate lifting of the accumulated garbage, restore regular door-to-door collection, and place/maintain proper bins at this location',
  streetlight:
    'repair or replace the non-functional streetlight(s) and restore lighting on this stretch on priority for the safety of residents',
  sewage:
    'clear the sewage overflow, unblock and clean the affected sewer line/manhole, and disinfect the area to remove the health hazard',
  water_supply:
    'restore regular and adequate drinking-water supply to this locality and inspect the supply line for leakage or contamination',
  other:
    'depute the concerned official for a site inspection and undertake the necessary remedial work on priority'
};

function keywordClassify(text) {
  const t = (text || '').toLowerCase();
  const has = (...words) => words.some((w) => t.includes(w));
  if (has('pothole', 'broken road', 'road damage', 'crack', 'gravel', 'tar', 'speed breaker')) return 'broken_road';
  if (has('waterlog', 'flood', 'rain water', 'water logging', 'standing water')) return 'waterlogging';
  if (has('garbage', 'trash', 'dump', 'waste', 'litter', 'rubbish')) return 'garbage';
  if (has('streetlight', 'street light', 'lamp', 'pole light', 'dark street', 'no light')) return 'streetlight';
  if (has('sewage', 'sewer', 'manhole', 'drain overflow', 'gutter')) return 'sewage';
  if (has('water supply', 'no water', 'drinking water', 'tap', 'tanker', 'low pressure')) return 'water_supply';
  return 'other';
}

/**
 * Analyse a Cloudinary-hosted image with Gemini Vision (gemini-2.0-flash).
 * Returns { type, severity, aiDescription, landmark, confidence }. Never throws.
 */
async function analyseImage(imageUrl, userDescription = '') {
  try {
    const model = client().getGenerativeModel({ model: 'gemini-2.0-flash' });

    const imgRes = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 15000
    });
    const imageBase64 = Buffer.from(imgRes.data).toString('base64');
    const mimeType = imgRes.headers['content-type'] || 'image/jpeg';

    const prompt = `Analyse this image of a civic problem in India. Return ONLY a valid JSON object with these exact fields, no markdown, no backticks, no explanation:
{
  "type": "one of: broken_road, waterlogging, garbage, streetlight, sewage, water_supply, other",
  "severity": "one of: low, medium, high, critical",
  "aiDescription": "1-2 sentence formal description for a government petition",
  "landmark": "any visible landmark or street name, or null",
  "confidence": 0.85
}
${userDescription ? `\nThe citizen also wrote this description, use it together with the image: "${userDescription}"` : ''}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } }
    ]);

    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!VALID_TYPES.includes(parsed.type)) parsed.type = 'other';
    if (!VALID_SEVERITIES.includes(parsed.severity)) parsed.severity = 'medium';
    if (!parsed.aiDescription) parsed.aiDescription = FALLBACK_ANALYSIS.aiDescription;
    parsed.landmark = parsed.landmark || null;
    parsed.confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.7;

    return parsed;
  } catch (error) {
    console.error('Gemini vision failed, using fallback:', error.message);
    return {
      ...FALLBACK_ANALYSIS,
      type: keywordClassify(userDescription),
      aiDescription: userDescription || FALLBACK_ANALYSIS.aiDescription
    };
  }
}

/**
 * Analyse a complaint from the citizen's text description only (no photo) — Change 2.
 * Returns the same shape as analyseImage. Never throws.
 */
async function analyseText(userDescription = '') {
  const desc = (userDescription || '').trim();
  try {
    const model = client().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `A citizen in India is reporting a civic problem in their own words (no photo provided). Based ONLY on this description, return ONLY a valid JSON object, no markdown, no backticks, no explanation:
{
  "type": "one of: broken_road, waterlogging, garbage, streetlight, sewage, water_supply, other",
  "severity": "one of: low, medium, high, critical",
  "aiDescription": "1-2 sentence formal description for a government petition, based on the citizen's words",
  "landmark": "any landmark or street name mentioned, or null",
  "confidence": 0.8
}

Citizen's description: "${desc}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!VALID_TYPES.includes(parsed.type)) parsed.type = keywordClassify(desc);
    if (!VALID_SEVERITIES.includes(parsed.severity)) parsed.severity = 'medium';
    if (!parsed.aiDescription) parsed.aiDescription = desc || FALLBACK_ANALYSIS.aiDescription;
    parsed.landmark = parsed.landmark || null;
    parsed.confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.6;
    return parsed;
  } catch (error) {
    console.error('Gemini text analysis failed, using keyword fallback:', error.message);
    return {
      type: keywordClassify(desc),
      severity: 'medium',
      aiDescription: desc || FALLBACK_ANALYSIS.aiDescription,
      landmark: null,
      confidence: 0.4
    };
  }
}

/**
 * Draft a specific formal petition for a SINGLE anonymous citizen (Change 5).
 * - Addresses the named officer of the matched portal.
 * - Subject = problem type + locality + city.
 * - Body uses the citizen's own words + (optional) image analysis.
 * - Mentions ward, locality, city, district, state.
 * - Demanded action is specific to the complaint type.
 * - NEVER mentions how many people reported the issue.
 * Falls back to a complete templated letter on failure (never empty).
 */
async function draftPetition({ type, severity, userDescription, aiDescription, address, portalOfficer, portalName }) {
  const typeLabel = TYPE_LABELS[type] || 'civic infrastructure issue';
  const demand = TYPE_DEMANDS[type] || TYPE_DEMANDS.other;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const ward = address?.ward || '';
  const locality = address?.locality || address?.city || 'the locality';
  const city = address?.city || address?.district || '';
  const district = address?.district || '';
  const state = address?.state || '';
  const pincode = address?.pincode || '';

  const fullLoc =
    [address?.ward, address?.locality, address?.city, address?.district, address?.state, address?.pincode]
      .filter(Boolean)
      .join(', ') || 'the affected area';

  const subjectLoc = [locality, city].filter(Boolean).join(', ') || 'our area';
  const officer = portalOfficer || 'The Concerned Government Authority';
  const citizenNote = (userDescription || '').trim();
  const aiNote = (aiDescription || '').trim();

  try {
    const model = client().getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are writing a formal grievance petition letter for ONE individual anonymous Indian citizen (not a group). Use formal Indian government correspondence style.

Problem type: ${typeLabel}
Severity: ${severity}
Citizen's own description (use their words and concerns): "${citizenNote}"
${aiNote ? `Additional analysis of the attached photo: "${aiNote}"` : 'No photo was provided; rely on the citizen\'s description.'}
Exact location — Ward: ${ward || 'N/A'}; Locality: ${locality}; City: ${city || 'N/A'}; District: ${district || 'N/A'}; State: ${state || 'N/A'}; PIN: ${pincode || 'N/A'}
Address the letter to (by name/title): ${officer}${portalName ? ` (at ${portalName})` : ''}

STRICT REQUIREMENTS:
- Salutation MUST address the specific officer/department above. Do NOT use "Dear Sir/Madam" as the only salutation; write e.g. "To,\\n${officer}".
- Subject line MUST include the problem type AND the locality AND the city: e.g. "Subject: ${typeLabel} at ${subjectLoc}".
- Include the line "Date: ${todayStr}".
- Body MUST mention the ward (if any), locality, city, district and state explicitly.
- Body MUST be based on the citizen's own description above${aiNote ? ' combined with the photo analysis' : ''}.
- The demanded action MUST be specific to this problem type: ${demand}. Request action within 7 working days and a written update.
- This is from a SINGLE citizen. Do NOT mention any number of citizens/residents/people, no "we", no counts, no "multiple citizens". Write in the first person singular ("I").
- Sign off exactly as: "A Concerned Citizen of ${subjectLoc}". Do NOT add any count.
- Complete, ready to copy-paste. No placeholders, no brackets like [NAME]/[DATE], no blank fields.
- Under 320 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini petition draft failed, using fallback template:', error.message);

    const basis = aiNote
      ? `${citizenNote} (As also evident from the photograph submitted: ${aiNote})`
      : citizenNote;

    return `Subject: ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} at ${subjectLoc}

Date: ${todayStr}

To,
${officer}${portalName ? `\n${portalName}` : ''}

Respected Sir/Madam,

I am a resident of ${fullLoc}, and I wish to bring to your urgent attention a serious ${typeLabel} in my area. ${basis}

The problem is located in${ward ? ` Ward ${ward},` : ''} ${locality}${city ? `, ${city}` : ''}${district ? `, ${district} district` : ''}${state ? `, ${state}` : ''}${pincode ? ` (PIN ${pincode})` : ''}. The severity of the situation is ${severity}, and it is causing real hardship and a public-safety risk to people using this area daily.

I respectfully request your office to ${demand}, within the next 7 working days, and to provide me a written update on the action taken. As a law-abiding citizen and taxpayer, I rely on your office to ensure basic, functional civic infrastructure and timely redressal of this grievance.

I trust this matter will receive the urgency it deserves.

Yours faithfully,
A Concerned Citizen of ${subjectLoc}`;
  }
}

module.exports = { analyseImage, analyseText, draftPetition };
