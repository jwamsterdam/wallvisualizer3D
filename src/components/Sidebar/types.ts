export type SidebarTab = 'composer' | 'simulator' | 'settings';

export type SidebarTabItem = {
  id: SidebarTab;
  label: string;
  icon?: 'settings';
};

export const sidebarTabs: SidebarTabItem[] = [
  { id: 'composer', label: 'Composer' },
  { id: 'simulator', label: 'Simulator' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];
