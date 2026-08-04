export type BookModuleStatus = 'live' | 'in-development' | 'planned';

export interface BookModuleDefinition {
  id: string;
  slug: string;
  displayName: string;
  shortName: string;
  status: BookModuleStatus;
  themeColor: string;
}

export const LITTLE_PETALS_TARGET_BOOK_COUNT = 6;

export const LITTLE_PETALS_BOOK_MODULES: BookModuleDefinition[] = [
  {
    id: 'cobie',
    slug: 'cobie-the-cactus',
    displayName: 'Cobie the Cactus',
    shortName: 'Cobie',
    status: 'live',
    themeColor: '#5CBF7A',
  },
  {
    id: 'darcy',
    slug: 'darcy-the-daisy',
    displayName: 'Darcy the Daisy',
    shortName: 'Darcy',
    status: 'in-development',
    themeColor: '#F3A6C7',
  },
];

export function getBookModuleBySlug(slug: string): BookModuleDefinition | undefined {
  return LITTLE_PETALS_BOOK_MODULES.find(module => module.slug === slug);
}

export function getBookModuleLabel(slug: string): string {
  return getBookModuleBySlug(slug)?.displayName ?? slug;
}
