import { firebase } from '@react-native-firebase/functions';
import { useMutation } from '@tanstack/react-query';

const functionsEU = firebase.app().functions('europe-west1');

interface ExtractParams {
  fileBase64: string;
  mediaType: string;
}

export function useExtractIngredients() {
  return useMutation({
    mutationFn: async ({ fileBase64, mediaType }: ExtractParams): Promise<string> => {
      const result = await functionsEU.httpsCallable('extractIngredients')({
        fileBase64,
        mediaType,
      });
      return (result.data as { ingredients: string }).ingredients;
    },
  });
}
