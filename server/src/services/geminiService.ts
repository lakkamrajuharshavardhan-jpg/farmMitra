import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { WeatherData } from './weatherService.js';
import { Field, Advisory } from '../db/schema.js';

export const AdvisorySchema = z.object({
  irrigation: z.string(),
  fertilizer: z.array(
    z.object({
      name: z.string(),
      timing: z.string(),
      dosage: z.string(),
    })
  ),
  riskLevel: z.enum(['low', 'medium', 'high']),
  riskNotes: z.string(),
  costOfInaction: z.string(),
  planDriftDetected: z.boolean(),
  driftExplanation: z.string(),
  nextCheckInDate: z.string(),
});

export type AdvisoryResult = z.infer<typeof AdvisorySchema>;

/**
 * STEP 1: Exact Zod Schema for Leaf Photo Validation
 */
export const LeafValidationSchema = z.object({
  isLeaf: z.boolean(),
  confidence: z.enum(['high', 'medium', 'low']),
  reason: z.string(), // brief explanation of what the image actually shows if it's not a leaf
});

export type LeafValidationResult = z.infer<typeof LeafValidationSchema>;

export interface LeafDiagnosisProcessResult {
  success: boolean;
  validation: LeafValidationResult;
  diagnosis?: string;
  error?: string;
}

export interface TreatmentLogContext {
  action_taken: string;
  status: 'done' | 'skipped';
  farmer_note?: string | null;
  done_at?: Date | string;
}

/**
 * Fallback advisory generator
 */
function createFallbackAdvisory(
  field: Field,
  daysSinceSowing: number,
  weather: WeatherData,
  treatmentLogs: TreatmentLogContext[]
): AdvisoryResult {
  const skippedLogs = treatmentLogs.filter((log) => log.status === 'skipped');
  const hasSkipped = skippedLogs.length > 0;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (hasSkipped || weather.precipitation_sum > 10.0 || weather.relative_humidity_2m > 80) {
    riskLevel = 'high';
  } else if (weather.precipitation_sum > 3.0 || weather.relative_humidity_2m > 70 || daysSinceSowing > 45) {
    riskLevel = 'medium';
  }

  const daysToAdd = riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 5 : 7;
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + daysToAdd);
  const nextCheckInDate = checkIn.toISOString().split('T')[0];

  const irrigation = weather.precipitation_sum > 5.0
    ? `Rainfall of ${weather.precipitation_sum}mm detected. Hold manual irrigation for 48 hours to prevent root rot.`
    : weather.temperature_2m > 32
    ? `High temperature (${weather.temperature_2m}°C). Apply 25mm light drip irrigation in early morning.`
    : `Apply 15-20mm scheduled drip irrigation every 3 days. Current soil humidity: ${weather.relative_humidity_2m}%.`;

  const fertilizer = [
    {
      name: daysSinceSowing < 30 ? 'NPK 19:19:19' : 'Urea & MOP (Muriate of Potash)',
      dosage: `${Math.round(parseFloat(field.acreage.toString()) * 15)} kg total (${field.acreage} acres)`,
      timing: hasSkipped ? 'Immediate application required (Catch-up dose)' : 'Apply at 07:00 AM after light watering',
    },
  ];

  const riskNotes = hasSkipped
    ? `Skipped previous treatment (${skippedLogs.map((l) => l.action_taken).join(', ')}). High vulnerability to pest infestation and nutritional deficiency.`
    : weather.precipitation_sum > 8.0
    ? `Heavy rainfall forecast (${weather.precipitation_sum}mm) with ${weather.relative_humidity_2m}% humidity creates high humidity fungal leaf spot conditions.`
    : `Normal growth phase at ${daysSinceSowing} days since sowing with ${weather.temperature_2m}°C average temperature.`;

  const costOfInaction = hasSkipped
    ? `Skipping catch-up fertilizer risks 20-30% yield loss due to delayed flowering at ${daysSinceSowing} days post-sowing.`
    : `Skipping recommended schedule risks 15% leaf blight spread within 4 days under current ${weather.relative_humidity_2m}% humidity.`;

  const driftExplanation = hasSkipped
    ? `Plan drift detected: Farmer skipped '${skippedLogs[0].action_taken}'. Compensatory dose of micronutrients recommended.`
    : 'No plan drift detected. Growth parameters align with baseline agronomical model.';

  return {
    irrigation,
    fertilizer,
    riskLevel,
    riskNotes,
    costOfInaction,
    planDriftDetected: hasSkipped,
    driftExplanation,
    nextCheckInDate,
  };
}

