export const FREE_ACTIVITY_LIMIT = 3;
export const FREE_PUPIL_LIMIT = 3;

export function isFreeActivityIndex(index: number): boolean {
  return index < FREE_ACTIVITY_LIMIT;
}
