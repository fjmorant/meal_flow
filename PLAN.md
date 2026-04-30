# AI Weekly Meal Copilot — Build Plan

## Goal

Build a minimal MVP that generates a weekly meal plan + shopping list from user-provided ingredients.

---

## Tech Stack

- **Framework:** Expo + TypeScript
- **Navigation:** React Navigation
- **Backend:** Supabase (anonymous auth for MVP, email/login later)
- **AI:** Claude API (Anthropic) via Supabase Edge Function

---

## Screens

| Screen | Purpose |
|---|---|
| `OnboardingScreen` | Collect household size + dietary preferences |
| `InputScreen` | Free-text ingredients input + generate button |
| `MealPlanScreen` | Display weekly plan + shopping list + regenerate |

---

## Database

**Table: `meal_plans`**

| Column | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| created_at | timestamp |
| plan_json | jsonb |
| ingredients_input | text |

---

## Edge Function: `/generate-meal-plan`

**Input:**
```json
{
  "ingredients": "string",
  "preferences": {
    "dietary_restrictions": [],
    "cuisine_style": "string"
  },
  "household_size": 2
}
```

**Output (strict JSON):**
```json
{
  "week": {
    "monday": { "lunch": "...", "dinner": "..." },
    "tuesday": { "lunch": "...", "dinner": "..." },
    "wednesday": { "lunch": "...", "dinner": "..." },
    "thursday": { "lunch": "...", "dinner": "..." },
    "friday": { "lunch": "...", "dinner": "..." },
    "saturday": { "lunch": "...", "dinner": "..." },
    "sunday": { "lunch": "...", "dinner": "..." }
  },
  "shopping_list": {
    "vegetables": [],
    "proteins": [],
    "other": []
  }
}
```

**Rules:**
- Simple meals only
- Reuse ingredients across the week
- Realistic home cooking

---

## Build Steps

### Step 1 — Project Setup
- [ ] Create Expo app with TypeScript
- [ ] Setup React Navigation
- [ ] Create `OnboardingScreen` (household size + dietary preferences)
- [ ] Create `InputScreen` (ingredients input placeholder)
- [ ] Create `MealPlanScreen` (placeholder)

**→ STOP and wait for confirmation**

---

### Step 2 — Supabase Setup
- [ ] Initialize Supabase client (`/lib/supabase.ts`)
- [ ] Setup anonymous authentication
- [ ] Create `meal_plans` table

**→ STOP and wait for confirmation**

---

### Step 3 — Input Flow
- [ ] Implement `InputScreen` with ingredients text input
- [ ] Add "Generate weekly plan" button
- [ ] On submit: navigate to `MealPlanScreen` passing ingredients + onboarding preferences

**→ STOP and wait for confirmation**

---

### Step 4 — Edge Function
- [ ] Create Supabase Edge Function `/generate-meal-plan`
- [ ] Call Claude API (Anthropic)
- [ ] Return strict JSON format (week + shopping list)

**→ STOP and wait for confirmation**

---

### Step 5 — Meal Plan Screen
- [ ] Call edge function from `MealPlanScreen`
- [ ] Show loading state
- [ ] Display weekly plan (by day)
- [ ] Display shopping list (by category)
- [ ] Add "Regenerate plan" button

**→ STOP and wait for confirmation**

---

### Step 6 — Persist Data
- [ ] Save generated plan to Supabase
- [ ] Load last saved plan on app start

**→ STOP and wait for confirmation**

---

## Success Criteria

The app is done when:
- User completes onboarding (household size + preferences)
- User inputs available ingredients
- App returns a full weekly meal plan
- App returns a categorized shopping list
- User can regenerate the plan

---

## Rules

- Do NOT overengineer
- Do NOT add extra features beyond the plan
- Keep components small and readable
- Focus on functionality, not design
- Wait for confirmation after each step before proceeding
