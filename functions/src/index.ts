import Anthropic from '@anthropic-ai/sdk';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';

initializeApp();

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

interface Preferences {
  dietaryRestrictions: string;
  cuisineStyle: string;
  cookingTime?: string;
  budget?: string;
  healthGoal?: string;
}

interface GenerateMealPlanRequest {
  ingredients: string;
  preferences: Preferences;
  householdSize: number;
  mode?: 'ingredients' | 'scratch';
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

    const { ingredients, preferences, householdSize, mode } =
      request.data as GenerateMealPlanRequest;

    logger.info('Request data', { ingredients, householdSize, preferences, mode });

    const isScratch = mode === 'scratch' || !ingredients?.trim();

    if (!isScratch && !ingredients?.trim()) {
      throw new HttpsError('invalid-argument', 'Ingredients are required.');
    }

    logger.info('Calling Claude API');

    let message;
    try {
      const client = new Anthropic({ apiKey: anthropicApiKey.value() });

      const prefLines = [
        `Household size: ${householdSize} ${householdSize === 1 ? 'person' : 'people'}`,
        `Dietary restrictions: ${preferences.dietaryRestrictions || 'none'}`,
        `Cuisine style: ${preferences.cuisineStyle || 'any'}`,
        `Cooking time per meal: ${preferences.cookingTime || 'any'}`,
        `Weekly budget: ${preferences.budget || 'any'}`,
        `Health goal: ${preferences.healthGoal || 'balanced'}`,
      ].join('\n');

      const userPrompt = isScratch
        ? `${prefLines}

No specific ingredients — suggest a practical weekly meal plan that fits the above preferences. Include a comprehensive shopping list with everything needed to cook these meals.`
        : `Available ingredients: ${ingredients}

${prefLines}

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

interface ExtractFile {
  fileBase64: string;
  mediaType: string;
}

interface ExtractIngredientsRequest {
  files: ExtractFile[];
}

export const extractIngredients = onCall(
  { secrets: [anthropicApiKey], region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { files } = request.data as ExtractIngredientsRequest;

    if (!files?.length) {
      throw new HttpsError('invalid-argument', 'At least one file is required.');
    }

    logger.info('Extracting ingredients', { fileCount: files.length });

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

    const fileBlocks = files.map(f =>
      f.mediaType === 'application/pdf'
        ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: f.fileBase64 } }
        : { type: 'image' as const, source: { type: 'base64' as const, media_type: f.mediaType as ImageMediaType, data: f.fileBase64 } }
    );

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            ...fileBlocks,
            {
              type: 'text',
              text: 'List all food ingredients and grocery items you can identify across all images. Return only a plain comma-separated list of ingredients, no duplicates, nothing else. No quantities, no explanations.',
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new HttpsError('internal', 'Unexpected response from Claude.');
    }

    logger.info('Ingredients extracted', { result: content.text.slice(0, 200) });
    return { ingredients: content.text.trim() };
  }
);

interface GetMealRecipeRequest {
  mealName: string;
  servings: number;
}

export interface MealRecipe {
  prep_time: string;
  cook_time: string;
  ingredients: string[];
  steps: string[];
}

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

export const getMealRecipe = onCall(
  { secrets: [anthropicApiKey], region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { mealName, servings } = request.data as GetMealRecipeRequest;

    if (!mealName?.trim()) {
      throw new HttpsError('invalid-argument', 'Meal name is required.');
    }

    const recipeKey = `${mealName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_')}_${servings}p`;

    logger.info('getMealRecipe called', { mealName, recipeKey, servings });

    // Check Firestore cache first — same meal name always yields the same recipe
    const db = getFirestore();
    const docRef = db.collection('meal_recipes').doc(recipeKey);
    const cached = await docRef.get();

    if (cached.exists) {
      logger.info('Recipe cache hit', { mealName });
      return cached.data()?.recipe as MealRecipe;
    }

    logger.info('Recipe cache miss — calling Claude', { mealName });

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    let message;
    try {
      message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: [{ type: 'text', text: RECIPE_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: `Meal: ${mealName}\nServings: ${servings} ${servings === 1 ? 'person' : 'people'}\n\nGenerate the recipe.`,
        }],
      });
    } catch (err) {
      logger.error('Claude API call failed', err);
      throw new HttpsError('internal', `Claude API error: ${(err as Error).message}`);
    }

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new HttpsError('internal', 'Unexpected response from Claude.');
    }

    const cleaned = content.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    let recipe: MealRecipe;
    try {
      recipe = JSON.parse(cleaned) as MealRecipe;
    } catch (err) {
      logger.error('JSON parse failed', { raw: cleaned, err });
      throw new HttpsError('internal', 'Failed to parse recipe response.');
    }

    // Persist to Firestore so future requests for the same meal skip Claude entirely
    await docRef.set({ mealName, recipe, createdAt: new Date() });
    logger.info('Recipe cached in Firestore', { mealName });

    return recipe;
  }
);
