export interface ParentLetter {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  pages: number;
  category: 'letter' | 'sheet' | 'questionnaire' | 'report';
}

export const PARENT_LETTERS: ParentLetter[] = [
  {
    id: 'pl-1',
    title: 'Programme Introduction Letter',
    subtitle: 'Welcome to the Cobie Programme',
    description:
      'A warm, professional letter introducing parents and carers to the Cobie emotional literacy programme. Explains what the programme covers, why it matters, and how families can support learning at home.',
    icon: 'mail-open',
    color: '#1B6B93',
    pages: 1,
    category: 'letter',
  },
  {
    id: 'pl-2',
    title: 'Home Activities Sheet',
    subtitle: 'Reinforcing Emotional Literacy at Home',
    description:
      'A practical sheet with age-appropriate activities parents can do at home to reinforce emotional literacy, sensory awareness, and calming strategies taught in school.',
    icon: 'home',
    color: '#81C784',
    pages: 2,
    category: 'sheet',
  },
  {
    id: 'pl-3',
    title: 'Sensory Preferences Questionnaire',
    subtitle: 'Help Us Understand Your Child',
    description:
      'A parent-friendly questionnaire to gather information about a child\'s sensory preferences, sensitivities, and comfort levels across sight, sound, touch, taste, and smell.',
    icon: 'clipboard',
    color: '#FF8A65',
    pages: 2,
    category: 'questionnaire',
  },
  {
    id: 'pl-4',
    title: 'Progress Report Template',
    subtitle: 'Emotional Literacy Progress Update',
    description:
      'A structured report template to share a child\'s emotional literacy progress with parents. Covers self-regulation, empathy, communication, and sensory awareness milestones.',
    icon: 'trending-up',
    color: '#B39DDB',
    pages: 2,
    category: 'report',
  },
];
