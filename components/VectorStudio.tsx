
import React, { useState, useRef } from 'react';
import { vectorizeImage } from '../services/geminiService';

const VectorStudio: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [vectorSvg, setVectorSvg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetailed, setIsDetailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVectorSvg(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleVectorize = async () => {
    if (!preview) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const base64Data = preview.split(',')[1];
      const mimeType = file?.type || 'image/png';
      const svg = await vectorizeImage(base64Data, mimeType, isDetailed);
      setVectorSvg(svg);
    } catch (err: any) {
      setError(err.message || "Failed to vectorize image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAs = (format: 'svg' | 'ai' | 'cdr') => {
    if (!vectorSvg) return;
    const filename = `vectorized_image.${format}`;
    downloadFile(vectorSvg, filename, 'image/svg+xml');
  };

  return (
    <div className="space-y-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AI Vector Studio</h2>
          <p className="text-slate-400 mt-2">Transform raster graphics into scalable vector paths using Gemini's advanced vision engine.</p>
        </div>
        
        {/* Detail Toggle */}
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Processing Mode</span>
            <span className={`text-sm font-medium ${isDetailed ? 'text-emerald-400' : 'text-slate-300'}`}>
              {isDetailed ? 'High Detail Trace' : 'Optimized Fast Trace'}
            </span>
          </div>
          <button 
            onClick={() => setIsDetailed(!isDetailed)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
              isDetailed ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isDetailed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Upload Section */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-slate-700 hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
            {preview ? (
              <img src={preview} alt="Source Preview" className="max-h-[300px] object-contain rounded-xl shadow-2xl z-10" />
            ) : (
              <div className="text-center space-y-4 z-10">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500 group-hover:text-emerald-400 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">Drag & drop or click to upload</p>
                <p className="text-slate-600 text-xs uppercase tracking-tighter">PNG, JPG, WEBP (Max 5MB)</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>

          <button
            onClick={handleVectorize}
            disabled={!preview || isProcessing}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              isProcessing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-emerald-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isDetailed ? 'Detailed Analysis...' : 'Processing AI Paths...'}
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                {isDetailed ? 'Generate Detailed Vector' : 'Generate Vector'}
              </>
            )}
          </button>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm flex items-start gap-3">
               <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Output Results Section */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center border-2 border-emerald-500/10 bg-emerald-500/[0.02]">
            {vectorSvg ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <div 
                  className="w-full max-h-[350px] flex items-center justify-center bg-white/5 rounded-xl p-4 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: vectorSvg }}
                />
                <div className="flex flex-wrap justify-center gap-3">
                  <button 
                    onClick={() => exportAs('svg')}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                  >
                    Export .SVG
                  </button>
                  <button 
                     onClick={() => exportAs('ai')}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                  >
                    Export .AI
                  </button>
                  <button 
                     onClick={() => exportAs('cdr')}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                  >
                    Export .CDR
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-600 space-y-4">
                <svg className="w-12 h-12 mx-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>Vector output will appear here</p>
              </div>
            )}
          </div>

          <div className="glass p-6 rounded-2xl bg-indigo-500/5">
             <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Studio Guidance
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isDetailed 
                ? "High Detail Mode produces more complex paths and gradients, perfect for illustrations, but results in larger file sizes." 
                : "Fast Trace Mode produces clean, simplified vectors ideal for logos and UI icons."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorStudio;
