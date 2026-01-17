import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, Settings, RotateCcw, Play, History, AlertCircle, Info, Sparkles, Trash2 } from 'lucide-react';
import { Participant, HistoryItem } from '../types';

interface Props {
  participants: Participant[];
  onWinnerDrawn?: (winner: Participant) => void;
}

const LuckyDraw: React.FC<Props> = ({ participants, onWinnerDrawn }) => {
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<string>('???');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [remainingList, setRemainingList] = useState<Participant[]>([]);
  /* Prize Management State */
  const [prizeName, setPrizeName] = useState('獎品 A');
  const timerRef = useRef<number | null>(null);
  const [prizes, setPrizes] = useState<string[]>(['獎品 A', '獎品 B', '獎品 C']);
  const [showPrizeManager, setShowPrizeManager] = useState(false);
  const [editingPrizeIndex, setEditingPrizeIndex] = useState<number | null>(null);
  const [tempPrizeName, setTempPrizeName] = useState('');

  // Critical: Always sync remainingList when participants change or on mount
  useEffect(() => {
    setRemainingList(participants);
  }, [participants]);

  // Set default if not set
  useEffect(() => {
    if (!prizes.includes(prizeName) && prizes.length > 0) {
      setPrizeName(prizes[0]);
    } else if (prizes.length === 0) {
      setPrizeName('');
    }
  }, [prizes, prizeName]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAddPrize = () => {
    if (tempPrizeName.trim()) {
      setPrizes([...prizes, tempPrizeName.trim()]);
      setTempPrizeName('');
    }
  };

  const handleUpdatePrize = () => {
    if (editingPrizeIndex !== null && tempPrizeName.trim()) {
      const newPrizes = [...prizes];
      newPrizes[editingPrizeIndex] = tempPrizeName.trim();
      setPrizes(newPrizes);

      // If we updated the currently selected prize, update selection too
      if (prizeName === prizes[editingPrizeIndex]) {
        setPrizeName(tempPrizeName.trim());
      }

      setEditingPrizeIndex(null);
      setTempPrizeName('');
    }
  };

  const handleDeletePrize = (index: number) => {
    const deletedPrize = prizes[index];
    const newPrizes = prizes.filter((_, i) => i !== index);
    setPrizes(newPrizes);

    // If we deleted the current prize, select the first available one
    if (prizeName === deletedPrize && newPrizes.length > 0) {
      setPrizeName(newPrizes[0]);
    } else if (newPrizes.length === 0) {
      setPrizeName('');
    }
  };

  const startEdit = (index: number) => {
    setEditingPrizeIndex(index);
    setTempPrizeName(prizes[index]);
  };

  const cancelEdit = () => {
    setEditingPrizeIndex(null);
    setTempPrizeName('');
  };

  const drawWinner = useCallback(() => {
    if (participants.length === 0) {
      alert("⚠️ 請先在『名單管理』分頁匯入人員名單！");
      return;
    }

    if (!prizeName) {
      alert("⚠️ 請先選擇或新增一個獎品！");
      return;
    }

    const pool = allowRepeat ? participants : remainingList;

    if (pool.length === 0) {
      alert("💡 所有參與者都已中過獎了！\n若要繼續，請勾選『允許重複中獎』或點擊『重置抽獎進度』。");
      return;
    }

    if (isDrawing) return;

    setIsDrawing(true);
    let counter = 0;
    const duration = 2000;
    const intervalTime = 80;
    const totalSteps = Math.floor(duration / intervalTime);

    // Fix: cast to unknown then number to satisfy TypeScript and match browser context
    timerRef.current = setInterval(() => {
      // Animation cycles through ALL participants for excitement
      const randomIndex = Math.floor(Math.random() * participants.length);
      setCurrentDisplay(participants[randomIndex]?.name || '???');
      counter++;

      if (counter >= totalSteps) {
        if (timerRef.current) clearInterval(timerRef.current);

        // Pick final winner from the valid pool
        const finalWinnerIndex = Math.floor(Math.random() * pool.length);
        const winner = pool[finalWinnerIndex];

        setCurrentDisplay(winner.name);
        setIsDrawing(false);

        const newHistoryItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          winner,
          prize: prizeName,
          timestamp: Date.now(),
        };

        setHistory(prev => [newHistoryItem, ...prev]);

        if (!allowRepeat) {
          setRemainingList(prev => prev.filter(p => p.id !== winner.id));
        }

        if (onWinnerDrawn) onWinnerDrawn(winner);
      }
    }, intervalTime) as unknown as number;
  }, [participants, remainingList, allowRepeat, prizeName, isDrawing, onWinnerDrawn]);

  const resetProgress = () => {
    if (confirm("確定要重置抽獎進度與中獎紀錄嗎？")) {
      setRemainingList(participants);
      setHistory([]);
      setCurrentDisplay('???');
    }
  };

  const hasParticipants = participants.length > 0;
  const poolCount = allowRepeat ? participants.length : remainingList.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Prize Manager Modal */}
      {showPrizeManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                獎品管理
              </h3>
              <button onClick={() => setShowPrizeManager(false)} className="text-slate-400 hover:text-slate-600">
                <RotateCcw className="w-5 h-5 rotate-45" /> {/* Close icon substitution */}
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingPrizeIndex === null ? tempPrizeName : ''}
                  onChange={(e) => setTempPrizeName(e.target.value)}
                  placeholder="輸入新獎品名稱..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={editingPrizeIndex !== null}
                />
                <button
                  onClick={handleAddPrize}
                  disabled={!tempPrizeName.trim() || editingPrizeIndex !== null}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  新增
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {prizes.map((prize, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                    {editingPrizeIndex === index ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={tempPrizeName}
                          onChange={(e) => setTempPrizeName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-indigo-300 rounded-lg outline-none text-sm"
                          autoFocus
                        />
                        <button onClick={handleUpdatePrize} className="text-xs bg-green-500 text-white px-2 rounded-lg">儲存</button>
                        <button onClick={cancelEdit} className="text-xs bg-slate-300 text-slate-600 px-2 rounded-lg">取消</button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-slate-700">{prize}</span>
                        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(index)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePrize(index)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {prizes.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    目前沒有設定獎品
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button onClick={() => setShowPrizeManager(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Background Overlay */}
          <div className={`absolute inset-0 bg-indigo-500/5 transition-opacity duration-1000 pointer-events-none ${isDrawing ? 'opacity-100' : 'opacity-0'}`}></div>

          <Trophy className={`w-16 h-16 mb-4 transition-transform duration-500 z-10 ${isDrawing ? 'animate-bounce text-yellow-500 scale-110' : 'text-slate-300'}`} />

          <h2 className="text-2xl font-bold text-slate-800 mb-2 z-10">幸運大抽獎</h2>
          <div className="flex items-center gap-2 mb-8 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${hasParticipants ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
              {hasParticipants ? `池中人數：${poolCount} 人` : "等待名單匯入"}
            </span>
          </div>

          {!hasParticipants && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700 text-sm z-10 max-w-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-left leading-relaxed">目前名單為空。請先點擊左側的<strong>『名單管理』</strong>貼上姓名或上傳檔案。</p>
            </div>
          )}

          <div className="w-full py-12 mb-8 bg-slate-900 rounded-2xl border-4 border-slate-800 shadow-inner flex items-center justify-center relative z-10">
            <div className={`text-6xl md:text-8xl font-black tracking-widest text-white drop-shadow-2xl transition-all ${isDrawing ? 'scale-110 blur-[1px]' : ''}`}>
              {currentDisplay}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full z-10 max-w-xl">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <select
                  value={prizeName}
                  onChange={(e) => setPrizeName(e.target.value)}
                  disabled={isDrawing || prizes.length === 0}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-700 appearance-none cursor-pointer disabled:opacity-50"
                >
                  {prizes.length === 0 ? <option value="">無可用獎品，請新增</option> : null}
                  {prizes.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
              <button
                onClick={() => setShowPrizeManager(true)}
                disabled={isDrawing}
                className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 border border-slate-200 transition-colors"
                title="管理獎品"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={drawWinner}
              disabled={isDrawing || !hasParticipants || !prizeName}
              className={`px-10 py-4 font-black text-lg rounded-xl shadow-xl transition-all flex items-center gap-3 active:scale-95 ${isDrawing
                ? 'bg-slate-400 text-slate-100 cursor-wait'
                : (!hasParticipants || !prizeName)
                  ? 'bg-slate-300 text-white cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
            >
              <Play className={`w-6 h-6 ${isDrawing ? 'animate-pulse' : 'fill-current'}`} />
              {isDrawing ? '抽獎中...' : '開始抽獎'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            進階設定
          </h3>
          <div className="flex flex-wrap items-center gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={allowRepeat}
                onChange={(e) => setAllowRepeat(e.target.checked)}
                disabled={isDrawing}
                className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
              />
              <div className="flex flex-col">
                <span className="text-slate-700 font-bold group-hover:text-indigo-600 transition-colors">允許重複中獎</span>
                <span className="text-[10px] text-slate-400 font-medium">勾選後，中獎者不會從待抽池中移除</span>
              </div>
            </label>
            <button
              onClick={resetProgress}
              disabled={isDrawing}
              className="flex items-center gap-2 text-slate-500 hover:text-red-500 text-sm font-bold transition-all hover:bg-red-50 px-4 py-2 rounded-xl disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> 重置抽獎進度
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden max-h-[720px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800">中獎紀錄 ({history.length})</h3>
          </div>
          {history.length > 0 && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent First</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-24 text-slate-400 flex flex-col items-center">
              <Info className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm font-medium">目前尚無中獎紀錄</p>
              <p className="text-[10px] mt-1">抽出第一位幸運兒吧！</p>
            </div>
          ) : (
            history.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex items-center justify-between animate-fadeIn transition-all ${index === 0
                  ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200 shadow-sm ring-2 ring-indigo-500/10'
                  : 'bg-white border-slate-100'
                  }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {/* Fix: use Sparkles icon here */}
                    {index === 0 && <Sparkles className="w-3 h-3 text-indigo-500" />}
                    <span className={`font-black ${index === 0 ? 'text-indigo-900 text-lg' : 'text-slate-800'}`}>
                      {item.winner.name}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 w-fit ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {item.prize}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Simple custom styles for better list scrolling
const styles = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
`;

export default LuckyDraw;