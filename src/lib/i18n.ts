export type Language = 'en' | 'es';

const en = {
  // Navigation
  appName: 'MealFlow',
  weeklyPlan: 'Weekly Plan',
  newPlan: 'New plan',
  planFromScratch: 'Plan from scratch',
  settings: 'Settings',
  plans: 'Plans',

  // Home
  fromIngredients: 'From ingredients',
  useWhatYouHave: 'Use what you have',
  planFromScratchCard: 'Plan from scratch',
  getShoppingList: 'Get a shopping list',
  yourMealPlans: 'Your meal plans',
  noPlansYet: 'No meal plans yet.',
  noPlansSubtext: 'Choose an option above to generate your first weekly plan.',
  planFromScratchLabel: 'Plan from scratch',

  // Input — ingredients mode
  whatIngredients: 'What ingredients do you have?',
  whatIngredientsSubtitle: "List what's in your fridge and pantry",
  fromPhoto: 'From photo',
  fromInvoice: 'From invoice',
  readingFile: 'Reading file...',
  extractingIngredients: 'Extracting ingredients...',
  generateWeeklyPlan: 'Generate weekly plan',
  ingredientsPlaceholder: 'e.g. chicken, rice, tomatoes, onions, olive oil...',
  errorReadFile: 'Could not read the file. Please try again.',
  errorExtractPhoto: 'Could not extract ingredients from the photo.',
  errorExtractFile: 'Could not extract ingredients from the file.',
  errorFilePicker: 'Could not open the file picker. Please try again.',

  // Input — scratch mode
  planYourWeek: 'Plan your week',
  planYourWeekSubtitle: "We'll suggest meals based on your preferences and build a complete shopping list ready for your Friday shop.",
  planYourWeekHint: 'Adjust dietary restrictions and cuisine style anytime in Settings.',

  // Meal Plan
  yourWeeklyPlan: 'Your Weekly Plan',
  meals: 'Meals',
  shoppingList: 'Shopping List',
  regeneratePlan: 'Regenerate plan',
  generatingPlan: 'Generating your meal plan...',
  somethingWentWrong: 'Something went wrong. Please try again.',
  retry: 'Retry',
  backToPlans: '← Plans',

  // Days
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',

  // Meal types
  lunch: 'Lunch',
  dinner: 'Dinner',

  // Shopping categories
  vegetables: 'Vegetables',
  proteins: 'Proteins',
  other: 'Other',

  // Meal Detail
  prep: 'Prep',
  cook: 'Cook',
  ingredients: 'Ingredients',
  steps: 'Steps',
  fetchingRecipe: 'Fetching recipe...',
  couldNotLoadRecipe: 'Could not load the recipe. Please try again.',

  // Onboarding
  welcomeTitle: 'Welcome to MealFlow',
  welcomeSubtitle: "Let's set up your meal preferences",
  getStarted: 'Get started',

  // Settings / Onboarding shared
  householdSize: 'Household size',
  dietaryRestrictions: 'Dietary restrictions',
  cuisineStyle: 'Cuisine style',
  savePreferences: 'Save preferences',
  savedTitle: 'Saved',
  savedMessage: 'Your preferences have been updated.',
  language: 'Language',

  // Misc
  done: 'Done',
  errorGeneric: 'Error',
};

