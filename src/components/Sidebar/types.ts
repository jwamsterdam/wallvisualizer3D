export type SidebarTab = 'composer' | 'simulator' | 'settings';

export type SidebarTabItem = {
  id: SidebarTab;
  label: string;
  icon?: 'settings';
};

export const sidebarTabs: SidebarTabItem[] = [
  { id: 'composer', label: 'Bouwen' },
  { id: 'simulator', label: 'Luisteren' },
  { id: 'settings', label: 'Instellingen', icon: 'settings' },
];
