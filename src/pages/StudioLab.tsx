import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Download, Copy, RefreshCw, Wand2, Palette, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
}

export default function StudioLab() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `High-quality cinematic production concept art, mood board style, professional lighting: ${prompt}` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      let imageData = '';
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageData = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageData) {
        const newImage: GeneratedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: imageData,
          prompt: prompt,
          timestamp: new Date(),
        };
        setHistory(prev => [newImage, ...prev]);
        setActiveImage(newImage);
      } else {
        console.error("No image data received from Gemini API");
      }
    } catch (err) {
      console.error("Image generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand-gold font-mono text-[10px] tracking-[0.3em] uppercase">
            <Sparkles className="w-3 h-3" />
            Artificial Intelligence Unit
          </div>
          <h1 className="text-5xl font-serif tracking-tight">Studio <span className="text-brand-gold italic">Lab.</span></h1>
          <p className="text-zinc-500 max-w-xl font-light">
            Generate cinematic mood boards, production concept art, and visual directives using professional-grade AI models.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 border-white/5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Gemini-2.5-Flash-Image Connected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Workspace: Generation Controls */}
        <div className="lg:col-span-5 space-y-8">
          <section className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Visual Directive</label>
              <div className="relative group">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A futuristic cyberpunk alleyway in Tokyo, rainy night, neon reflections, 8k resolution, cinematic lighting..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-48 focus:border-brand-gold outline-none transition-all text-sm font-light resize-none leading-relaxed"
                />
                <div className="absolute bottom-4 right-4 text-[9px] font-mono text-zinc-600">
                  {prompt.length} / 500
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Mood Archetype</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-gold">
                  <option>Cinematic / Realism</option>
                  <option>Cyberpunk / Tech</option>
                  <option>Ethereal / Dreamy</option>
                  <option>Hardware / Industrial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Aspect Ratio</label>
                <div className="flex gap-2">
                   {["16:9", "4:3", "1:1"].map(ratio => (
                     <button key={ratio} className={cn(
                       "flex-1 py-2 border rounded-xl text-[10px] font-bold",
                       ratio === "16:9" ? "border-brand-gold text-brand-gold bg-brand-gold/5" : "border-white/10 text-zinc-500"
                     )}>{ratio}</button>
                   ))}
                </div>
              </div>
            </div>

            <button 
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className={cn(
                "w-full py-5 rounded-3xl font-black uppercase text-xs tracking-[.25em] transition-all flex items-center justify-center gap-3 overflow-hidden group relative shadow-2xl",
                isGenerating ? "bg-zinc-800 text-zinc-600" : "bg-brand-gold text-black hover:scale-[1.02] active:scale-95 shadow-brand-gold/20"
              )}
            >
              <AnimatePresence mode="wait">
                {isGenerating ? (
                   <motion.div 
                     key="loading" 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     exit={{ opacity: 0 }}
                     className="flex items-center gap-3"
                   >
                     <RefreshCw className="w-4 h-4 animate-spin" />
                     Synthesizing Art...
                   </motion.div>
                ) : (
                  <motion.div 
                    key="idle" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Wand2 className="w-4 h-4" />
                    Ignite Generation
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
            </button>
          </section>

          {/* Prompt Assist */}
          <div className="glass p-6 rounded-3xl space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                <Palette className="w-3 h-3" />
                Laboratory Presets
             </div>
             <div className="grid grid-cols-1 gap-2">
                {[
                  "Noir film aesthetic, heavy shadows",
                  "Anamorphic lens flares, sci-fi landscape",
                  "Minimalist architectural study, harsh desert sun",
                  "Retro 70s grain, vintage color palette"
                ].map(preset => (
                  <button 
                    key={preset}
                    onClick={() => setPrompt(preset)}
                    className="text-left text-[11px] text-zinc-500 hover:text-white hover:bg-white/5 p-3 rounded-xl transition-all border border-transparent hover:border-white/5"
                  >
                    {preset}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Viewport: Active Output & History */}
        <div className="lg:col-span-7 space-y-8">
          {/* Active Canvas */}
          <section className={cn(
            "aspect-video bg-zinc-900/50 rounded-[3rem] border border-white/5 relative overflow-hidden flex items-center justify-center group",
            !activeImage && "border-dashed border-zinc-800"
          )}>
            <AnimatePresence mode="wait">
              {activeImage ? (
                <motion.div 
                  key={activeImage.id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <img src={activeImage.url} alt="AI Generated Concept" className="w-full h-full object-cover" />
                  <div className="absolute bottom-8 right-8 flex gap-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => downloadImage(activeImage.url, `concept-art-${activeImage.id}.png`)}
                      className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-brand-gold hover:text-black transition-all"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/20 transition-all">
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
                    <ImageIcon className="w-8 h-8 text-zinc-800" />
                  </div>
                  <div className="space-y-1 text-zinc-600 italic">
                    <p className="font-serif">Waiting for directive...</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest not-italic">Viewport Idle</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
            
            {isGenerating && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                 <div className="space-y-6 text-center">
                    <div className="w-12 h-12 border-2 border-brand-gold/10 border-t-brand-gold rounded-full animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-brand-gold font-mono text-[10px] tracking-widest uppercase animate-pulse">Computing Neurals</p>
                      <p className="text-zinc-500 text-[9px] italic">Expected time: 4-6 seconds</p>
                    </div>
                 </div>
              </div>
            )}
          </section>

          {/* History / Vault */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Generation Logs</h3>
              <div className="text-[10px] font-mono text-zinc-600 italic">Vault contains {history.length} assets</div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {history.length === 0 ? (
                 <div className="col-span-full py-12 text-center text-zinc-700 italic border border-dashed border-zinc-800 rounded-[2rem]">
                    No captured concepts in current session memory.
                 </div>
               ) : (
                 history.slice(1).map(item => (
                   <motion.div 
                     key={item.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     onClick={() => setActiveImage(item)}
                     className="group cursor-pointer space-y-3"
                   >
                     <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 relative">
                        <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-brand-gold/0 group-hover:bg-brand-gold/10 transition-colors" />
                     </div>
                     <div className="px-1 overflow-hidden">
                        <p className="text-[9px] text-zinc-500 truncate italic">"{item.prompt}"</p>
                        <p className="text-[8px] font-mono text-zinc-700 uppercase">{formatDate(item.timestamp)}</p>
                     </div>
                   </motion.div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
