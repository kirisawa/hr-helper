
import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  LayoutGrid, 
  Sparkles, 
  Settings2,
  ChevronRight,
  Heart
} from 'lucide-react';
import ParticipantManager from './components/ParticipantManager';
import LuckyDraw from './components/LuckyDraw';
import GroupingTool from './components/GroupingTool';
import ImageStudio from './components/ImageStudio';
import { Participant, AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LIST);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const NavItem = ({ tab, icon: Icon, label }: { tab: AppTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 group ${
        activeTab === tab 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-white hover:text-indigo-600'
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab ? 'text-white' : 'text-slate-400'}`} />
      <span className="font-bold tracking-wide">{label}</span>
      {activeTab === tab && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-100 shadow-lg">
              <Users className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">HR PRO <span className="text-indigo-600">SUITE</span></h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Employee Experience Tools</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-700">活動小助手</span>
              <span className="text-xs text-slate-400">當前線上 | 穩定運行</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center">
               <Settings2 className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex flex-col gap-2">
          <NavItem tab={AppTab.LIST} icon={Users} label="名單管理" />
          <NavItem tab={AppTab.LUCKY_DRAW} icon={Trophy} label="幸運抽獎" />
          <NavItem tab={AppTab.GROUPING} icon={LayoutGrid} label="自動分組" />
          <div className="my-4 border-t border-slate-200/60"></div>
          <NavItem tab={AppTab.IMAGE_STUDIO} icon={Sparkles} label="活動照片魔術" />
          
          <div className="mt-auto p-4 bg-indigo-50 rounded-2xl border border-indigo-100 hidden md:block">
            <p className="text-xs font-bold text-indigo-800 mb-1">小提示</p>
            <p className="text-xs text-indigo-600 leading-relaxed">
              匯入名單後，即可開始抽獎或分組。AI 魔術師可以幫你快速美化活動照片！
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 animate-fadeIn">
          {activeTab === AppTab.LIST && (
            <ParticipantManager 
              participants={participants} 
              onUpdate={setParticipants} 
            />
          )}
          {activeTab === AppTab.LUCKY_DRAW && (
            <LuckyDraw participants={participants} />
          )}
          {activeTab === AppTab.GROUPING && (
            <GroupingTool participants={participants} />
          )}
          {activeTab === AppTab.IMAGE_STUDIO && (
            <ImageStudio />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-current" /> for HR Teams
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">隱私權政策</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">使用條款</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">幫助中心</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
