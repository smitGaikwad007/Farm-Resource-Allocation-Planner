import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';

dotenv.config();

// Since we are using ES modules, __dirname needs to be derived
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Login Endpoint (Mock authentication)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // In a real app we'd query a database. For this hackathon:
    if (email && password) {
        // Return a mock success response
        return res.json({
            success: true,
            message: 'Login successful',
            token: 'mock_token_' + Date.now(),
            user: { email }
        });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Analyze Endpoint - Proxy for Groq API
app.post('/analyze', async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'Groq API key is not configured on the server.' });
        }

        const { area, width, length, soilType, ph, moisture, crops, constraints, query, base64Image } = req.body;

        // Construct context for the AI
        let promptContext = `You are an expert agricultural AI. Analyze the following farm parameters and provide structured JSON data.
        Parameters:
        - Land Area: ${area || 'Unknown'} sq units
        - Dimensions: ${width || '?'}x${length || '?'}
        - Soil Type: ${soilType || 'Unknown'}
        - Soil pH: ${ph || 'Unknown'}
        - Moisture Level: ${moisture || 'Unknown'}%
        - Available Crops: ${crops || 'Not specified'}
        - Constraints (Water/Fertilizer limits): ${constraints || 'None'}
        - Farmer's Specific Query: ${query || 'None'}
        ${base64Image ? '\nNote: A soil image was uploaded. Incorporate visual soil analysis assumptions based on the soil type provided.' : ''}

        Respond ONLY with a valid JSON string (no markdown, no code blocks, no extra text) matching this exact schema:
        {
          "soilCondition": "Clear, concise analysis of soil health based on pH, type, and moisture.",
          "nutrientInsights": "What nutrients are likely missing or abundant?",
          "suitableCrops": ["crop1", "crop2", "crop3"],
          "riskFactors": ["risk1", "risk2"],
          "waterPlanning": "Advice on irrigation based on moisture and constraints.",
          "fertilizerSuggestions": "Specific fertilizer approach.",
          "sustainabilityScore": 85,
          "sustainabilityInsights": "How to farm more sustainably.",
          "queryAnswer": "Direct, detailed answer to the farmer's specific query (if provided, otherwise output 'No query provided')."
        }`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: promptContext }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const textResponse = chatCompletion.choices[0]?.message?.content || '{}';

        // Extract JSON using regex just in case
        const jsonMatch = textResponse.match(/```json([\s\S]*?)```/) || textResponse.match(/{[\s\S]*}/);

        let parsedResult = {};
        if (jsonMatch) {
            let jsonString = jsonMatch[1] || jsonMatch[0];
            parsedResult = JSON.parse(jsonString);
        } else {
            parsedResult = JSON.parse(textResponse);
        }

        res.json(parsedResult);
    } catch (error) {
        console.error('Error in /analyze endpoint:', error);
        res.status(500).json({ error: 'Failed to complete analysis.', details: error.message });
    }
});

