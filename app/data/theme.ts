export const COLORS = {
  primary: '#1B6B93',
  primaryLight: '#2A8FBF',
  primaryDark: '#145272',
  secondary: '#7BC67E',
  secondaryLight: '#A8DCA9',
  accent: '#F5D76E',
  accentOrange: '#F4A460',
  purple: '#B39DDB',
  purpleLight: '#D1C4E9',
  pink: '#F48FB1',
  
  // Backgrounds
  bgLight: '#F0F7FF',
  bgWarm: '#FFF8E7',
  bgGreen: '#E8F5E9',
  bgPurple: '#F3E5F5',
  bgPink: '#FCE4EC',
  bgOrange: '#FFF3E0',
  
  // Neutrals
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#E8EDF2',
  mediumGray: '#B0BEC5',
  darkGray: '#607D8B',
  text: '#2C3E50',
  textLight: '#546E7A',
  textMuted: '#90A4AE',
  
  // Status
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#42A5F5',
  
  // Lesson colors
  lesson1: '#4FC3F7',
  lesson2: '#81C784',
  lesson3: '#FFB74D',
  lesson4: '#CE93D8',
  
  // Activity type colors
  sensory: '#FF8A65',
  emotional: '#F48FB1',
  communication: '#4FC3F7',
  creative: '#AED581',
  movement: '#FFD54F',
  reflection: '#B39DDB',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  hero: 36,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const ICON_CATEGORIES = {
  sensory: 'eye',
  emotional: 'heart',
  communication: 'chatbubbles',
  creative: 'color-palette',
  movement: 'body',
  reflection: 'leaf',
} as const;
