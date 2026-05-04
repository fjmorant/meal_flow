import { httpsCallable } from '@react-native-firebase/functions';
import { useMutation } from '@tanstack/react-query';

import { functionsEU } from '@/lib/firebase';

export interface ExtractFile {
  fileBase64: string;
  mediaType: string;
}

interface ExtractParams {
  files: ExtractFile[];
}

export function useExtractIngredients() {
  return useMutation({
    mutationFn: async ({ files }: ExtractParams): Promise<string> => {
      const fn = httpsCallable<ExtractParams, { ingredients: string }>(functionsEU, 'extractIngredients');
      const result = await fn({ files });
      return result.data.ingredients;
    },
  });
}