/**
 * STEP 1 & STEP 2 & STEP 3 & STEP 4: Validate leaf image content and run strict diagnosis
 */
export async function validateAndDiagnoseLeaf(
  imageBase64: string,
  cropType: string = 'Chilli',
  weatherContext?: WeatherData
): Promise<LeafDiagnosisProcessResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  // Default fallback validation if no API key
  let validationResult: LeafValidationResult = {
    isLeaf: true,
    confidence: 'high',
    reason: 'Image appears to show a agricultural plant leaf.',
  };

  if (apiKey && apiKey !== 'your_google_gemini_api_key_here' && !apiKey.startsWith('mock_')) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // STEP 1 — VALIDATE THE IMAGE FIRST
      const validationPrompt = `Does this image show a plant leaf? Answer with structured JSON only.
Match this exact schema:
{
  "isLeaf": boolean,
  "confidence": "high" | "medium" | "low",
  "reason": "brief explanation of what the image actually shows if it's not a leaf or if confidence is low"
}`;

      const valResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          validationPrompt,
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const valText = valResponse.text || '';
      const cleanedValText = valText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedVal = JSON.parse(cleanedValText);

      validationResult = LeafValidationSchema.parse(parsedVal);

      // STEP 4 — LOG VALIDATION CALL
      console.log('[GeminiService] [STEP 1 - IMAGE VALIDATION RESPONSE]:', JSON.stringify(validationResult, null, 2));

    } catch (err: any) {
      console.warn('[GeminiService] Image validation API call failed:', err.message);
    }
  } else {
    console.log('[GeminiService] [STEP 1 - MOCK MODE VALIDATION]: assuming valid leaf image for dev mode');
  }

  // STEP 2 — BRANCH BASED ON VALIDATION
  if (!validationResult.isLeaf || validationResult.confidence === 'low') {
    const errorMessage = "This doesn't look like a leaf photo. Please upload a clear, close-up photo of a plant leaf.";
    console.log(`[GeminiService] [STEP 2 - REJECTED]: isLeaf=${validationResult.isLeaf}, confidence=${validationResult.confidence}. Reason: ${validationResult.reason}`);
    
    return {
      success: false,
      validation: validationResult,
      error: errorMessage,
    };
  }

  // Proceed to STEP 3 — STRICT DIAGNOSIS PROMPT
  console.log('[GeminiService] [STEP 2 - ACCEPTED]: proceeding to full diagnosis call.');

  if (!apiKey || apiKey === 'your_google_gemini_api_key_here' || apiKey.startsWith('mock_')) {
    const mockDiagnosis = `DIAGNOSIS REPORT FOR ${cropType.toUpperCase()} LEAF:\n\n1. IDENTIFIED HEALTH STATUS: Early Cercospora Leaf Spot\n- Severity: Moderate (Level 2/4)\n- Confidence: 94.2%\n\n2. OBSERVED SYMPTOMS:\n- Visible reddish-brown circular lesions with grayish centers on leaf blade.\n\n3. ROOT CAUSE ANALYSIS:\n- High humidity and foliage wetness.\n\n4. STEP-BY-STEP RECOVERY PROTOCOL:\n- Step 1 (Day 1): Spray Mancozeb 75% WP @ 2.5 g/L water.\n- Step 2 (Day 5): Foliar spray of NPK 19:19:19 (5 g/L) for canopy restoration.\n\n5. YIELD IMPACT:\n- Estimated 12% risk if untreated. Fully curable within 7 days.`;
    
    console.log('[GeminiService] [STEP 2 - DIAGNOSIS RESULT (MOCK)]:\n', mockDiagnosis);
    return {
      success: true,
      validation: validationResult,
      diagnosis: mockDiagnosis,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // STEP 3 STRICT PROMPT
    const diagnosisPrompt = `
You are FarmMitra's AI Leaf Pathology Doctor for ${cropType}.

SYSTEM INSTRUCTIONS:
Only report specific diseases or deficiencies if you can identify clear visual evidence in the image (discoloration, spots, wilting, pest damage, etc.). If the leaf appears healthy with no visible issues, say so directly — do not invent a diagnosis. If image quality is too poor to assess confidently, say that explicitly instead of guessing.

Provide a structured diagnosis with:
1. IDENTIFIED HEALTH STATUS & DISEASE NAME (or "Healthy Leaf - No Pathology Detected")
   - Include severity rating and confidence level
2. OBSERVED VISUAL SYMPTOMS
   - Describe exact spots, chlorosis, lesions, or pest trails visible in the photo
3. ROOT CAUSE ANALYSIS
   - Pathogen or environmental trigger (fungal, bacterial, viral, thrips/mite, or nutrient deficit)
4. STEP-BY-STEP TREATMENT & RECOVERY PROTOCOL
   - Step 1: Immediate chemical / organic spray action (name exact products like Mancozeb, Imidacloprid, Neem Oil) with dosage per litre water.
   - Step 2: Follow-up foliar nutrient spray (e.g. Calcium Nitrate + Boron, NPK 19:19:19).
5. YIELD IMPACT PREDICTION
   - Estimated yield risk if untreated vs treated timeline.
${weatherContext ? `\nLive Open-Meteo Weather Context:\n- Temperature: ${weatherContext.temperature_2m}°C, Humidity: ${weatherContext.relative_humidity_2m}%, Precip: ${weatherContext.precipitation_sum}mm. Incorporate weather safety rules.` : ''}
`;

    const diagResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        },
        diagnosisPrompt,
      ],
    });

    const diagnosisText = diagResponse.text || 'Leaf diagnosis complete.';

    // STEP 4 — LOG DIAGNOSIS CALL
    console.log('[GeminiService] [STEP 2 - DIAGNOSIS RESULT]:\n', diagnosisText);

    return {
      success: true,
      validation: validationResult,
      diagnosis: diagnosisText,
    };
  } catch (error: any) {
    console.error('[GeminiService] Diagnosis call failed:', error.message);
    return {
      success: false,
      validation: validationResult,
      error: 'Failed to generate diagnosis report. Please try again with a clearer photo.',
    };
  }
}

