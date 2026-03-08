export interface Activity {
  id: string;
  number: number;
  title: string;
  type: string;
  linkedTo: string;
  purpose: string;
  color: string;
  icon: string;
  skillType: 'sensory' | 'emotional' | 'communication' | 'creative' | 'movement' | 'reflection';
  ageRange: string;
  duration: string;
  materials: string[];
  instructions: string[];
  senAdaptations: string[];
  assessment: string[];
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'activity-1',
    number: 1,
    title: 'Build a Quiet Garden',
    type: 'Sensory / Creative',
    linkedTo: 'The peaceful garden scenes in the book',
    purpose: 'To help children explore calm, sensory-friendly play using natural materials.',
    color: '#AED581',
    icon: 'flower',
    skillType: 'sensory',
    ageRange: 'EYFS / KS1',
    duration: '15-20 min',
    materials: [
      'Leaves, twigs, stones, petals (real or craft versions)',
      'Small trays or mats',
      'Optional: sand, moss, fabric scraps',
    ],
    instructions: [
      'Show the page where the garden hushes for Cobie. Invite children to build their own "Quiet Garden" on a tray.',
      'Encourage slow movements and gentle placing of materials. Ask: "What makes your garden feel calm?"',
    ],
    senAdaptations: [
      'Provide a reduced selection of materials',
      'Offer tactile alternatives (felt leaves, foam stones)',
      'Allow parallel play',
    ],
    assessment: [
      'Does the child engage in calm, focused play?',
      'Can they identify calming elements?',
    ],
  },
  {
    id: 'activity-2',
    number: 2,
    title: 'Emotion Faces Matching',
    type: 'Emotional Literacy',
    linkedTo: 'Cobie\'s emotional journey through the story',
    purpose: 'To help children recognise and name basic emotions.',
    color: '#F48FB1',
    icon: 'happy',
    skillType: 'emotional',
    ageRange: 'EYFS / KS1',
    duration: '10-15 min',
    materials: [
      'Emotion face cards (from printables)',
      'Mirror (optional)',
      'Feeling word labels',
    ],
    instructions: [
      'Spread emotion cards face up. Name each emotion together.',
      'Children match emotion words to faces. Use mirror to practice making each face.',
      'Discuss: "When do you feel like this?"',
    ],
    senAdaptations: [
      'Use fewer emotions (start with happy, sad, calm)',
      'Provide visual-only matching (no words)',
      'Allow pointing instead of speaking',
    ],
    assessment: [
      'Can the child name basic emotions?',
      'Do they connect emotions to experiences?',
    ],
  },
  {
    id: 'activity-3',
    number: 3,
    title: 'Cobie\'s Calm Breathing',
    type: 'Self-Regulation',
    linkedTo: 'Cobie\'s quiet, steady presence',
    purpose: 'To teach children a simple breathing routine using cactus imagery.',
    color: '#81C784',
    icon: 'leaf',
    skillType: 'reflection',
    ageRange: 'EYFS / KS1',
    duration: '5-10 min',
    materials: [
      '"Cobie Breathing" visual (included in printables)',
    ],
    instructions: [
      'Show the Cobie breathing visual. Model: "Breathe in as the cactus grows tall... breathe out as it softens."',
      'Repeat 3-5 times. Ask: "How does your body feel now?"',
    ],
    senAdaptations: [
      'Use hand-over-hand guidance if appropriate',
      'Keep instructions minimal',
      'Allow children to watch first',
    ],
    assessment: [
      'Does the child attempt the breathing pattern?',
      'Do they show signs of calming?',
    ],
  },
  {
    id: 'activity-4',
    number: 4,
    title: 'Soft Sounds, Gentle Voices',
    type: 'Communication / Sensory',
    linkedTo: 'Cobie\'s sensitivity to noise',
    purpose: 'To help children explore volume and tone safely.',
    color: '#4FC3F7',
    icon: 'volume-low',
    skillType: 'communication',
    ageRange: 'EYFS / KS1',
    duration: '10-15 min',
    materials: [
      'Soft instruments',
      'Voice volume cards (whisper / quiet / talking)',
    ],
    instructions: [
      'Demonstrate whisper, quiet, and talking voices. Children practice each one.',
      'Play a "quiet orchestra" using soft instruments. End with a whisper circle: "I feel calm when..."',
    ],
    senAdaptations: [
      'Allow non-verbal participation',
      'Provide visual cues',
      'Reduce group size',
    ],
    assessment: [
      'Can the child adjust their volume?',
      'Do they recognise quiet vs loud?',
    ],
  },
  {
    id: 'activity-5',
    number: 5,
    title: 'Friendship Collage',
    type: 'Creative / Communication',
    linkedTo: 'Cobie\'s friendships with Tilly, Darcy, and Harper',
    purpose: 'To explore what makes a good friend through creative expression.',
    color: '#FFB74D',
    icon: 'people',
    skillType: 'creative',
    ageRange: 'EYFS / KS1',
    duration: '15-20 min',
    materials: [
      'Paper, glue, magazines/images',
      'Colouring materials',
      'Character templates (from printables)',
    ],
    instructions: [
      'Discuss: "What makes Cobie a good friend?" List ideas together.',
      'Children create a collage showing what friendship means to them.',
      'Share and celebrate each collage.',
    ],
    senAdaptations: [
      'Pre-cut images for easier handling',
      'Offer sticker alternatives',
      'Allow individual or paired work',
    ],
    assessment: [
      'Can the child describe friendship qualities?',
      'Do they engage in the creative process?',
    ],
  },
  {
    id: 'activity-6',
    number: 6,
    title: 'Sensory Walk',
    type: 'Movement / Sensory',
    linkedTo: 'Cobie exploring the garden',
    purpose: 'To encourage mindful movement and sensory awareness outdoors or indoors.',
    color: '#FF8A65',
    icon: 'walk',
    skillType: 'movement',
    ageRange: 'EYFS / KS1',
    duration: '15-20 min',
    materials: [
      'Outdoor space or sensory path materials',
      'Clipboard and pencil (optional)',
      'Sensory checklist (from printables)',
    ],
    instructions: [
      'Walk slowly together. Stop at intervals to notice: What can you see? Hear? Feel?',
      'Encourage quiet observation. Use the sensory checklist to record findings.',
      'Return to class and share one favourite sensory moment.',
    ],
    senAdaptations: [
      'Provide a buddy system',
      'Use visual prompt cards',
      'Allow shorter route or indoor alternative',
    ],
    assessment: [
      'Can the child identify sensory experiences?',
      'Do they engage in mindful observation?',
    ],
  },
  {
    id: 'activity-7',
    number: 7,
    title: 'Feelings Thermometer',
    type: 'Emotional Literacy / Self-Regulation',
    linkedTo: 'Understanding emotional intensity',
    purpose: 'To help children understand that feelings come in different sizes.',
    color: '#B39DDB',
    icon: 'thermometer',
    skillType: 'emotional',
    ageRange: 'EYFS / KS1',
    duration: '10-15 min',
    materials: [
      'Feelings thermometer poster (from printables)',
      'Emotion face cards',
      'Clothespin or marker',
    ],
    instructions: [
      'Introduce the thermometer: "Feelings can be small, medium, or big."',
      'Show scenarios and ask children to place the marker on the thermometer.',
      'Discuss: "What can we do when feelings get too big?"',
    ],
    senAdaptations: [
      'Use colour coding (green/yellow/red)',
      'Simplify to two levels (calm/not calm)',
      'Provide physical thermometer to manipulate',
    ],
    assessment: [
      'Can the child identify feeling intensity?',
      'Do they suggest calming strategies?',
    ],
  },
  {
    id: 'activity-8',
    number: 8,
    title: 'Cobie\'s Kindness Cards',
    type: 'Communication / Creative',
    linkedTo: 'Acts of kindness throughout the story',
    purpose: 'To encourage children to notice and celebrate kind actions.',
    color: '#F48FB1',
    icon: 'heart',
    skillType: 'communication',
    ageRange: 'EYFS / KS1',
    duration: '10-15 min',
    materials: [
      'Blank kindness cards (from printables)',
      'Colouring materials',
      'Kindness jar or display board',
    ],
    instructions: [
      'Read examples of kindness from the story.',
      'Children draw or write a kind thing they noticed or did.',
      'Add cards to the kindness jar. Read them together at the end of the week.',
    ],
    senAdaptations: [
      'Provide picture stamps for non-writers',
      'Accept verbal contributions',
      'Use symbol-supported cards',
    ],
    assessment: [
      'Can the child identify kind actions?',
      'Do they participate in celebrating kindness?',
    ],
  },
];
