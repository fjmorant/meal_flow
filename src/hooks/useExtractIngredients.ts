import { httpsCallable } from '@react-native-firebase/functions';
import { useMutation } from '@tanstack/react-query';

import { functionsEU } from '@/lib/firebase';

interface ExtractParams {
  fileBase64: string;
  mediaType: string;
}

export function useExtractIngredients() {
  return useMutation({
    mutationFn: async ({ fileBase64, mediaType }: ExtractParams): Promise<string> => {
      const fn = httpsCallable<ExtractParams, { ingredients: string }>(functionsEU, 'extractIngredients');
      const result = await fn({ fileBase64, mediaType });
      return result.data.ingredients;
    },
  });
}
