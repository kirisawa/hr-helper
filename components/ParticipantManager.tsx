
import React, { useState, useMemo } from 'react';
import { Upload, List, UserPlus, Trash2, FileSpreadsheet, Sparkles, UserCheck, AlertTriangle, Download } from 'lucide-react';
import { Participant } from '../types';

interface Props {
  participants: Participant[];
  onUpdate: (participants: Participant[]) => void;
}

const SAMPLE_NAMES = [
  "王小明", "李大華", "張美美", "陳志明", "林雅婷",
  "黃國華", "吳淑珍", "周杰倫", "蔡依林", "張學友",
  "王小明", "李大華" // 故意放入重複项以便示範
];

const ParticipantManager: React.FC<Props> = ({ participants, onUpdate }) => {
  const [inputText, setInputText] = useState('');

  // 檢測重複姓名的邏輯
  const nameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach(p => {
      counts[p.name] = (counts[p.name] || 0) + 1;
    });
    return counts;
  }, [participants]);

  const hasDuplicates = useMemo(() => {
    return (Object.values(nameCounts) as number[]).some(count => count > 1);
  }, [nameCounts]);

  const handleBulkAdd = () => {
    const names = inputText.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
    const newParticipants: Participant[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
    }));
    onUpdate([...participants, ...newParticipants]);
    setInputText('');
  };

  const handleAddSample = () => {
    const newParticipants: Participant[] = SAMPLE_NAMES.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
    }));
    onUpdate([...participants, ...newParticipants]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n');
      const newParticipants: Participant[] = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(name => ({
          id: Math.random().toString(36).substr(2, 9),
          name: name.replace(/^"(.*)"$/, '$1').split(',')[0],
        }));
      onUpdate([...participants, ...newParticipants]);
    };
    reader.readAsText(file);
  };

  const removeParticipant = (id: string) => {
    onUpdate(participants.filter(p => p.id !== id));
  };

  const removeDuplicates = () => {
    const seenNames = new Set<string>();
    const uniqueParticipants = participants.filter(p => {
      if (seenNames.has(p.name)) {
        return false;
      }
      seenNames.add(p.name);
      return true;
    });
    onUpdate(uniqueParticipants);
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearAll = () => {
    if (showClearConfirm) {
      onUpdate([]);
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000); // Reset after 3 seconds
    }
  };

  const downloadCSV = () => {
    if (participants.length === 0) {
      alert("名單為空，無法匯出！");
      return;
    }

    try {
      const header = "姓名,編號\n";
      const csvContent = participants.map(p => `${p.name},${p.id}`).join("\n");

      // Use BOM for Excel compatibility with UTF-8
      const blob = new Blob(["\ufeff" + header + csvContent], { type: 'text/csv;charset=utf-8' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Date format for filename
      const date = new Date();
      const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      link.download = `Participant_List_${dateStr}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("匯出失敗，請檢查瀏覽器設定");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-500" />
            名單匯入
          </h2>
          <button
            onClick={handleAddSample}
            className="text-sm px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            產生範例名單
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">批次貼上姓名 (每行一個或逗號隔開)</label>
            <textarea
              className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="例如：&#10;王小明&#10;李大華,張美美"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={handleBulkAdd}
              disabled={!inputText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 rounded-xl transition-colors"
            >
              加入名單
            </button>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 font-medium">上傳 CSV / TXT 檔案</p>
            <p className="text-xs text-slate-400 mt-1">僅讀取第一欄作為姓名</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-slate-500" />
            <span className="font-semibold text-slate-700">參與者名單 ({participants.length} 人)</span>
          </div>
          <div className="flex items-center gap-3">
            {participants.length > 0 && (
              <button
                onClick={downloadCSV}
                className="text-xs text-slate-600 hover:text-indigo-600 font-bold flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" /> 匯出 CSV
              </button>
            )}
            {hasDuplicates && (
              <button
                onClick={removeDuplicates}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100"
              >
                <UserCheck className="w-3.5 h-3.5" /> 移除重複姓名
              </button>
            )}
            <button
              onClick={clearAll}
              className={`text-xs font-medium flex items-center gap-1 transition-all px-2 py-1 rounded-lg ${showClearConfirm
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                }`}
            >
              <Trash2 className="w-4 h-4" />
              {showClearConfirm ? '確定清除？' : '全部清除'}
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {participants.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              目前尚無名單，請點擊右上方「產生範例名單」或自行匯入。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
              {participants.map((p) => {
                const isDuplicate = nameCounts[p.name] > 1;
                return (
                  <div
                    key={p.id}
                    className={`flex justify-between items-center p-3 rounded-lg group transition-colors ${isDuplicate
                      ? 'bg-amber-50 border border-amber-100 text-amber-800'
                      : 'bg-slate-50 hover:bg-indigo-50 border border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      {isDuplicate && (
                        <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          重複
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantManager;
