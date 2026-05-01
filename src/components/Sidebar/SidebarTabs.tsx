import { GearIcon } from './GearIcon';
import { sidebarTabs, type SidebarTab } from './types';

type SidebarTabsProps = {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
};

export function SidebarTabs({ activeTab, onTabChange }: SidebarTabsProps) {
  return (
    <div className="sidebar-tabs" role="tablist" aria-label="Zijpaneel">
      {sidebarTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-label={tab.icon === 'settings' ? tab.label : undefined}
          title={tab.icon === 'settings' ? tab.label : undefined}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon === 'settings' ? <GearIcon /> : tab.label}
        </button>
      ))}
    </div>
  );
}