const es: typeof en = {
  // Navigation
  appName: 'MealFlow',
  weeklyPlan: 'Plan Semanal',
  newPlan: 'Nuevo plan',
  planFromScratch: 'Plan desde cero',
  settings: 'Ajustes',
  plans: 'Planes',

  // Home
  fromIngredients: 'Con mis ingredientes',
  useWhatYouHave: 'Usa lo que tienes',
  planFromScratchCard: 'Plan desde cero',
  getShoppingList: 'Obtener lista de compra',
  yourMealPlans: 'Tus planes de comidas',
  noPlansYet: 'Aún no hay planes.',
  noPlansSubtext: 'Elige una opción arriba para generar tu primer plan semanal.',
  planFromScratchLabel: 'Plan desde cero',

  // Input — ingredients mode
  whatIngredients: '¿Qué ingredientes tienes?',
  whatIngredientsSubtitle: 'Lista lo que hay en tu nevera y despensa',
  fromPhoto: 'Desde foto',
  fromInvoice: 'Desde factura',
  readingFile: 'Leyendo archivo...',
  extractingIngredients: 'Extrayendo ingredientes...',
  generateWeeklyPlan: 'Generar plan semanal',
  ingredientsPlaceholder: 'ej. pollo, arroz, tomates, cebollas, aceite de oliva...',
  errorReadFile: 'No se pudo leer el archivo. Por favor, inténtalo de nuevo.',
  errorExtractPhoto: 'No se pudieron extraer ingredientes de la foto.',
  errorExtractFile: 'No se pudieron extraer ingredientes del archivo.',
  errorFilePicker: 'No se pudo abrir el selector de archivos. Por favor, inténtalo de nuevo.',

  // Input — scratch mode
  planYourWeek: 'Planifica tu semana',
  planYourWeekSubtitle: 'Sugeriremos comidas según tus preferencias y crearemos una lista de compra completa para tu compra del viernes.',
  planYourWeekHint: 'Ajusta las restricciones dietéticas y el estilo de cocina en Ajustes.',

  // Meal Plan
  yourWeeklyPlan: 'Tu Plan Semanal',
  meals: 'Comidas',
  shoppingList: 'Lista de Compra',
  regeneratePlan: 'Regenerar plan',
  generatingPlan: 'Generando tu plan de comidas...',
  somethingWentWrong: 'Algo salió mal. Por favor, inténtalo de nuevo.',
  retry: 'Reintentar',
  backToPlans: '← Planes',

  // Days
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',

  // Meal types
  lunch: 'Almuerzo',
  dinner: 'Cena',

  // Shopping categories
  vegetables: 'Verduras',
  proteins: 'Proteínas',
  other: 'Otros',

  // Meal Detail
  prep: 'Prep',
  cook: 'Cocción',
  ingredients: 'Ingredientes',
  steps: 'Pasos',
  fetchingRecipe: 'Obteniendo receta...',
  couldNotLoadRecipe: 'No se pudo cargar la receta. Por favor, inténtalo de nuevo.',

  // Onboarding
  welcomeTitle: 'Bienvenido a MealFlow',
  welcomeSubtitle: 'Configuremos tus preferencias',
  getStarted: 'Empezar',

  // Settings / Onboarding shared
  householdSize: 'Personas en el hogar',
  dietaryRestrictions: 'Restricciones dietéticas',
  cuisineStyle: 'Estilo de cocina',
  savePreferences: 'Guardar preferencias',
  savedTitle: 'Guardado',
  savedMessage: 'Tus preferencias han sido actualizadas.',
  language: 'Idioma',

  // Misc
  done: 'Listo',
  errorGeneric: 'Error',
};

export const translations = { en, es };
export type TranslationKey = keyof typeof en;

export const DIETARY_OPTIONS = ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Diabetic', 'Halal', 'Kosher'];
export const CUISINE_OPTIONS = ['Any', 'Mediterranean', 'Asian', 'Italian', 'Mexican', 'Indian', 'American', 'Middle Eastern', 'Japanese', 'French'];

export const DIETARY_LABELS: Record<Language, string[]> = {
  en: DIETARY_OPTIONS,
  es: ['Ninguno', 'Vegetariano', 'Vegano', 'Sin gluten', 'Sin lácteos', 'Sin frutos secos', 'Diabético', 'Halal', 'Kosher'],
};

export const CUISINE_LABELS: Record<Language, string[]> = {
  en: CUISINE_OPTIONS,
  es: ['Cualquiera', 'Mediterránea', 'Asiática', 'Italiana', 'Mexicana', 'India', 'Americana', 'Oriente Medio', 'Japonesa', 'Francesa'],
};
