import { File } from '$lib/types/Application.types';

export const getTag = (file: File, key: string): string | undefined => {
  const tags = file?.tags || [];
  return tags.find((tag) => tag.Key === key)?.Value;
};
