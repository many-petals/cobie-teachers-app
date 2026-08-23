export type BookModuleStatus = 'live' | 'in-development' | 'planned';

export interface BookModuleDefinition {
  id: string;
  slug: string;
  displayName: string;
  shortName: string;
  bookTitle: string;
  teachingFocus: string;
  teacherPromise: string;
  stageLabel: string;
  appStatusLabel: string;
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
    bookTitle: 'Cobie the Cactus: Happy As He Is',
    teachingFocus: 'Belonging, feelings, sensory awareness, and self-acceptance',
    teacherPromise: 'Use story-led lessons, printables, tracker tools, and parent letters to support emotional literacy with less prep.',
    stageLabel: 'EYFS + KS1',
    appStatusLabel: 'Live now',
    status: 'live',
    themeColor: '#5CBF7A',
  },
  {
    id: 'darcy',
    slug: 'darcy-the-daisy',
    displayName: 'Darcy the Daisy',
    shortName: 'Darcy',
    bookTitle: 'Darcy the Daisy Learns to Wait',
    teachingFocus: 'Turn-taking, patience, waiting, and social confidence',
    teacherPromise: 'The next companion pack will follow the same clear classroom structure as Cobie.',
    stageLabel: 'EYFS + KS1',
    appStatusLabel: 'In development',
    status: 'in-development',
    themeColor: '#E5A51A',
  },
  {
    id: 'lyleen',
    slug: 'lyleen-the-lotus',
    displayName: 'Lyleen the Lotus',
    shortName: 'Lyleen',
    bookTitle: 'Lyleen the Lotus Dances in Two Languages',
    teachingFocus: 'Language, identity, belonging, and confidence',
    teacherPromise: 'A future companion pack for supporting bilingual identity and classroom inclusion.',
    stageLabel: 'EYFS + KS1',
    appStatusLabel: 'Coming soon',
    status: 'planned',
    themeColor: '#E97886',
  },
  {
    id: 'tilly',
    slug: 'tilly-the-tulip',
    displayName: 'Tilly the Tulip',
    shortName: 'Tilly',
    bookTitle: 'Tilly the Tulip Finds Her Voice',
    teachingFocus: 'Communication, confidence, voice, and being heard',
    teacherPromise: 'A future companion pack for helping children practise expression and self-advocacy.',
    stageLabel: 'EYFS + KS1',
    appStatusLabel: 'Coming soon',
    status: 'planned',
    themeColor: '#F08AB8',
  },
  {
    id: 'harper',
    slug: 'harper-the-hyacinth',
    displayName: 'Harper the Hyacinth',
    shortName: 'Harper',
    bookTitle: 'Harper the Hyacinth Blooms in All Colours',
    teachingFocus: 'Difference, inclusion, identity, and celebrating diversity',
    teacherPromise: 'A future companion pack for helping every child feel seen and included.',
    stageLabel: 'EYFS + KS1',
    appStatusLabel: 'Coming soon',
    status: 'planned',
    themeColor: '#9B7BE8',
  },
  {
    id: 'garden',
    slug: 'the-garden-where-everyone-belongs',
    displayName: 'The Garden Where Everyone Belongs',
    shortName: 'The Garden',
    bookTitle: 'The Garden Where Everyone Belongs',
    teachingFocus: 'Whole-class belonging, kindness, empathy, and community',
    teacherPromise: 'A future companion pack for bringing the Little Petals themes together across the classroom.',
    stageLabel: 'EYFS + KS1',
    appStatusLabel: 'Coming soon',
    status: 'planned',
    themeColor: '#3C8A5F',
  },
];

export function getBookModuleBySlug(slug: string): BookModuleDefinition | undefined {
  return LITTLE_PETALS_BOOK_MODULES.find(module => module.slug === slug);
}

export function getBookModuleLabel(slug: string): string {
  return getBookModuleBySlug(slug)?.displayName ?? slug;
}