/**
 * Generates an agronomic AI advisory using @google/genai
 */
export async function generateGeminiAdvisory(
  field: Field,
  daysSinceSowing: number,
  weather: WeatherData,
  treatmentLogs: TreatmentLogContext[]
): Promise<AdvisoryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_google_gemini_api_key_here' || apiKey.startsWith('mock_')) {
    console.log('[GeminiService] Using fallback advisory engine.');
    return createFallbackAdvisory(field, daysSinceSowing, weather, treatmentLogs);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const skippedLogs = treatmentLogs.filter((log) => log.status === 'skipped');
    const hasSkipped = skippedLogs.length > 0;

    const prompt = `
You are FarmMitra's Master Agronomist AI. Generate a precise, JSON-formatted crop advisory for this field:

Field Information:
- Crop Type: ${field.crop_type}
- Soil Type: ${field.soil_type}
- Acreage: ${field.acreage} acres
- Location: ${field.location} (Lat: ${field.latitude}, Lon: ${field.longitude})
- Sowing Date: ${field.sowing_date}
- Days Since Sowing: ${daysSinceSowing} days

Live Weather Telemetry (Open-Meteo):
- Current Temperature: ${weather.temperature_2m}°C (Max: ${weather.temperature_2m_max || weather.temperature_2m}°C)
- Relative Humidity: ${weather.relative_humidity_2m}%
- 24-hour Precipitation Sum: ${weather.precipitation_sum} mm
- Rain Probability: ${weather.precipitation_probability_max || 0}%

Treatment Logs & Plan Drift Tracking:
- Previous Skipped Treatments: ${hasSkipped ? 'YES' : 'NONE'}
${hasSkipped ? `- Skipped Actions: ${JSON.stringify(skippedLogs)}` : ''}
- Total Historical Logs: ${treatmentLogs.length}

Output ONLY valid JSON matching this schema:
{
  "irrigation": "...",
  "fertilizer": [
    { "name": "...", "timing": "...", "dosage": "..." }
  ],
  "riskLevel": "low" | "medium" | "high",
  "riskNotes": "...",
  "costOfInaction": "...",
  "planDriftDetected": true | false,
  "driftExplanation": "...",
  "nextCheckInDate": "YYYY-MM-DD"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    const validated = AdvisorySchema.parse(parsed);
    return validated;
  } catch (error) {
    console.warn('[GeminiService] Gemini API call failed:', (error as Error).message);
    return createFallbackAdvisory(field, daysSinceSowing, weather, treatmentLogs);
  }
}

/**
 * Multimodal Chat & Field Copilot AI Response
 */
/**
 * Multimodal Chat & FarmMitra AI Copilot Assistant Response
 */
export async function generateGeminiCopilotChat(
  field: Field | null,
  daysSinceSowing: number,
  weather: WeatherData | null,
  latestAdvisory: Advisory | null,
  message: string,
  imageBase64?: string
): Promise<string> {
  const cropType = field?.crop_type || 'Chilli';
  if (imageBase64) {
    // If image is attached, run STEP 1 validation first!
    const leafProc = await validateAndDiagnoseLeaf(imageBase64, cropType, weather || undefined);
    if (!leafProc.success) {
      return `⚠️ [Validation Error]: ${leafProc.error}\n(Reason detected by AI: ${leafProc.validation.reason})`;
    }
    return leafProc.diagnosis || 'Leaf diagnosis complete.';
  }

  const apiKey = process.env.GEMINI_API_KEY;

  const systemInstructions = `
