import Anthropic from '@anthropic-ai/sdk';
import { initializeApp } from 'firebase-admin/app';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';

initializeApp();

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

interface Preferences {
  dietaryRestrictions: string;
  cuisineStyle: string;
}

interface GenerateMealPlanRequest {
  ingredients: string;
  preferences: Preferences;
  householdSize: number;
}

interface DayPlan {
  lunch: string;
  dinner: string;
}

interface MealPlanResponse {
  week: {
    monday: DayPlan;
    tuesday: DayPlan;
    wednesday: DayPlan;
    thursday: DayPlan;
    friday: DayPlan;
    saturday: DayPlan;
    sunday: DayPlan;
  };
  shopping_list: {
    vegetables: string[];
    proteins: string[];
    other: string[];
  };
}

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

export const generateMealPlan = onCall(
  { secrets: [anthropicApiKey], region: 'europe-west1' },
  async (request) => {
    logger.info('generateMealPlan called', { uid: request.auth?.uid });

    if (!request.auth) {
      logger.warn('Unauthenticated request rejected');
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { ingredients, preferences, householdSize } =
      request.data as GenerateMealPlanRequest;

    logger.info('Request data', { ingredients, householdSize, preferences });

    if (!ingredients?.trim()) {
      throw new HttpsError('invalid-argument', 'Ingredients are required.');
    }

    logger.info('Calling Claude API');

    let message;
    try {
      const client = new Anthropic({ apiKey: anthropicApiKey.value() });

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

      logger.info('Claude API response received', {
        stopReason: message.stop_reason,
        contentTypes: message.content.map(c => c.type),
      });
    } catch (err) {
      logger.error('Claude API call failed', err);
      throw new HttpsError('internal', `Claude API error: ${(err as Error).message}`);
    }

    const content = message.content[0];
    if (content.type !== 'text') {
      logger.error('Unexpected content type', { type: content.type });
      throw new HttpsError('internal', 'Unexpected response from Claude.');
    }

    logger.info('Claude raw response', { text: content.text.slice(0, 500) });

    const cleaned = content.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    try {
      const plan = JSON.parse(cleaned) as MealPlanResponse;
      logger.info('Meal plan parsed successfully');
      return plan;
    } catch (err) {
      logger.error('JSON parse failed', { raw: cleaned, err });
      throw new HttpsError('internal', 'Failed to parse meal plan response.');
    }
  }
);
