"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMealPlan = void 0;
const sdk_1 = require("@anthropic-ai/sdk");
const app_1 = require("firebase-admin/app");
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
    const { ingredients, preferences, householdSize } = request.data;
    firebase_functions_1.logger.info('Request data', { ingredients, householdSize, preferences });
    if (!(ingredients === null || ingredients === void 0 ? void 0 : ingredients.trim())) {
        throw new https_1.HttpsError('invalid-argument', 'Ingredients are required.');
    }
    firebase_functions_1.logger.info('Calling Claude API');
    let message;
    try {
        const client = new sdk_1.default({ apiKey: anthropicApiKey.value() });
        const userPrompt = `Available ingredients: ${ingredients}

Household size: ${householdSize} ${householdSize === 1 ? 'person' : 'people'}
Dietary restrictions: ${preferences.dietaryRestrictions || 'none'}
Cuisine style preference: ${preferences.cuisineStyle || 'any'}

Generate the weekly meal plan.`;
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
//# sourceMappingURL=index.js.map