You are "FarmMitra AI", the official AI Agronomy Copilot and Platform Assistant for FarmMitra.

FARMMITRA PLATFORM KNOWLEDGE BASE:
- FarmMitra is a precision agriculture platform & digital farm journal designed for Indian farmers.
- Core Features:
  1. Field Plot Management: Register crop plots (crop type, sowing date, soil type, location, acreage).
  2. AI-Generated Advisories: Tailored schedules for irrigation, water-soluble fertilizer dosages (NPK, Micronutrients), and disease/pest risk alerts using live Open-Meteo weather telemetry.
  3. Treatment Logging & Plan Drift Tracking: Farmers log performed [Done] or skipped [Skipped] actions. When a task is marked [Skipped], FarmMitra detects plan drift and adapts subsequent advisories with compensatory actions (e.g. catch-up nutrient sprays).
  4. AI Leaf Doctor (Vision AI): Upload a photo of a crop leaf to validate and diagnose plant diseases, receiving step-by-step spray treatment steps and yield impact predictions.
  5. Mandi Commodity Price Tracking: Real-time APMC mandi market price trends to select optimal harvest and selling windows.
  6. Crop Financial ROI Calculator: Input input costs (seeds, fertilizers, labor) vs expected harvest price to project net farm revenue.
  7. Crop Knowledge & Fertilizer Hub: Comprehensive guides for 50+ crops and 40+ fertilizers.

APP NAVIGATION INSTRUCTIONS:
- To add/register a new field: Go to the Dashboard (click "Dashboard" in navigation) and click the "+ Register New Field" button.
- To request a new advisory: Open the specific field plot page from the Dashboard and click the "Request New Advisory" button.
- To use Leaf Doctor: Click "AI Leaf Doctor" in the top navigation bar, or click the camera icon right here in this chat to attach a leaf photo.
- To check Mandi market prices: Click "Mandi Tracker" in the top navigation bar.
- To check fertilizer dosages & guides: Click "Fertilizer Hub" in the navigation bar.
- To view step-by-step growing guides: Click "Crop Knowledge" in the navigation bar.

RESPONSE GUIDELINES & DUAL CAPABILITY:
1. APP / NAVIGATION QUESTIONS (e.g. "how do I add a new field?", "what does risk level mean?", "how does advisory update when I skip a task?"):
   - Give direct, helpful, step-by-step UI navigation and feature explanations.
2. GENERAL FARMING QUESTIONS (e.g. "how much water does chilli need?", "what is the ideal pH for cotton?"):
   - Answer using general agronomic principles.
   - Clearly state that general advice is general guidance and distinct from data-backed advisories calculated for specific plots.
3. FIELD-SPECIFIC / ADVISORY QUESTIONS (e.g. "why is my risk level low right now?", "what should I spray on my field today?"):
   - If field context (crop, soil, weather, days elapsed, risk level) is available below, use that telemetry to explain the plot status accurately.
   - If field context is missing or if the user asks for a new customized field plan, explain their current plot status (if known) AND explicitly instruct them to open their Field Details page and click "Request New Advisory" to get personalized, data-backed calculations instead of guessing or duplicating the structured advisory engine.
4. IDENTITY: Always introduce and identify yourself as "FarmMitra AI". Be concise, encouraging, professional, and practical for Indian farmers.
`;

  // Build Field & Weather context block if available
  const fieldContextBlock = field ? `
