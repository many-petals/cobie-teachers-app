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
        instruction: 'Read the page where Cobie covers his ears.\nAsk: "How does Cobie feel?"\nAsk: "How can we tell?"',
        tips: ['Pause and point to the image', 'Model: "Cobie might feel overwhelmed"'],
        duration: 5,
      },
      {
        title: 'Guided Sensory Exploration',
        instruction: 'Let children explore sounds, light, and movement.\nSay: "You can stop anytime."\nModel: "I like this / I don’t like this."',
        tips: ['Model first', 'Keep volume low and safe'],
        duration: 10,
      },
      {
        title: 'Reflect & Sort',
        instruction: 'Sort experiences:\n• Too much\n• Just right\n• Not enough\nAsk: "Which felt too much?"\nAsk: "Which felt okay?"\nModel: "I don’t like loud sounds."\n"I need a break."',
        tips: ['No wrong answers', 'Use feeling words'],
        duration: 8,
      },

      {
        title: 'Calm Close',
        instruction: 'Breathe in 4\nHold 2\nOut 4\nRepeat 3 times.',
        tips: ['Use slow voice', 'Dim lights'],
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
        instruction: 'Read the page where Cobie finds a quieter space with Tilly. Ask: "What helped Cobie feel calm? What do you notice about the space?"',
        tips: ['Point to the illustration', 'Model answers such as: "It looks quiet", "It feels safe"'],
        duration: 5,
      },
      {
        title: 'Explore Calm Choices',
        instruction: 'Show calming items one at a time:\n• soft fabric\n• cushion\n• pebble/counter\n• book\nAsk: "Would this help Cobie feel calm?" and "Would this help you feel calm?"',
        tips: ['Let children touch and test items', 'Accept different preferences'],
        duration: 8,
      },
      {
        title: 'Build the Calm Corner',
        instruction: 'As a group, choose which items belong in the Calm Corner. Add them together and decide where each item should go.',
        tips: ['Keep language simple', 'Let children make choices'],
        duration: 8,
      },
      {
        title: 'Practise Using the Space',
        instruction: 'Model how to use the Calm Corner:\n"I need a quiet moment."\n"I am going to sit here and breathe slowly."\nInvite children to practise one at a time.',
        tips: ['Use calm voice and slow movements', 'Offer visual prompts if needed'],
        duration: 7,
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
        instruction: 'Read the page where Cobie sorts pebbles. Ask: "What is Cobie doing? Why might this help him feel calm?"',
        tips: ['Model: "Sorting can help our brains feel organised"', 'Point to colours and groups'],
        duration: 5,
      },
      {
        title: 'Explore Sorting',
        instruction: 'Show materials (pebbles, counters). Model simple sorting:\n• by colour\n• by size\n• by shape\nThen invite children to try.',
        tips: ['Model slowly first', 'Use clear categories'],
        duration: 7,
      },
      {
        title: 'Child-Led Sorting',
        instruction: 'Children choose their own way to sort.\nAsk: "How are you sorting?"\nEncourage focus and calm engagement.',
        tips: ['Accept all methods', 'Support language: "I sorted by…"'],
        duration: 10,
      },
      {
        title: 'Share & Reflect',
        instruction: 'Children show their sorting.\nAsk: "How did that feel?"\nLink to calm: "Did it help your body feel quieter?"',
        tips: ['Model feeling words', 'Celebrate effort'],
        duration: 5,
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
        title: 'Reflect Together',
        instruction: 'Ask: "What did you notice?"\nEncourage children to share preferences and feelings.',
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
  {
    id: 'lesson-5',
    number: 5,
    title: 'Understanding Cobie’s Feelings',
    subtitle: 'Emotion Recognition',
    focus: 'Emotion Recognition',
    theme: 'Recognising feelings through Cobie’s story moments',
    color: '#4DB6AC',
    icon: 'happy',
    ageRange: 'KS1',
    duration: '25-30 min',
    objectives: [
      'Identify basic emotions',
      'Recognise feelings in others',
      'Begin to describe emotions',
    ],
    materials: ['Emotion cards'],
    materialsDetailed: [
      { label: 'Emotion Cards', printableId: 'p-1', printableLabel: 'Emotion Cards' },
    ],
    steps: [
      {
        title: 'Story Connection',
        instruction: 'Read the page where Cobie is showing a strong feeling.\nAsk: "How does Cobie feel? What clues can you see?"',
        duration: 5,
      },
      {
        title: 'Emotion Detective',
        instruction: 'Children guess emotions from faces and actions using the emotion cards.',
        duration: 10,
      },
      {
        title: 'Discussion',
        instruction: 'Talk about times they felt the same emotion. Model simple sentences: "I felt ___ when ___."',
        duration: 7,
      },
      {
        title: 'Reflect Together',
        instruction: 'Ask: "What helps when we feel like this?"\nEncourage children to suggest calming or help-seeking ideas.',
        duration: 5,
      },
    ],
    senDifferentiation: [
      'Use visual emotion cards',
      'Offer limited choices',
      'Model emotion words and short phrases',
    ],
    assessmentOpportunities: [
      'Can the child name emotions?',
      'Can they match feelings to situations?',
    ],
    access: 'paid',
  },
  {
    id: 'lesson-6',
    number: 6,
    title: 'Cobie’s Big Feelings',
    subtitle: 'Emotional Regulation',
    focus: 'Emotional Regulation',
    theme: 'Understanding big feelings and calming the body',
    color: '#64B5F6',
    icon: 'water',
    ageRange: 'KS1',
    duration: '25-30 min',
    objectives: [
      'Understand body reactions to feelings',
      'Learn calming strategies',
    ],
    materials: ['Breathing visual'],
    materialsDetailed: [
      { label: 'Breathing Poster', printableId: 'p-3', printableLabel: 'Breathing Poster' },
    ],
    steps: [
      {
        title: 'Story Connection',
        instruction: 'Read the page where Cobie is calming down (e.g. breathing, slowing body).\nAsk: "What is Cobie doing to feel calm?"\nAsk: "What helps you feel calm?"',
        duration: 5,
      },
      {
        title: 'Body Talk',
        instruction: 'Discuss how bodies can feel when upset (tight tummy, fast heart, hot face).',
        duration: 6,
      },
      {
        title: 'Calm Breathing',
        instruction: 'Practise breathing slowly together using the breathing visual.',
        duration: 10,
      },
      {
        title: 'Reflect Together',
        instruction: 'Ask: "How does your body feel now?"\nReinforce that breathing can help us feel calmer.',
        duration: 5,
      },
    ],
    senDifferentiation: [
      'Model breathing visually',
      'Keep instructions simple',
      'Offer a quiet space during discussions',
    ],
    assessmentOpportunities: [],
    access: 'paid',
  },
  {
    id: 'lesson-7',
    number: 7,
    title: 'Cobie’s Worry Box',
    subtitle: 'Worry & Reassurance',
    focus: 'Managing Worries',
    theme: 'Naming worries and knowing who can help',
    color: '#FFD54F',
    icon: 'cube',
    ageRange: 'KS1',
    duration: '25-30 min',
    objectives: [
      'Identify what a worry is',
      'Share worries safely through drawing or talking',
      'Know trusted adults who can help',
    ],
    materials: ['Paper', 'Crayons/pencils', 'A small box or envelope'],
    materialsDetailed: [
      { label: 'Paper' },
      { label: 'Crayons/pencils' },
      { label: 'A small box or envelope (Worry Box)' },
    ],
    steps: [
      {
        title: 'Story Connection',
        instruction: 'Read the page where Cobie worries.\nAsk: "What is Cobie worried about? How can we tell?"',
        duration: 5,
      },
      {
        title: 'Worry Box',
        instruction: 'Children draw (or write) a worry and place it into the Worry Box.\nRemind: they can choose not to share.',
        duration: 10,
      },
      {
        title: 'Who Helps?',
        instruction: 'Talk about who can help with worries (teacher, family, trusted adult).\nPractise: "I need help with my worry."',
        duration: 8,
      },
      {
        title: 'Reassurance Close',
        instruction: 'End with a calming routine (breathing, stretch) and a reassurance message: "Worries can get smaller when we share them safely."',
        duration: 5,
      },
    ],
    senDifferentiation: [
      'Allow drawing instead of writing',
      'Use visual prompts',
      'Offer 1:1 support for sharing',
    ],
    assessmentOpportunities: [
      'Can the child identify a trusted adult?',
      'Can they use simple help-seeking language?',
    ],
    access: 'paid',
  },
  {
    id: 'lesson-8',
    number: 8,
    title: 'Cobie’s Kind Garden',
    subtitle: 'Empathy & Kindness',
    focus: 'Empathy',
    theme: 'Helping others and showing kindness',
    color: '#BA68C8',
    icon: 'heart',
    ageRange: 'KS1',
    duration: '25-30 min',
    objectives: [
      'Understand kindness',
      'Practise helping others',
    ],
    materials: ['Kindness cards'],
    materialsDetailed: [
      { label: 'Kindness Cards', printableId: 'p-6', printableLabel: 'Kindness Cards' },
    ],
    steps: [
      {
        title: 'Story Connection',
        instruction: 'Read the page where Cobie is helped by friends (e.g. kind words, staying close).\nAsk: "What kind things did they do?"',
        duration: 5,
      },
      {
        title: 'Role Play',
        instruction: 'Act out helping a friend using kindness scenarios.\nModel gentle words and actions.',
        duration: 12,
      },
      {
        title: 'Reflection',
        instruction: 'Plan one kind action for today.\nChildren share their idea (or choose from cards).',
        duration: 6,
      },
      {
        title: 'Kindness Close',
        instruction: 'Reinforce: "Kind actions help others feel better."\nAsk: "What kind thing will you try today?"',
        duration: 5,
      },
    ],
    senDifferentiation: [
      'Provide simple scripts',
      'Allow observation',
      'Offer visual choice cards for kind actions',
    ],
    assessmentOpportunities: [
      'Can the child demonstrate kindness?',
      'Do they use kind words or helping actions?',
    ],
    access: 'paid',
  },
];
