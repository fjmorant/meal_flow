import { getApp } from '@react-native-firebase/app';
import { getAuth, signInAnonymously } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getFunctions } from '@react-native-firebase/functions';

export const auth = getAuth();
export const db = getFirestore();
export const functionsEU = getFunctions(getApp(), 'europe-west1');

export async function getOrCreateAnonymousSession() {
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}
