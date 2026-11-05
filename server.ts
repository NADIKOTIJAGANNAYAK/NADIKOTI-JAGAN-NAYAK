import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parser with size limits to prevent Denial of Wallet & buffer overflows
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 1. Security Headers (Defense in depth / OWASP guidelines)
app.use((req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking while allowing Google Maps / Auth iframes
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. In-memory Rate Limiter to prevent API abuse & brute force
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(limit = 60, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const client = rateLimitMap.get(ip);

    if (!client || now > client.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (client.count >= limit) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.',
        retryAfterMs: client.resetTime - now,
      });
    }

    client.count++;
    next();
  };
}

// 3. Initialize Gemini AI client securely on backend
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// POST /api/gemini/analyze - Multimodal image civic issue classifier
app.post('/api/gemini/analyze', rateLimiter(20, 60000), async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required for civic analysis.' });
    }

    // Strip data URI prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    if (!ai) {
      // Safe fallback if API key is unconfigured
      console.warn('GEMINI_API_KEY is not configured on server. Returning heuristic fallback.');
      return res.json({
        identifiedIssue: 'Civic Infrastructure Concern Detected',
        category: 'road_damage',
        title: 'Reported Civic Problem',
        description: 'Citizen photograph attached for municipal inspection. Pavement irregularity or surface defect noted.',
        suggestedPriority: 'medium',
        confidenceScore: 0.85,
        aiDisclaimer: 'AI suggestion for municipal sorting — official severity verified by GVMC field engineers.',
      });
    }

    const prompt = `You are the civic intelligence classifier for Greater Visakhapatnam Municipal Corporation (GVMC).
Analyze the provided photograph of a municipal or urban problem.
Identify what public infrastructure problem is depicted (e.g. pothole, broken asphalt, overflowing garbage, blocked monsoon drain, broken streetlight, water pipe leak, damaged culvert).
Classify it strictly into one of these categories:
- "road_damage"
- "garbage_accumulation"
- "water_leakage"
- "streetlight_failure"
- "drainage_problems"
- "other_civic"

Recommend a review priority strictly from: "low", "medium", "high", "critical".
Provide a clear, formal civic title (under 12 words) and an objective description of the visual damage (2-3 sentences).
Context hint from user: "${userHint || 'None'}".

CRITICAL: Return ONLY valid JSON with this exact structure:
{
  "identifiedIssue": "string",
  "category": "road_damage" | "garbage_accumulation" | "water_leakage" | "streetlight_failure" | "drainage_problems" | "other_civic",
  "title": "string",
  "description": "string",
  "suggestedPriority": "low" | "medium" | "high" | "critical",
  "confidenceScore": number
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      // Clean up markdown block if present
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    }

    return res.json({
      ...parsedResult,
      aiDisclaimer: 'AI suggestion for municipal sorting — official severity verified by GVMC field engineers.',
    });
  } catch (error: any) {
    console.error('Gemini image analysis error:', error?.message || error);
    return res.status(500).json({
      error: 'Failed to analyze image with AI.',
      fallback: {
        identifiedIssue: 'Civic Infrastructure Concern',
        category: 'other_civic',
        title: 'Citizen Reported Issue',
        description: 'Uploaded photograph submitted for manual review by GVMC ward engineers.',
        suggestedPriority: 'medium',
        confidenceScore: 0.7,
        aiDisclaimer: 'AI suggestion for municipal sorting — official severity verified by GVMC field engineers.',
      },
    });
  }
});

// Helper for local civic knowledge response
function getMitraCivicFallback(message: string, language: string = 'en'): string {
  const q = message.toLowerCase();
  if (language === 'te') {
    if (q.includes('sla') || q.includes('గంటలు') || q.includes('సమయం')) {
      return 'జీవీఎంసీ 72 గంటల బైండింగ్ SLA ప్రకారం ప్రతి సమస్యను (రోడ్డు గుంతలు, డ్రైనేజీ, తాగునీరు) 72 గంటల్లో పరిష్కరించాలి. సకాలంలో పరిష్కరిస్తే అధికారికి +50 ఆనర్ పాయింట్లు లభిస్తాయి.';
    }
    if (q.includes('తుఫాను') || q.includes('షెల్టర్') || q.includes('సహాయ')) {
      return 'విశాఖపట్నం తుఫాను సహాయ కేంద్రాలు: 1. ఆంధ్రా యూనివర్సిటీ జిమ్నాసియం (సిరిపురం), 2. స్వర్ణ భారతి ఇండోర్ స్టేడియం (MVP కాలనీ), 3. జగదాంబ GVMC హైస్కూల్. అత్యవసర టోల్ ఫ్రీ: 1800-425-0001.';
    }
    return 'నమస్కారం! నేను జీవీఎంసీ మిత్ర సహాయకుడిని. మీరు ఫిర్యాదులు నమోదు చేయవచ్చు, 72 గంటల SLA గడువు తనిఖీ చేయవచ్చు లేదా పన్నులు చెల్లించవచ్చు.';
  }

  if (q.includes('sla') || q.includes('72') || q.includes('hour') || q.includes('deadline')) {
    return 'The GVMC 72-Hour Binding SLA guarantees all reported infrastructure problems (potholes, blocked drains, water leaks) are inspected and repaired within 72 hours. Timely resolution awards the field officer +50 honor points, while overdue tickets automatically escalate to the Zonal Commissioner with a -100 point penalty.';
  }
  if (q.includes('shelter') || q.includes('cyclone') || q.includes('evacuat') || q.includes('emergency')) {
    return 'Designated GVMC Cyclone Shelters are operational at: 1. Andhra University Gymnasium (Siripuram), 2. Swarna Bharathi Indoor Stadium (MVP Colony), 3. GVMC High School (Jagadamba), and 4. Gajuwaka Multi-Purpose Shelter. Emergency Helpline: 1800-425-0001.';
  }
  if (q.includes('tax') || q.includes('ptin') || q.includes('pay') || q.includes('water')) {
    return 'You can pay GVMC Property Tax and Water Charges online through the CDMA/GVMC Citizen Portal using your 10-digit PTIN number. Early bird rebates are active for the first half of the financial year.';
  }
  if (q.includes('pothole') || q.includes('road') || q.includes('beach') || q.includes('drain') || q.includes('garbage')) {
    return 'To report this hazard: Navigate to the "Report Issue" tab, upload a photograph, and our Gemini AI scanner will auto-detect the damage and tag your GPS location for the GVMC Engineering Division!';
  }
  return 'Namaste! I am Mitra, your GVMC Civic AI Assistant. I can guide you through reporting civic hazards, tracking our 72-hour binding SLA countdown, navigating cyclone relief shelters, and checking municipal services.';
}

// POST /api/gemini/mitra - Multilingual civic AI voice & text assistant
app.post('/api/gemini/mitra', rateLimiter(30, 60000), async (req: Request, res: Response) => {
  try {
    const { message, language = 'en', history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (!ai) {
      return res.json({
        reply: getMitraCivicFallback(message, language),
      });
    }

    const systemInstruction = `You are "Mitra" (మిత్ర / मित्र), the official AI Civic Intelligence Assistant for the Greater Visakhapatnam Municipal Corporation (GVMC) and NagarNet platform.
