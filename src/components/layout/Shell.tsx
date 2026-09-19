import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';

export function Shell({
    children,
    currentTab,
    onTabChange
}: {
    children: React.ReactNode;
    currentTab: string;
    onTabChange: (tab: string) => void;
}) {
    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
            <TitleBar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar currentTab={currentTab} onTabChange={onTabChange} />
                <main className="flex-1 overflow-y-auto w-full h-full p-8 bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
