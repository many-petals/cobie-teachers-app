// EYFS Development Matters 2021 - PSED milestones
// KS1 PSHE National Curriculum milestones
// Aligned with Cobie the Cactus story themes

export interface Milestone {
  id: string;
  label: string;
  shortLabel: string; // For compact views
  description: string; // Child-friendly description for teachers
}

export interface MilestoneArea {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  color: string;
  bgColor: string;
  ageGroup: 'EYFS' | 'KS1' | 'Both';
  source: string; // Curriculum reference
  milestones: Milestone[];
}

export const RATING_LABELS = [
  { value: 1, label: 'Emerging', shortLabel: 'E', color: '#FF8A65', bgColor: '#FBE9E7', description: 'Just beginning to show awareness' },
  { value: 2, label: 'Developing', shortLabel: 'D', color: '#FFB74D', bgColor: '#FFF3E0', description: 'Some evidence with support' },
  { value: 3, label: 'Secure', shortLabel: 'S', color: '#81C784', bgColor: '#E8F5E9', description: 'Consistent and independent' },
  { value: 4, label: 'Exceeding', shortLabel: 'Ex', color: '#4FC3F7', bgColor: '#E1F5FE', description: 'Beyond age-related expectations' },
];

export const TERMS = ['Autumn', 'Spring', 'Summer'] as const;

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();
  // Academic year starts in September
  if (month >= 8) { // Sept onwards
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}

export function getCurrentTerm(): string {
  const month = new Date().getMonth(); // 0-indexed: Jan=0, Dec=11
  if (month >= 8 && month <= 11) return 'Autumn'; // Sept-Dec
  if (month >= 0 && month <= 3) return 'Spring'; // Jan-Apr
  return 'Summer'; // May-Aug
}


