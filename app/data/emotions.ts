export interface Emotion {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  childFriendly: string;
  calmingStrategy: string;
  bodyClue: string;
}

export const EMOTIONS: Emotion[] = [
  {
    id: 'happy',
    name: 'Happy',
    icon: 'happy-outline',
    color: '#FFD54F',
    bgColor: '#FFF8E1',
    description: 'Feeling good, joyful, and content.',
    childFriendly: 'When you feel warm and smiley inside, like when you play your favourite game!',
    calmingStrategy: 'Share your happiness! Tell a friend what made you smile today.',
    bodyClue: 'Smiling face, relaxed body, bouncy feeling',
  },
  {
    id: 'sad',
    name: 'Sad',
    icon: 'sad-outline',
    color: '#64B5F6',
    bgColor: '#E3F2FD',
    description: 'Feeling down, unhappy, or tearful.',
    childFriendly: 'When you feel heavy inside, like a rain cloud is sitting on you.',
    calmingStrategy: 'It\'s OK to feel sad. Find a cosy spot, take deep breaths, or talk to a grown-up.',
    bodyClue: 'Droopy face, heavy body, might want to cry',
  },
  {
    id: 'calm',
    name: 'Calm',
    icon: 'leaf-outline',
    color: '#81C784',
    bgColor: '#E8F5E9',
    description: 'Feeling peaceful, relaxed, and steady.',
    childFriendly: 'When your body feels still and quiet, like Cobie sitting in his garden.',
    calmingStrategy: 'Enjoy this feeling! Notice how your body feels when it\'s calm and peaceful.',
    bodyClue: 'Relaxed muscles, slow breathing, quiet mind',
  },
  {
    id: 'worried',
    name: 'Worried',
    icon: 'alert-circle-outline',
    color: '#FFB74D',
    bgColor: '#FFF3E0',
    description: 'Feeling anxious, nervous, or unsure.',
    childFriendly: 'When your tummy feels fluttery, like butterflies are inside you.',
    calmingStrategy: 'Try Cobie\'s calm breathing: breathe in slowly, breathe out slowly. Tell a grown-up how you feel.',
    bodyClue: 'Butterflies in tummy, fidgety hands, tight shoulders',
  },
  {
    id: 'angry',
    name: 'Angry',
    icon: 'flame-outline',
    color: '#EF5350',
    bgColor: '#FFEBEE',
    description: 'Feeling frustrated, cross, or upset.',
    childFriendly: 'When you feel hot and fizzy inside, like a shaken-up bottle.',
    calmingStrategy: 'Go to the Calm Corner. Squeeze a cushion, stamp your feet gently, then take 3 deep breaths.',
    bodyClue: 'Hot face, clenched fists, loud voice',
  },
  {
    id: 'scared',
    name: 'Scared',
    icon: 'eye-off-outline',
    color: '#9575CD',
    bgColor: '#EDE7F6',
    description: 'Feeling frightened or afraid.',
    childFriendly: 'When you want to hide or run away because something feels too big or too much.',
    calmingStrategy: 'Find a safe person. Hold their hand. Remember: you are safe. Cobie is brave, and so are you!',
    bodyClue: 'Wide eyes, fast heartbeat, want to hide',
  },
  {
    id: 'excited',
    name: 'Excited',
    icon: 'star-outline',
    color: '#FF7043',
    bgColor: '#FBE9E7',
    description: 'Feeling thrilled, eager, and full of energy.',
    childFriendly: 'When you feel sparkly and jumpy inside, like it\'s your birthday!',
    calmingStrategy: 'Excitement is wonderful! If it feels too big, try slow breathing to keep your body steady.',
    bodyClue: 'Big smile, wiggly body, fast talking',
  },
  {
    id: 'overwhelmed',
    name: 'Overwhelmed',
    icon: 'thunderstorm-outline',
    color: '#78909C',
    bgColor: '#ECEFF1',
    description: 'When everything feels too much at once.',
    childFriendly: 'When there\'s too much noise, too many people, or too many things happening — like Cobie when it got too loud.',
    calmingStrategy: 'Find a quiet space. Cover your ears if you need to. Ask for help. It\'s OK to take a break.',
    bodyClue: 'Covering ears, wanting to leave, feeling frozen',
  },
];

export const CALMING_ACTIVITIES = [
  { id: 'breathing', name: 'Cobie\'s Calm Breathing', icon: 'leaf', duration: '2 min', description: 'Breathe in as the cactus grows tall... breathe out as it softens.' },
  { id: 'counting', name: 'Pebble Counting', icon: 'ellipse', duration: '3 min', description: 'Count 5 pebbles slowly, feeling each one in your hand.' },
  { id: 'stretching', name: 'Gentle Stretching', icon: 'body', duration: '3 min', description: 'Stretch up tall like a cactus, then curl up small like a seed.' },
  { id: 'listening', name: 'Quiet Listening', icon: 'ear', duration: '2 min', description: 'Close your eyes. What can you hear? Count 3 different sounds.' },
  { id: 'drawing', name: 'Calm Doodling', icon: 'brush', duration: '5 min', description: 'Draw slow, gentle spirals or patterns on paper.' },
  { id: 'squeezing', name: 'Squeeze and Release', icon: 'hand-left', duration: '1 min', description: 'Squeeze your hands tight... then let go. Feel the difference.' },
];

export const GROUNDING_PROMPTS = [
  'Name 5 things you can see right now.',
  'Touch something soft. How does it feel?',
  'Listen carefully. What\'s the quietest sound you can hear?',
  'Take 3 slow breaths. In through your nose, out through your mouth.',
  'Press your feet into the floor. Feel how strong and steady you are.',
  'Hold something cool in your hands. Notice the temperature.',
  'Look out the window. What colours can you see?',
  'Hum your favourite song very quietly.',
];

export const REGULATION_TOOLS = [
  { id: 'fidget', name: 'Fidget Tool', icon: 'hand-left', description: 'A small, quiet object to squeeze or manipulate.' },
  { id: 'timer', name: 'Visual Timer', icon: 'timer', description: 'Shows how long until the next activity.' },
  { id: 'ear-defenders', name: 'Ear Defenders', icon: 'ear', description: 'Reduces noise for sensitive listeners.' },
  { id: 'weighted-item', name: 'Weighted Lap Pad', icon: 'square', description: 'Provides calming pressure on the lap.' },
  { id: 'visual-schedule', name: 'Visual Schedule', icon: 'list', description: 'Shows what\'s happening next with pictures.' },
  { id: 'calm-corner', name: 'Calm Corner Access', icon: 'home', description: 'A quiet space to regulate emotions.' },
];
