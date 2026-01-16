
import React, { useState } from 'react';
import { RGB, CMYK } from '../types';
import { rgbToCmyk, cmykToRgb, rgbToHex, hexToRgb } from '../utils/colorUtils';
import { detectColors, DetectedColor } from '../services/geminiService';
import CameraCapture from './CameraCapture';

const ColorConverter: React.FC = () => {
  const [rgb, setRgb] = useState<RGB>({ r: 99, g: 102, b: 241 });
  const [cmyk, setCmyk] = useState<CMYK>({ c: 59, m: 58, y: 0, k: 5 });
  const [hex, setHex] = useState('#6366F1');
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedColors, setDetectedColors] = useState<DetectedColor[]>([]);

  const updateFromRgb = (newRgb: RGB) => {
    setRgb(newRgb);
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const updateFromCmyk = (newCmyk: CMYK) => {
    setCmyk(newCmyk);
    const newRgb = cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const updateFromHex = (newHex: string) => {
    setHex(newHex);
    const newRgb = hexToRgb(newHex);
    if (newRgb) {
      setRgb(newRgb);
      setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    }
  };

  const handleCameraCapture = async (base64: string) => {
    setIsCameraOpen(false);
    setIsAnalyzing(true);
    try {
      const colors = await detectColors(base64, 'image/jpeg');
      setDetectedColors(colors);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze colors. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectDetectedColor = (color: DetectedColor) => {
    setHex(color.hex);
    setRgb(color.rgb);
    setCmyk(color.cmyk);
  };

  return (
    <div className="space-y-8 pb-10">
      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Color Conversion Lab</h2>
          <p className="text-slate-400 mt-2">Professional tool for digital-to-print color workflows.</p>
        </div>
        <button 
          onClick={() => setIsCameraOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Scan Real Object
        </button>
      </header>

      {/* AI Analysis Results */}
      {(isAnalyzing || detectedColors.length > 0) && (
        <section className="glass rounded-3xl p-6 border-indigo-500/20 bg-indigo-500/[0.03]">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
            {isAnalyzing ? "AI Analyzing Camera Feed..." : "Detected Palette"}
          </h3>
          <div className="flex flex-wrap gap-4">
            {isAnalyzing ? (
              Array.from({length: 5}).map((_, i) => (
                <div key={i} className="w-24 h-24 rounded-2xl bg-slate-800 animate-pulse"></div>
              ))
            ) : (
              detectedColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => selectDetectedColor(color)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div 
                    className="w-24 h-24 rounded-2xl shadow-lg border-2 border-white/10 group-hover:scale-105 transition-transform relative overflow-hidden"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 max-w-[96px] truncate">{color.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{color.hex}</span>
                </button>
              ))
            )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Environment Comparison Area */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-slate-900/50 to-transparent">
            <div 
              className="w-40 h-40 rounded-full shadow-2xl transition-all duration-300 border-8 border-white/10"
              style={{ backgroundColor: hex }}
            />
            
            <div className="w-full grid grid-cols-2 gap-4">
              {/* Digital Environment */}
              <div className="space-y-3">
                <div className="h-32 w-full rounded-2xl relative overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center shadow-inner">
                   <div 
                    className="absolute inset-0 opacity-40 blur-2xl animate-pulse"
                    style={{ backgroundColor: hex }}
                  />
                  <div 
                    className="w-20 h-20 rounded-lg shadow-xl relative z-10"
                    style={{ 
                      backgroundColor: hex,
                      boxShadow: `0 0 30px ${hex}66`
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-tighter text-slate-500">Digital Display</p>
                  <p className="text-xs font-semibold text-indigo-400">Additive Light</p>
                </div>
              </div>

              {/* Print Environment */}
              <div className="space-y-3">
                <div className="h-32 w-full rounded-2xl relative overflow-hidden bg-[#e5e7eb] border border-black/10 flex items-center justify-center">
                   {/* Simulated Paper Grain */}
                   <div className="absolute inset-0 opacity-50 mix-blend-multiply pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
                  <div 
                    className="w-20 h-20 rounded shadow-md relative z-10 brightness-95 saturate-90"
                    style={{ backgroundColor: hex }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-tighter text-slate-500">Print Media</p>
                  <p className="text-xs font-semibold text-cyan-400">Subtractive Ink</p>
                </div>
              </div>
            </div>

            <div className="text-center w-full pt-4 border-t border-slate-800">
              <input 
                type="text" 
                value={hex}
                onChange={(e) => updateFromHex(e.target.value)}
                className="bg-transparent text-4xl font-mono font-bold text-center w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl py-1"
              />
              <p className="text-slate-500 uppercase tracking-widest text-[10px] mt-1">Global Hex Output</p>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl text-xs text-slate-400 leading-relaxed border-l-4 border-indigo-500">
            <p><strong className="text-slate-200">Real-time Feedback:</strong> As you adjust sliders, notice how the Digital view maintains "luminance" while the Print view simulates "reflection". This helps identify colors that might lose impact when printed.</p>
          </div>
        </div>

        {/* Controls Card */}
        <div className="space-y-6">
          {/* RGB Controls */}
          <section className="glass rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> RGB Space
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">0 - 255 SCALE</span>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {(['r', 'g', 'b'] as const).map((key) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <label className="capitalize font-medium text-slate-300">{key === 'r' ? 'Red' : key === 'g' ? 'Green' : 'Blue'}</label>
                    <span className="font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">{rgb[key]}</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="range" 
                      min="0" 
                      max="255" 
                      value={rgb[key]} 
                      onChange={(e) => updateFromRgb({...rgb, [key]: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white transition-all"
                    />
                    <div 
                      className="absolute -bottom-1 left-0 h-0.5 rounded-full opacity-50 transition-all"
                      style={{ 
                        width: `${(rgb[key] / 255) * 100}%`,
                        backgroundColor: key === 'r' ? '#ef4444' : key === 'g' ? '#22c55e' : '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CMYK Controls */}
          <section className="glass rounded-2xl p-6 space-y-6">
             <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span> CMYK Space
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">PERCENTAGE SCALE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              {(['c', 'm', 'y', 'k'] as const).map((key) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <label className="capitalize font-medium text-slate-300">
                      {key === 'c' ? 'Cyan' : key === 'm' ? 'Magenta' : key === 'y' ? 'Yellow' : 'Key (Black)'}
                    </label>
                    <span className="font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">{cmyk[key]}%</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={cmyk[key]} 
                      onChange={(e) => updateFromCmyk({...cmyk, [key]: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white transition-all"
                    />
                    <div 
                      className="absolute -bottom-1 left-0 h-0.5 rounded-full opacity-50 transition-all"
                      style={{ 
                        width: `${cmyk[key]}%`,
                        backgroundColor: key === 'c' ? '#06b6d4' : key === 'm' ? '#d946ef' : key === 'y' ? '#eab308' : '#0f172a'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="glass p-6 rounded-2xl border-l-4 border-amber-500/50 bg-amber-500/[0.02]">
        <div className="flex gap-4">
          <svg className="w-6 h-6 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-slate-100 mb-1">Color Gamut Notice</p>
            Colors outside the CMYK gamut are automatically clamped to the nearest printable equivalent in the Print preview. High-saturation RGB values often shift toward more muted tones in physical ink.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ColorConverter;