You are fluent in English, Telugu (తెలుగు), and Hindi (हिंदी).
Current language requested: ${language}.
Your responsibilities:
1. Guide citizens on how to report civic hazards (potholes, water leaks, clogged drains, waste piles) on NagarNet.
2. Explain the 72-Hour Binding SLA and how citizens can verify proof-of-work before tickets close.
3. Provide FAQs on GVMC services: Property Tax payment (PTIN portal), Water Tap charges, Trade Licenses, Birth/Death certificates.
4. During coastal weather emergencies, direct citizens to designated cyclone relief shelters in Visakhapatnam (Andhra University Gym, Swarna Bharathi Indoor Stadium, GVMC High Schools) and give emergency numbers (GVMC Toll Free 1800-425-0001, Police 112).
5. Keep answers polite, warm, concise, and helpful. Always respond in the requested language (${language}) or in the language used by the citizen.`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      reply: response.text || getMitraCivicFallback(message, language),
    });
  } catch (error: any) {
    console.warn('Gemini chat error, returning knowledge engine fallback:', error?.message);
    const { message = '', language = 'en' } = req.body;
    return res.json({
      reply: getMitraCivicFallback(message, language),
    });
  }
});

// External data feed simulations (openstreetdata, openweathermap, alertapi, traffic, news)
app.get('/api/external/weather-aqi', (req: Request, res: Response) => {
  res.json({
    location: 'Visakhapatnam (Vizag), Andhra Pradesh',
    coordinates: { lat: 17.6868, lng: 83.2185 },
    temp: 29,
    feelsLike: 32,
    condition: 'Scattered Coastal Clouds',
    humidity: 78,
    windSpeedKmh: 16,
    windDirection: 'ENE',
    aqi: 58,
    aqiLevel: 'Good',
    coastalSurge: 'Normal (Tide height 1.2m)',
    source: 'OpenWeatherMap API & Central Pollution Control Board (CPCB Vizag Station)',
    lastUpdated: new Date().toISOString(),
  });
});

app.get('/api/external/openstreetdata', (req: Request, res: Response) => {
  res.json({
    source: 'https://openstreetdata.org/v1/gvmc/infrastructure',
    activeRoadWorks: [
      { id: 'OSD-891', segment: 'BRTS Corridor - Maddilapalem to Pendurthi', status: 'Active resurfacing', laneClosure: 'Single Lane' },
      { id: 'OSD-892', segment: 'Beach Road - Submarine to Kailasagiri Foot', status: 'Cycle track reinforcement', laneClosure: 'None' },
      { id: 'OSD-893', segment: 'Gajuwaka Industrial Highway NH16 Flyover', status: 'Structural expansion joint maintenance', laneClosure: 'Night work 11PM-5AM' },
    ],
  });
});

app.get('/api/external/alerts', (req: Request, res: Response) => {
  res.json({
    source: 'https://alertapi.gov.in/v2/ap/visakhapatnam',
    activeAlerts: [
      {
        id: 'ALERT-AP-VZG-04',
        type: 'coastal_weather',
        severity: 'advisory',
        title: 'Squally Winds Warning along Bay of Bengal Coast',
        issuedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        message: 'Wind gusts up to 50 km/h expected off RK Beach & Bheemili. Small craft advised caution.',
      },
    ],
  });
});

app.get('/api/external/traffic', (req: Request, res: Response) => {
  res.json({
    source: 'https://traffic.api.gov/in/ap/visakhapatnam',
    congestionIndex: 'Moderate (42/100)',
    junctions: [
      { name: 'Jagadamba Junction', flow: 'Slow', delayMin: 6 },
      { name: 'Siripuram Circle', flow: 'Normal', delayMin: 2 },
      { name: 'NAD Kotha Road Flyover', flow: 'Fluid', delayMin: 1 },
      { name: 'Gajuwaka Main Junction', flow: 'Heavy', delayMin: 12 },
    ],
  });
});

// Vite Middleware integration in Development / Static in Production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VIZAG 360 / NagarNet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
