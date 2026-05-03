"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMealRecipe = exports.extractIngredients = exports.generateMealPlan = void 0;
const sdk_1 = require("@anthropic-ai/sdk");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const firebase_functions_1 = require("firebase-functions");
(0, app_1.initializeApp)();
const anthropicApiKey = (0, params_1.defineSecret)('ANTHROPIC_API_KEY');
const SYSTEM_PROMPT = `You are a meal planning assistant. Given a list of available ingredients and household preferences, generate a practical weekly meal plan.

Rules:
- Simple, realistic home cooking only
- Reuse ingredients across the week to minimize waste
- Respect all dietary restrictions strictly
- Scale portions for the household size
- Return ONLY valid JSON, no markdown, no explanation

Required JSON format:
{
  "week": {
    "monday": { "lunch": "meal name", "dinner": "meal name" },
    "tuesday": { "lunch": "meal name", "dinner": "meal name" },
    "wednesday": { "lunch": "meal name", "dinner": "meal name" },
    "thursday": { "lunch": "meal name", "dinner": "meal name" },
    "friday": { "lunch": "meal name", "dinner": "meal name" },
    "saturday": { "lunch": "meal name", "dinner": "meal name" },
    "sunday": { "lunch": "meal name", "dinner": "meal name" }
  },
  "shopping_list": {
    "vegetables": ["item1", "item2"],
    "proteins": ["item1", "item2"],
    "other": ["item1", "item2"]
  }
}`;
exports.generateMealPlan = (0, https_1.onCall)({ secrets: [anthropicApiKey], region: 'europe-west1' }, async (request) => {
    var _a;
    firebase_functions_1.logger.info('generateMealPlan called', { uid: (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid });
    if (!request.auth) {
        firebase_functions_1.logger.warn('Unauthenticated request rejected');
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    }
    const { ingredients, preferences, householdSize, mode, language } = request.data;
    firebase_functions_1.logger.info('Request data', { ingredients, householdSize, preferences, mode, language });
    const isScratch = mode === 'scratch' || !(ingredients === null || ingredients === void 0 ? void 0 : ingredients.trim());
    if (!isScratch && !(ingredients === null || ingredients === void 0 ? void 0 : ingredients.trim())) {
        throw new https_1.HttpsError('invalid-argument', 'Ingredients are required.');
    }
    firebase_functions_1.logger.info('Calling Claude API');
    let message;
    try {
        const client = new sdk_1.default({ apiKey: anthropicApiKey.value() });
        const langInstruction = language === 'es'
            ? 'Write all meal names and shopping list items in Spanish.'
            : 'Write all meal names and shopping list items in English.';
        const userPrompt = isScratch
            ? `Household size: ${householdSize} ${householdSize === 1 ? 'person' : 'people'}
Dietary restrictions: ${preferences.dietaryRestrictions || 'none'}
Cuisine style preference: ${preferences.cuisineStyle || 'any'}

No specific ingredients — suggest a practical, balanced weekly meal plan. Include a comprehensive shopping list with everything needed to cook these meals.
${langInstruction}`
            : `Available ingredients: ${ingredients}

Household size: ${householdSize} ${householdSize === 1 ? 'person' : 'people'}
Dietary restrictions: ${preferences.dietaryRestrictions || 'none'}
Cuisine style preference: ${preferences.cuisineStyle || 'any'}

Generate the weekly meal plan.
${langInstruction}`;
        message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: [
                {
                    type: 'text',
                    text: SYSTEM_PROMPT,
                    cache_control: { type: 'ephemeral' },
                },
            ],
            messages: [{ role: 'user', content: userPrompt }],
        });
        firebase_functions_1.logger.info('Claude API response received', {
            stopReason: message.stop_reason,
            contentTypes: message.content.map(c => c.type),
        });
    }
    catch (err) {
        firebase_functions_1.logger.error('Claude API call failed', err);
        throw new https_1.HttpsError('internal', `Claude API error: ${err.message}`);
    }
    const content = message.content[0];
    if (content.type !== 'text') {
        firebase_functions_1.logger.error('Unexpected content type', { type: content.type });
        throw new https_1.HttpsError('internal', 'Unexpected response from Claude.');
    }
    firebase_functions_1.logger.info('Claude raw response', { text: content.text.slice(0, 500) });
    const cleaned = content.text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
    try {
        const plan = JSON.parse(cleaned);
        firebase_functions_1.logger.info('Meal plan parsed successfully');
        return plan;
    }
    catch (err) {
        firebase_functions_1.logger.error('JSON parse failed', { raw: cleaned, err });
        throw new https_1.HttpsError('internal', 'Failed to parse meal plan response.');
    }
});
exports.extractIngredients = (0, https_1.onCall)({ secrets: [anthropicApiKey], region: 'europe-west1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    }
    const { fileBase64, mediaType } = request.data;
    if (!fileBase64) {
        throw new https_1.HttpsError('invalid-argument', 'File data is required.');
    }
    firebase_functions_1.logger.info('Extracting ingredients', { mediaType });
    const client = new sdk_1.default({ apiKey: anthropicApiKey.value() });
    const isPdf = mediaType === 'application/pdf';
    const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [
            {
                role: 'user',
                content: [
                    isPdf
                        ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } }
                        : { type: 'image', source: { type: 'base64', media_type: mediaType, data: fileBase64 } },
                    {
                        type: 'text',
                        text: 'List all food ingredients and grocery items you can identify. Return only a plain comma-separated list of ingredients, nothing else. No quantities, no explanations.',
                    },
                ],
            },
        ],
    });
    const content = message.content[0];
    if (content.type !== 'text') {
        throw new https_1.HttpsError('internal', 'Unexpected response from Claude.');
    }
    firebase_functions_1.logger.info('Ingredients extracted', { result: content.text.slice(0, 200) });
    return { ingredients: content.text.trim() };
});
const RECIPE_SYSTEM_PROMPT = `You are a home cooking assistant. Given a meal name and number of servings, generate a clear, practical recipe with step-by-step instructions.

Rules:
- Simple home cooking only — no restaurant techniques
- Scale ingredients for the given number of servings
- Steps should be short, actionable sentences
- Return ONLY valid JSON, no markdown, no explanation

Required JSON format:
{
  "prep_time": "X min",
  "cook_time": "X min",
  "ingredients": ["amount + ingredient", "..."],
  "steps": ["Step description.", "..."]
}`;
exports.getMealRecipe = (0, https_1.onCall)({ secrets: [anthropicApiKey], region: 'europe-west1' }, async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Authentication required.');
    }
    const { mealName, servings, language } = request.data;
    if (!(mealName === null || mealName === void 0 ? void 0 : mealName.trim())) {
        throw new https_1.HttpsError('invalid-argument', 'Meal name is required.');
    }
    const lang = language === 'es' ? 'es' : 'en';
    // Stable document key: lowercase, only alphanumeric + underscore + language suffix
    const recipeKey = `${mealName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_')}_${servings}p_${lang}`;
    firebase_functions_1.logger.info('getMealRecipe called', { mealName, recipeKey, servings });
    // Check Firestore cache first — same meal name always yields the same recipe
    const db = (0, firestore_1.getFirestore)();
    const docRef = db.collection('meal_recipes').doc(recipeKey);
    const cached = await docRef.get();
    if (cached.exists) {
        firebase_functions_1.logger.info('Recipe cache hit', { mealName });
        return (_a = cached.data()) === null || _a === void 0 ? void 0 : _a.recipe;
    }
    firebase_functions_1.logger.info('Recipe cache miss — calling Claude', { mealName });
    const client = new sdk_1.default({ apiKey: anthropicApiKey.value() });
    let message;
    try {
        const langInstruction = lang === 'es'
            ? 'Write the recipe (ingredient names and step descriptions) in Spanish.'
            : 'Write the recipe in English.';
        message = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: [{ type: 'text', text: RECIPE_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            messages: [{
                    role: 'user',
                    content: `Meal: ${mealName}\nServings: ${servings} ${servings === 1 ? 'person' : 'people'}\n${langInstruction}\n\nGenerate the recipe.`,
                }],
        });
    }
    catch (err) {
        firebase_functions_1.logger.error('Claude API call failed', err);
        throw new https_1.HttpsError('internal', `Claude API error: ${err.message}`);
    }
    const content = message.content[0];
    if (content.type !== 'text') {
        throw new https_1.HttpsError('internal', 'Unexpected response from Claude.');
    }
    const cleaned = content.text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
    let recipe;
    try {
        recipe = JSON.parse(cleaned);
    }
    catch (err) {
        firebase_functions_1.logger.error('JSON parse failed', { raw: cleaned, err });
        throw new https_1.HttpsError('internal', 'Failed to parse recipe response.');
    }
    // Persist to Firestore so future requests for the same meal skip Claude entirely
    await docRef.set({ mealName, recipe, createdAt: new Date() });
    firebase_functions_1.logger.info('Recipe cached in Firestore', { mealName });
    return recipe;
});
//# sourceMappingURL=index.js.map