// Optimize Endpoint
app.post('/optimize', (req, res) => {
    // We handle the mathematical constraints logic either on backend or frontend.
    // Handling it here: Simple linear programming heuristic for a hackathon
    /* 
       Given: Land Size, Water Limit, Fertilizer Limit, List of Suitable Crops
       For each crop, we assume mock metrics (e.g., Water per sq unit, Profit per sq unit)
       We will allocate simply to maximize profit.
    */
    const { landSize, waterLimit, fertilizerLimit, suitableCrops } = req.body;

    // Crop data dictionary
    const cropMetrics = {
        "Wheat": { water: 5, fertilizer: 2, profit: 10, color: '#F5DEB3' },
        "Corn": { water: 8, fertilizer: 4, profit: 15, color: '#FFD700' },
        "Rice": { water: 12, fertilizer: 3, profit: 12, color: '#e3dca1' },
        "Soybeans": { water: 6, fertilizer: 2, profit: 18, color: '#D2B48C' },
        "Cotton": { water: 7, fertilizer: 5, profit: 20, color: '#e8e8e8' },
        "Potatoes": { water: 6, fertilizer: 4, profit: 14, color: '#cfb27a' },
        "Tomatoes": { water: 10, fertilizer: 6, profit: 25, color: '#ff6347' },
        "Default": { water: 5, fertilizer: 3, profit: 10, color: '#90EE90' }
    };

    // Helper to generate a random hex color for unknown crops
    const getRandomColor = () => {
        const letters = '6789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 6)];
        }
        return color;
    };

    // Make sure we have numbers
    // If water or fertilizer limits are falsy (0, null, ""), set a very high default effectively making them "unlimited" for the math engine
    let availableWater = Number(waterLimit) > 0 ? Number(waterLimit) : 99999999;
    let availableFertilizer = Number(fertilizerLimit) > 0 ? Number(fertilizerLimit) : 99999999;
    let spaceLeft = Number(landSize) > 0 ? Number(landSize) : 100; // default 100 if invalid

    let allocation = [];
    let totalYieldVal = 0;
    let totalProfit = 0;

    // Build the crop list safely
    let activeCrops = [];
    if (suitableCrops && Array.isArray(suitableCrops) && suitableCrops.length > 0) {
        // Clean up array
        activeCrops = suitableCrops.map(c => c.trim()).filter(c => c.length > 0);
    }

    if (activeCrops.length === 0) {
        activeCrops = ["Mixed Crop Default"];
    }

    // Process all requested crops to gather their metrics
    let parsedCrops = activeCrops.map(name => {
        // Search for existing metrics case-insensitive
        let keyMatch = Object.keys(cropMetrics).find(k => k.toLowerCase() === name.toLowerCase());
        let metrics = keyMatch ? cropMetrics[keyMatch] : null;

        if (!metrics) {
            // Assign default metrics for unknown crops, but give them a unique color
            metrics = { ...cropMetrics["Default"], color: getRandomColor() };
        }
        return { name, ...metrics };
    });

    // Strategy: Evenly distribute the available land among all requested crops first.
    // If a crop hits a water/fertilizer limit early, it stops taking space and leaves it for the next crop.

    let targetSpacePerCrop = Math.floor(spaceLeft / parsedCrops.length);
    let remainingCropsLoop = [...parsedCrops];

    // Simple multi-pass allocation to ensure fair distribution
    let passCount = 0;
    while (spaceLeft > 0 && remainingCropsLoop.length > 0 && passCount < 10) {
        passCount++;
        let nextRoundCrops = [];
        let currentFairShare = Math.floor(spaceLeft / remainingCropsLoop.length);

        if (currentFairShare === 0) currentFairShare = spaceLeft;

        for (let crop of remainingCropsLoop) {
            if (spaceLeft <= 0 || availableWater <= 0 || availableFertilizer <= 0) break;

            // Determine how much we can plant for this crop in this pass
            let maxByWater = Math.floor(availableWater / crop.water);
            let maxByFert = Math.floor(availableFertilizer / crop.fertilizer);

            // Limit plantable amount to either the fair share, or the resource cap
            let maxPlantable = Math.min(currentFairShare, spaceLeft, maxByWater, maxByFert);

            if (maxPlantable > 0) {
                // Find if we already have this crop in allocation to add to it, or create new
                let existingRecord = allocation.find(a => a.crop === crop.name);
                if (existingRecord) {
                    existingRecord.areaAllocated += maxPlantable;
                    existingRecord.waterUsed += (maxPlantable * crop.water);
                    existingRecord.fertilizerUsed += (maxPlantable * crop.fertilizer);
                    existingRecord.expectedProfit += (maxPlantable * crop.profit);
                } else {
                    allocation.push({
                        crop: crop.name,
                        areaAllocated: maxPlantable,
                        waterUsed: maxPlantable * crop.water,
                        fertilizerUsed: maxPlantable * crop.fertilizer,
                        expectedProfit: maxPlantable * crop.profit,
                        color: crop.color
                    });
                }

                spaceLeft -= maxPlantable;
                availableWater -= (maxPlantable * crop.water);
                availableFertilizer -= (maxPlantable * crop.fertilizer);

                totalYieldVal += (maxPlantable * 1.5);
                totalProfit += (maxPlantable * crop.profit);

                // If this crop wasn't limited by resources, it can try to grab more space in the next round
                if (maxPlantable === currentFairShare) {
                    nextRoundCrops.push(crop);
                }
            }
        }

        // If no space was allocated in this round, break to prevent infinite loop
        if (nextRoundCrops.length === remainingCropsLoop.length) {
            // Check if spaceLeft didn't change (meaning maxPlantable was 0 for all due to limits)
            let currentTotalReq = remainingCropsLoop.reduce((acc, c) => acc + Math.min(Math.floor(availableWater / c.water), Math.floor(availableFertilizer / c.fertilizer)), 0);
            if (currentTotalReq === 0) break;
        }

        remainingCropsLoop = nextRoundCrops;
    }

    res.json({
        success: true,
        allocationBreakdown: allocation,
        unusedSpace: spaceLeft,
        unusedWater: availableWater >= 99999999 ? "Unlimited" : availableWater,
        unusedFertilizer: availableFertilizer >= 99999999 ? "Unlimited" : availableFertilizer,
        estimatedYield: Math.round(totalYieldVal) + " tons",
        estimatedProfit: "$" + Math.round(totalProfit)
    });
});

app.listen(PORT, () => {
    console.log(`FRAP Server is running at http://localhost:${PORT}`);
});
