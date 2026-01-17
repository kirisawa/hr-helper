
import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Sparkles, Download, Upload, Loader2, Wand2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

const ImageStudio: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setIsLoading(true);
    
    // Extract base64
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];
    
    const edited = await GeminiService.editImage(base64Data, prompt, mimeType);
    if (edited) {
      setResultImage(edited);
    } else {
      alert("AI 編輯失敗，請稍後再試。");
    }
    setIsLoading(false);
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'hr-event-photo.png';
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI 活動照片魔術師
        </h2>

        <div 
          className="aspect-video relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center group"
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          {image ? (
            <img src={image} className="w-full h-full object-contain" alt="Upload preview" />
          ) : (
            <div className="text-center cursor-pointer">
              <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
              <p className="text-sm font-medium text-slate-500">點擊上傳原始活動照片</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none min-h-[100px]"
              placeholder="輸入您的編輯需求，例如：&#10;『加上復古濾鏡效果』&#10;『把背景的人像模糊掉』&#10;『讓整張照片看起來像在星空下』"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-slate-300">
              <Wand2 className="w-6 h-6" />
            </div>
          </div>

          <button
            onClick={handleEdit}
            disabled={isLoading || !image || !prompt}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                正在用 AI 魔法編輯中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                執行 AI 編輯
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 blur-[100px]"></div>

        {resultImage ? (
          <div className="w-full h-full flex flex-col items-center space-y-6">
            <div className="relative group w-full flex-1">
              <img src={resultImage} className="w-full h-full object-contain rounded-xl shadow-2xl border border-white/10" alt="Result" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                 <button 
                  onClick={downloadImage}
                  className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                 >
                   <Download className="w-6 h-6" />
                 </button>
              </div>
            </div>
            <button 
              onClick={downloadImage}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              下載編輯後的照片
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <ImageIcon className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-white font-medium text-lg">AI 產出預覽區域</h3>
            <p className="text-white/40 text-sm max-w-[280px]">上傳照片並輸入指令後，AI 編輯的結果會顯示在這裡。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
