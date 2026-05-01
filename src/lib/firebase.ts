import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
export { auth, firestore };

export async function getOrCreateAnonymousSession() {
  const currentUser = auth().currentUser;
  if (currentUser) return currentUser;

  const { user } = await auth().signInAnonymously();
  return user;
}

export const mealPlansCollection = () =>
  firestore().collection('meal_plans');
