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

/**
 * Analyse a Cloudinary-hosted image with Gemini Vision (gemini-2.0-flash).
 * Returns { type, severity, aiDescription, landmark, confidence }.
 * Always returns — never throws.
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
${userDescription ? `\nUser also wrote: "${userDescription}"` : ''}`;

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
      aiDescription: userDescription || FALLBACK_ANALYSIS.aiDescription
    };
  }
}

/**
 * Draft a formal petition letter. Falls back to a templated letter on failure.
 */
async function draftPetition({ type, severity, aiDescription, address, nearbyCount, portalOfficer }) {
  const typeLabels = {
    broken_road: 'broken/damaged road',
    waterlogging: 'waterlogging and flooding',
    garbage: 'garbage accumulation',
    streetlight: 'non-functional streetlight',
    sewage: 'sewage overflow',
    water_supply: 'water supply disruption',
    other: 'civic infrastructure issue'
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const localityStr = address?.locality || address?.city || 'the locality';
  const cityStr = address?.city || address?.state || '';
  const fullLoc =
    [address?.locality, address?.city, address?.district, address?.state]
      .filter(Boolean)
      .join(', ') || 'the affected area';

  try {
    const model = client().getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a petition writer for Indian citizens. Write a formal government petition letter.

Problem: ${typeLabels[type] || type}
Location: ${fullLoc}
Number of affected citizens who reported this: ${nearbyCount}
Problem description: ${aiDescription}
Severity: ${severity}
Addressed to: ${portalOfficer || 'The Concerned Government Authority'}

Requirements:
- Formal government letter format
- Include: Subject line, Date: ${todayStr}, Salutation, 2-3 paragraphs about the problem and its impact, demand for urgent action within 7 days, closing
- Professional tone, under 300 words
- Sign off as: "Concerned Citizens of ${localityStr}, ${cityStr} (${nearbyCount} residents)"
- Do NOT use placeholder text like [NAME] or [DATE] — write a complete, ready-to-submit letter`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini petition draft failed, using fallback template:', error.message);

    return `Subject: Urgent Grievance Regarding ${typeLabels[type] || 'Civic Issue'} at ${fullLoc}

Date: ${todayStr}

To,
${portalOfficer || 'The Concerned Government Authority'}

Respected Sir/Madam,

We, the undersigned citizens residing in ${fullLoc}, wish to bring to your urgent attention a serious ${typeLabels[type] || 'civic issue'} affecting our community. ${aiDescription}

This issue has been reported by ${nearbyCount} concerned citizens in our locality and is causing significant hardship to residents, especially the elderly, children, and daily commuters. The severity of this problem has been assessed as ${severity}, and immediate intervention is required to prevent further deterioration and potential public-safety risks.

We respectfully request your office to take prompt action to redress this grievance within the next 7 working days. We urge the concerned department to inspect the site, undertake repair or remedial work, and update the citizens on the action taken. As taxpayers and law-abiding residents, we have the right to basic civic infrastructure and timely redressal of public grievances.

We trust that you will treat this matter with the urgency it deserves. We are willing to provide any further information or documentation required.

Yours faithfully,
Concerned Citizens of ${localityStr}, ${cityStr} (${nearbyCount} residents)`;
  }
}

module.exports = { analyseImage, draftPetition };
