
import React, { useState } from 'react';
import { Users, LayoutGrid, Shuffle, Download } from 'lucide-react';
import { Participant, GroupResult } from '../types';

interface Props {
  participants: Participant[];
}

const GroupingTool: React.FC<Props> = ({ participants }) => {
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<GroupResult[]>([]);

  const handleGroup = () => {
    if (participants.length === 0) return;
    
    // Shuffle
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newGroups: GroupResult[] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push({
        groupName: `第 ${Math.floor(i / groupSize) + 1} 組`,
        members: shuffled.slice(i, i + groupSize),
      });
    }
    
    setGroups(newGroups);
  };

  const downloadGroupingCSV = () => {
    if (groups.length === 0) return;
    
    const header = "組別,姓名\n";
    const csvContent = groups.flatMap(group => 
      group.members.map(member => `${group.groupName},${member.name}`)
    ).join("\n");
    
    const blob = new Blob(["\ufeff" + header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `分組結果_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">分組人數</label>
            <input
              type="number"
              min="2"
              max={participants.length}
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
              className="w-24 px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>
          <button
            onClick={handleGroup}
            disabled={participants.length < 2}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            <Shuffle className="w-5 h-5" />
            自動分組
          </button>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm text-slate-500 hidden sm:block">
            總人數：<span className="font-bold text-slate-800">{participants.length}</span> | 
            預計組數：<span className="font-bold text-slate-800">{Math.ceil(participants.length / groupSize)}</span>
          </div>
          {groups.length > 0 && (
            <button
              onClick={downloadGroupingCSV}
              className="px-4 py-2 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              匯出分組結果
            </button>
          )}
        </div>
      </div>

      {groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="bg-indigo-600 p-3 flex justify-between items-center">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 opacity-70" />
                  {group.groupName}
                </h4>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {group.members.length} 人
                </span>
              </div>
              <div className="p-4 space-y-2">
                {group.members.map((member, mIdx) => (
                  <div key={mIdx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                      {mIdx + 1}
                    </div>
                    <span className="text-slate-700 text-sm font-medium">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length === 0 && participants.length > 0 && (
        <div className="py-32 text-center">
          <LayoutGrid className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">設定人數並點擊「自動分組」開始</p>
        </div>
      )}
    </div>
  );
};

export default GroupingTool;
