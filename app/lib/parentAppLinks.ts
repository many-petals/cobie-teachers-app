import { Linking } from 'react-native';

export type ParentAppSection = 'home' | 'tracker';

const PARENT_APP_BASE_URL = 'https://cobie-parent-app-nns9.vercel.app/';

export const buildParentAppUrl = (section: ParentAppSection = 'home'): string => {
  const url = new URL(PARENT_APP_BASE_URL);
  url.searchParams.set('source', 'cobie-teachers-app');
  url.searchParams.set('tab', section);
  url.searchParams.set('section', section);
  url.hash = section;
  return url.toString();
};

export const openParentApp = async (section: ParentAppSection = 'home'): Promise<void> => {
  const url = buildParentAppUrl(section);
  await Linking.openURL(url);
};
