export interface LessonStep {
  title: string;
  instruction: string;
  tips?: string[];
  duration?: number; // minutes
}

export interface LessonMaterial {
  label: string;
  printableId?: string; // links to a printable resource in the app
  printableLabel?: string; // friendly name for the linked printable
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  focus: string;
  theme: string;
  color: string;
  icon: string;
  ageRange: string;
  duration: string;
  objectives: string[];
  materials: string[];
  materialsDetailed: LessonMaterial[];
  steps: LessonStep[];
  senDifferentiation: string[];
  assessmentOpportunities: string[];
  access: 'free' | 'preview' | 'paid';
}

export const LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    number: 1,
    title: 'Too Loud, Too Bright, Too Fast',
    subtitle: 'Sensory Awareness',
    focus: 'Sensory Awareness',
    theme: 'Understanding how different people experience sound, light, and movement. Linked to Cobie covering his ears, stepping back, and feeling overwhelmed.',
    color: '#4FC3F7',
    icon: 'ear',
    ageRange: 'EYFS',
    duration: '20-30 min',
    objectives: [
      'Notice different sounds, lights, and movements',
      'Recognise when something feels "too much"',
      'Begin to express sensory preferences',
    ],
    materials: [
      'Shakers or gentle percussion',
      'Soft light source (lamp or torch)',
      'Scarves or ribbons',
      'Quiet space (carpet area or Calm Corner)',
    ],
    materialsDetailed: [
      { label: 'Shakers or gentle percussion' },
      { label: 'Soft light source (lamp or torch)' },
      { label: 'Scarves or ribbons' },
      { label: 'Quiet space (carpet area or Calm Corner)' },
      { label: 'Sensory Preferences Worksheet', printableId: 'p-5', printableLabel: 'Sensory Preferences Worksheet' },
      { label: 'Feelings Thermometer (optional)', printableId: 'p-4', printableLabel: 'Feelings Thermometer' },
    ],
    steps: [
      {
        title: 'Story Connection',
        instruction: 'Revisit the story page where Cobie covers his ears and ask: "What do you think Cobie felt?"',
        tips: ['Use a calm, gentle voice', 'Show the illustration clearly'],
        duration: 5,
      },
      {
        title: 'Sensory Stations',
        instruction: 'Introduce three stations:\n• Sound (soft shakers)\n• Light (torch on wall)\n• Movement (slow scarf waving)',
        tips: ['Keep each station gentle', 'Allow children to observe first'],
        duration: 10,
      },
      {
        title: 'Exploration Questions',
        instruction: 'At each station ask:\n• Did you like that?\n• Was it too much?\n• Was it just right?',
        tips: ['Accept all responses', 'Model language: "That was too bright for me"'],
        duration: 8,
      },
      {
        title: 'Sharing Feelings',
        instruction: 'Gather together and model language to help children express their feelings:\n• "I like/don\'t like big sounds"\n• "Bright lights feel too strong for me"',
        tips: ['Celebrate all preferences', 'No right or wrong answers'],
        duration: 5,
      },
      {
        title: 'Calm Ending',
        instruction: 'End with a quiet moment in the Calm Corner.',
        tips: ['Dim lights if possible', 'Use soft voice'],
        duration: 2,
      },
    ],
    senDifferentiation: [
      'Offer ear defenders during sound station',
      'Allow children to skip stations',
      'Provide visual choice cards',
      'Use hand-over-hand guidance if appropriate',
      'Keep instructions minimal',
    ],
    assessmentOpportunities: [
      'Can the child identify sensory preferences?',
      'Do they use language to express feelings?',
      'Can they recognise "too much"?',
    ],
    access: 'free',
  },
  {
    id: 'lesson-2',
    number: 2,
    title: 'Quiet Games, Calm Spaces',
    subtitle: 'Emotional Regulation',
    focus: 'Emotional Regulation',
    theme: 'Creating a Calm Corner inspired by Cobie',
    color: '#81C784',
    icon: 'leaf',
    ageRange: 'EYFS',
    duration: '20-30 min',
    objectives: [
      'Identify what helps them feel calm',
      'Explore quiet play options',
      'Contribute to creating a Calm Corner',
    ],
    materials: [
      'Soft fabrics',
      'Cushions',
      'Pebbles or counters',
      'Books',
      'Calm Corner poster (from printables)',
    ],
    materialsDetailed: [
      { label: 'Soft fabrics' },
      { label: 'Cushions' },
      { label: 'Pebbles or counters' },
      { label: 'Books' },
      { label: 'Calm Corner Poster', printableId: 'p-2', printableLabel: 'Calm Corner Poster' },
      { label: 'Cobie Breathing Visual', printableId: 'p-3', printableLabel: 'Cobie Breathing Visual' },
      { label: 'Help Cards for Children', printableId: 'p-15', printableLabel: 'Help Cards' },
    ],
    steps: [
      {
        title: 'Story Connection',
        instruction: 'Revisit the page where Cobie sits quietly with Tilly.\nAsk: "What helped Cobie feel calm?"',
        duration: 5,
      },
      {
        title: 'Introduce Calm Corner',
        instruction: 'Introduce the idea of a Calm Corner.\n• Children explore calming items.\n• As a group, choose what belongs in the Calm Corner.',
        duration: 10,
      },
      {
        title: 'Set Up Together',
        instruction: 'Set up the space together.\nModel using it: "I\'m going to the Calm Corner to feel peaceful."',
        duration: 10,
      },
    ],
    senDifferentiation: [
      'Provide sensory tools (fidget, weighted item)',
      'Use visual choice cards',
      'Allow children to choose not to enter the space',
    ],
    assessmentOpportunities: [
      'Can the child identify calming items?',
      'Do they use the Calm Corner appropriately?',
    ],
    access: 'preview',
  },
  {
    id: 'lesson-3',
    number: 3,
    title: 'Pebble Sorting with Cobie',
    subtitle: 'Mindful Play & Patterning',
    focus: 'Mindful Play & Patterning',
    theme: 'Quiet, focused activities',
    color: '#FFB74D',
    icon: 'ellipse',
    ageRange: 'EYFS',
    duration: '15-25 min',
    objectives: [
      'Sort objects by colour, size, or shape',
      'Engage in calm, focused play',
      'Work independently or alongside peers',
    ],
    materials: [
      'Pebbles (real or paper)',
      'Sorting trays',
      'Colour mats',
    ],
    materialsDetailed: [
      { label: 'Pebbles (real or paper)' },
      { label: 'Sorting trays' },
      { label: 'Sorting Activity Mats', printableId: 'p-12', printableLabel: 'Sorting Activity Mats' },
      { label: 'My Quiet Garden Template (extension)', printableId: 'p-14', printableLabel: 'My Quiet Garden Template' },
    ],
    steps: [
      {
        title: 'Story Connection',
        instruction: 'Revisit the page where Cobie sorts pebbles.\nModel sorting by colour.',
        duration: 5,
      },
      {
        title: 'Sorting Activity',
        instruction: 'Children choose their own way of sorting.\n• Encourage a quiet focus.\n• Share patterns at the end.',
        duration: 15,
      },
    ],
    senDifferentiation: [
      'Provide fewer choices',
      'Offer tactile alternatives',
      'Use visual sorting prompts',
    ],
    assessmentOpportunities: [
      'Can the child sort accurately?',
      'Do they remain engaged in quiet play?',
    ],
    access: 'paid',
  },
  {
    id: 'lesson-4',
    number: 4,
    title: 'Different Ways to Play, All Ways Are OK',
    subtitle: 'Inclusion & Empathy',
    focus: 'Inclusion & Empathy',
    theme: 'Understanding different play styles',
    color: '#CE93D8',
    icon: 'people',
    ageRange: 'EYFS',
    duration: '20-30 min',
    objectives: [
      'Recognise different ways of playing',
      'Show acceptance of others\' preferences',
      'Practice gentle, inclusive behaviour',
    ],
    materials: [
      'Character cards (Cobie, Darcy, Harper, Tilly)',
      'Role-play props',
    ],
    materialsDetailed: [
      { label: 'Character Cards Set', printableId: 'p-7', printableLabel: 'Character Cards Set' },
      { label: 'Role-play props' },
      { label: 'Emotion Face Cards', printableId: 'p-1', printableLabel: 'Emotion Face Cards' },
      { label: 'Kindness Cards', printableId: 'p-6', printableLabel: 'Kindness Cards' },
      { label: 'Voice Volume Cards (optional)', printableId: 'p-11', printableLabel: 'Voice Volume Cards' },
    ],
    steps: [
      {
        title: 'Character Cards',
        instruction: 'Show character cards.\nAsk: "How does each friend like to play?"',
        duration: 5,
      },
      {
        title: 'Role Play',
        instruction: 'Children act out different play styles.\nDiscuss: "Which one feels like you?"',
        duration: 15,
      },
      {
        title: 'Celebrate Differences',
        instruction: 'Celebrate differences. Discuss how all ways of playing are OK.',
        duration: 5,
      },
    ],
    senDifferentiation: [
      'Allow observing instead of acting',
      'Provide simple scripts',
      'Use visual prompts',
    ],
    assessmentOpportunities: [
      'Can the child identify different play styles?',
      'Do they show empathy?',
    ],
access: 'paid',    
  },
];