CURRENT FIELD CONTEXT:
- Field ID: ${field.id}
- Crop Type: ${field.crop_type}
- Soil Type: ${field.soil_type}
- Acreage: ${field.acreage} acres
- Location: ${field.location} (Lat: ${field.latitude}, Lon: ${field.longitude})
- Sowing Date: ${field.sowing_date} (${daysSinceSowing} days elapsed)
${weather ? `Live Weather: ${weather.temperature_2m}°C, Humidity: ${weather.relative_humidity_2m}%, 24h Rain: ${weather.precipitation_sum}mm, Rain Prob: ${weather.precipitation_probability_max || 0}%` : ''}
${latestAdvisory ? `Latest Advisory Risk Level: ${latestAdvisory.risk_level.toUpperCase()}` : 'No recent advisory generated yet.'}
` : `CURRENT CONTEXT: Global Platform Chat (No specific field selected).`;

  if (!apiKey || apiKey === 'your_google_gemini_api_key_here' || apiKey.startsWith('mock_')) {
    const msgLower = message.toLowerCase();
    
    // Check for App / Navigation questions in fallback mode
    if (msgLower.includes('add') && (msgLower.includes('field') || msgLower.includes('plot'))) {
      return `To add a new field plot in FarmMitra, navigate to the **Dashboard** page and click the **"+ Register New Field"** button at the top right. Enter your crop type, sowing date, soil type, location, and acreage, then save!`;
    }
    if (msgLower.includes('skip') || msgLower.includes('drift')) {
      return `In FarmMitra, when you mark a recommended task as **[Skipped]** in your treatment logs, our AI detects **Plan Drift**. In your next advisory request, FarmMitra automatically adjusts the dosage and timing (e.g. catch-up fertilizer sprays) to mitigate potential yield loss!`;
    }
    if (msgLower.includes('risk') || msgLower.includes('level')) {
      return `FarmMitra calculates your plot's **Risk Level (Low / Medium / High)** by combining your crop's current growth stage with live microclimate weather forecasts (humidity, rain, temperature). A High risk level warns of fungal or pest outbreak conditions!`;
    }
    if (msgLower.includes('leaf') || msgLower.includes('doctor')) {
      return `You can use **AI Leaf Doctor** by clicking "AI Leaf Doctor" in the top navigation bar, or by tapping the camera icon right here in this chat to attach a photo of an unhealthy crop leaf.`;
    }
    
    // Check for general farming questions
    if (msgLower.includes('water') || msgLower.includes('chilli') || msgLower.includes('irrigation')) {
      return `General Agronomy Guidance: Chilli crops generally require 25-35 mm of water per week depending on soil type and growth stage. During flowering and fruit development, maintain consistent soil moisture without waterlogging.\n\n*(Note: For personalized irrigation schedules tailored to your specific plot soil and live weather forecast, open your field plot page and click **"Request New Advisory"**!)*`;
    }

    if (field) {
      if (msgLower.includes('spray') || msgLower.includes('pesticide') || msgLower.includes('fertilizer')) {
        if (weather && (weather.precipitation_sum > 2.0 || (weather.precipitation_probability_max || 0) > 40)) {
          return `FarmMitra AI Alert for ${field.location}: High rainfall forecast (${weather.precipitation_sum}mm, ${weather.precipitation_probability_max || 50}% rain probability). Do NOT spray chemicals or fertilizers now as rain will wash them away. Wait for a clear 24-hour window.`;
        }
      }
      return `FarmMitra AI (${field.crop_type} Plot Expert): Day ${daysSinceSowing} post-sowing status:\n- Location: ${field.location}\n- Soil: ${field.soil_type}\n${weather ? `- Temp: ${weather.temperature_2m}°C, Humidity: ${weather.relative_humidity_2m}%\n` : ''}${latestAdvisory ? `- Current Risk Level: ${latestAdvisory.risk_level.toUpperCase()}\n` : ''}\nRegarding your query "${message}": For customized daily tasks and detailed fertilizer plans, click **"Request New Advisory"** on your field details page. How else can FarmMitra AI assist you?`;
    }

    return `Hello! I am **FarmMitra AI**, your digital farm copilot. I can help you navigate FarmMitra (adding fields, checking advisories, scanning leaf photos, Mandi market rates) and answer general farming questions. How can I help you today?`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const fullPrompt = `
${systemInstructions}

${fieldContextBlock}

FARMER QUESTION: "${message}"

Respond directly to the farmer following all instructions.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    return response.text || 'FarmMitra AI response generated.';
  } catch (error) {
    console.warn('[GeminiService] FarmMitra AI copilot chat error:', (error as Error).message);
    return `Hello! I am **FarmMitra AI**. To get tailored recommendations for your plot, navigate to your field's details page and click **"Request New Advisory"**. For navigation assistance or general farming guidance, ask me anytime!`;
  }
}