export const MILESTONE_AREAS: MilestoneArea[] = [
  {
    id: 'self-regulation',
    title: 'Self-Regulation',
    shortTitle: 'Self-Reg',
    icon: 'shield-checkmark',
    color: '#1B6B93',
    bgColor: '#E1F5FE',
    ageGroup: 'Both',
    source: 'EYFS PSED / KS1 PSHE',
    milestones: [
      {
        id: 'sr-1',
        label: 'Shows awareness of own feelings',
        shortLabel: 'Knows feelings',
        description: 'Can identify when they feel happy, sad, angry, or worried',
      },
      {
        id: 'sr-2',
        label: 'Uses a calming strategy when upset',
        shortLabel: 'Calming strategy',
        description: 'Can use breathing, counting, or a quiet space to self-regulate',
      },
      {
        id: 'sr-3',
        label: 'Waits for a turn and manages impulses',
        shortLabel: 'Turn-taking',
        description: 'Can wait, share, and manage the urge to act immediately',
      },
      {
        id: 'sr-4',
        label: 'Adapts behaviour to different situations',
        shortLabel: 'Adapts behaviour',
        description: 'Understands that different settings need different behaviour',
      },
      {
        id: 'sr-5',
        label: 'Talks about feelings using words',
        shortLabel: 'Expresses feelings',
        description: 'Uses feeling words to describe emotional states to adults or peers',
      },
    ],
  },
  {
    id: 'managing-self',
    title: 'Managing Self',
    shortTitle: 'Managing',
    icon: 'person-circle',
    color: '#7BC67E',
    bgColor: '#E8F5E9',
    ageGroup: 'Both',
    source: 'EYFS PSED / KS1 PSHE',
    milestones: [
      {
        id: 'ms-1',
        label: 'Shows confidence to try new activities',
        shortLabel: 'Tries new things',
        description: 'Willing to have a go at unfamiliar tasks or activities',
      },
      {
        id: 'ms-2',
        label: 'Explains reasons for rules',
        shortLabel: 'Understands rules',
        description: 'Can say why we have rules and follows them independently',
      },
      {
        id: 'ms-3',
        label: 'Manages personal needs independently',
        shortLabel: 'Independence',
        description: 'Can manage coat, bag, toileting, and snack time with minimal help',
      },
      {
        id: 'ms-4',
        label: 'Shows resilience when things go wrong',
        shortLabel: 'Resilience',
        description: 'Keeps trying and does not give up easily when facing challenges',
      },
    ],
  },
  {
    id: 'relationships',
    title: 'Building Relationships',
    shortTitle: 'Relationships',
    icon: 'people',
    color: '#F48FB1',
    bgColor: '#FCE4EC',
    ageGroup: 'Both',
    source: 'EYFS PSED / KS1 PSHE',
    milestones: [
      {
        id: 'br-1',
        label: 'Plays cooperatively with others',
        shortLabel: 'Cooperative play',
        description: 'Can share, take turns, and work together in play and activities',
      },
      {
        id: 'br-2',
        label: 'Shows sensitivity to others\' needs',
        shortLabel: 'Shows empathy',
        description: 'Notices when someone is upset and responds with kindness',
      },
      {
        id: 'br-3',
        label: 'Forms positive friendships',
        shortLabel: 'Makes friends',
        description: 'Builds and maintains friendships with peers',
      },
      {
        id: 'br-4',
        label: 'Resolves conflicts with support',
        shortLabel: 'Resolves conflicts',
        description: 'Can talk through disagreements and find solutions with adult help',
      },
    ],
  },
  {
    id: 'emotional-literacy',
    title: 'Emotional Literacy',
    shortTitle: 'Emotions',
    icon: 'heart',
    color: '#CE93D8',
    bgColor: '#F3E5F5',
    ageGroup: 'Both',
    source: 'KS1 PSHE / Cobie Curriculum',
    milestones: [
      {
        id: 'el-1',
        label: 'Names a range of emotions correctly',
        shortLabel: 'Names emotions',
        description: 'Can identify and name at least 6 different emotions',
      },
      {
        id: 'el-2',
        label: 'Recognises emotions in others',
        shortLabel: 'Reads others',
        description: 'Can tell how someone else might be feeling from facial expressions or body language',
      },
      {
        id: 'el-3',
        label: 'Understands that feelings can change',
        shortLabel: 'Feelings change',
        description: 'Knows that feelings are temporary and can shift throughout the day',
      },
      {
        id: 'el-4',
        label: 'Links feelings to situations',
        shortLabel: 'Cause & effect',
        description: 'Can explain why they or someone else might feel a certain way',
      },
    ],
  },
  {
    id: 'sensory-awareness',
    title: 'Sensory Awareness',
    shortTitle: 'Sensory',
    icon: 'eye',
    color: '#FF8A65',
    bgColor: '#FBE9E7',
    ageGroup: 'Both',
    source: 'SEND Code of Practice / Cobie Curriculum',
    milestones: [
      {
        id: 'sa-1',
        label: 'Communicates sensory preferences',
        shortLabel: 'Sensory prefs',
        description: 'Can say or show what they find too loud, bright, or uncomfortable',
      },
      {
        id: 'sa-2',
        label: 'Uses sensory tools when needed',
        shortLabel: 'Uses tools',
        description: 'Independently accesses ear defenders, fidget tools, or quiet space',
      },
      {
        id: 'sa-3',
        label: 'Tolerates a range of sensory experiences',
        shortLabel: 'Sensory tolerance',
        description: 'Can manage different textures, sounds, and environments with support',
      },
      {
        id: 'sa-4',
        label: 'Recognises sensory overload signs',
        shortLabel: 'Knows overload',
        description: 'Shows awareness of when they or others are becoming overwhelmed',
      },
    ],
  },
  {
    id: 'inclusion-kindness',
    title: 'Inclusion & Kindness',
    shortTitle: 'Inclusion',
    icon: 'hand-left',
    color: '#FFD54F',
    bgColor: '#FFF8E1',
    ageGroup: 'Both',
    source: 'KS1 PSHE / Cobie Curriculum',
    milestones: [
      {
        id: 'ik-1',
        label: 'Accepts differences in others',
        shortLabel: 'Accepts difference',
        description: 'Shows respect for people who look, act, or communicate differently',
      },
      {
        id: 'ik-2',
        label: 'Includes others in play and activities',
        shortLabel: 'Includes others',
        description: 'Invites or welcomes children who are alone or new to join in',
      },
      {
        id: 'ik-3',
        label: 'Shows acts of kindness unprompted',
        shortLabel: 'Spontaneous kindness',
        description: 'Does kind things for others without being asked by an adult',
      },
      {
        id: 'ik-4',
        label: 'Understands fairness and equal treatment',
        shortLabel: 'Understands fairness',
        description: 'Can talk about what is fair and unfair, kind and unkind',
      },
    ],
  },
];

// Helper to get all milestones for an age group
export function getMilestonesForAgeGroup(ageGroup: 'EYFS' | 'KS1'): MilestoneArea[] {
  return MILESTONE_AREAS.filter(a => a.ageGroup === ageGroup || a.ageGroup === 'Both');
}

// Helper to get total milestone count
export function getTotalMilestoneCount(): number {
  return MILESTONE_AREAS.reduce((sum, area) => sum + area.milestones.length, 0);
}

// Helper to calculate progress percentage
export function calculateProgress(ratings: { milestone_id: string; rating: number }[], ageGroup: 'EYFS' | 'KS1'): number {
  const areas = getMilestonesForAgeGroup(ageGroup);
  const totalMilestones = areas.reduce((sum, a) => sum + a.milestones.length, 0);
  if (totalMilestones === 0) return 0;
  
  const totalScore = ratings.reduce((sum, r) => sum + r.rating, 0);
  const maxScore = totalMilestones * 4;
  return Math.round((totalScore / maxScore) * 100);
}

// Helper to get area average rating
export function getAreaAverage(ratings: { milestone_id: string; rating: number }[], areaId: string): number {
  const area = MILESTONE_AREAS.find(a => a.id === areaId);
  if (!area) return 0;
  
  const areaRatings = ratings.filter(r => 
    area.milestones.some(m => m.id === r.milestone_id)
  );
  
  if (areaRatings.length === 0) return 0;
  return areaRatings.reduce((sum, r) => sum + r.rating, 0) / areaRatings.length;
}
