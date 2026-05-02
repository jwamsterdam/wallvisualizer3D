export type SidebarTab = 'composer' | 'simulator' | 'settings';

export type SidebarTabItem = {
  id: SidebarTab;
  label: string;
  icon?: 'settings';
};

export const sidebarTabs: SidebarTabItem[] = [
  { id: 'composer', label: 'Bouw je muur' },
  { id: 'simulator', label: 'Luister naar het geluid' },
  { id: 'settings', label: 'Instellingen', icon: 'settings' },
];
