import { LayoutDashboard, Users, Settings as SettingsIcon, BookText, FileText } from 'lucide-react';

export function Sidebar({ currentTab, onTabChange, onOpenReport }: { currentTab: string, onTabChange: (tab: string) => void, onOpenReport: () => void }) {
    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10 select-none">
            <div className="p-4 mt-2">
                <nav className="space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentTab === 'Dashboard'} onClick={() => onTabChange('Dashboard')} />
                    <SidebarItem icon={Users} label="Customers" active={currentTab === 'Customers'} onClick={() => onTabChange('Customers')} />
                    <SidebarItem icon={BookText} label="Day Book" active={currentTab === 'Daybook'} onClick={() => onTabChange('Daybook')} />
                    <SidebarItem icon={FileText} label="Generate Report" active={false} onClick={onOpenReport} />
                </nav>
            </div>
            <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
                <nav className="space-y-1">
                    <SidebarItem icon={SettingsIcon} label="Settings" active={currentTab === 'Settings'} onClick={() => onTabChange('Settings')} />
                </nav>
                <div className="mt-4 flex justify-center">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wider rounded-full uppercase">
                        Client Build v1.0.0 🚀
                    </span>
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm font-medium ${active
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
        >
            <Icon size={18} className={active ? "text-emerald-600" : "text-slate-400"} />
            {label}
        </button>
    );
}
