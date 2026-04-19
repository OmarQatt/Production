import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Ruler, Weight, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function ModelSearch() {
  const [filters, setFilters] = useState({
    gender: 'all',
    minAge: 18,
    maxAge: 45,
    minHeight: 160,
    maxHeight: 200,
  });

  const models = [
    { id: 1, name: "Alexandra V.", age: 24, height: 175, weight: 58, skin: "Fair", gender: "Female", location: "Milan", experience: "5+ Years", positions: ["Fashion", "Commercial"] },
    { id: 2, name: "Marcus L.", age: 28, height: 188, weight: 82, skin: "Deep", gender: "Male", location: "New York", experience: "8+ Years", positions: ["Fitness", "Acting"] },
    { id: 3, name: "Yuki T.", age: 22, height: 168, weight: 52, skin: "Light", gender: "Other", location: "Tokyo", experience: "2+ Years", positions: ["Alternative", "Runway"] },
  ];

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto space-y-12 pb-32">
      <div className="space-y-4">
        <h1 className="text-5xl font-serif">Talent Pool</h1>
        <p className="text-zinc-500 max-w-xl">Find the perfect face for your production. Detailed casting metrics and verified experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <div className="space-y-8 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
              Filters
            </h3>
            <button className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white underline transition-colors">Reset</button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {["Male", "Female", "Other", "All"].map(g => (
                  <button 
                  key={g}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs hover:border-brand-gold transition-colors"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Age Range ({filters.minAge} - {filters.maxAge})</label>
              <input type="range" min="16" max="70" className="w-full accent-brand-gold" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Height (cm)</label>
              <input type="range" min="140" max="220" className="w-full accent-brand-gold" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Skin Tone</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs">
                <option>All Tones</option>
                <option>Fair</option>
                <option>Medium</option>
                <option>Deep</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input type="text" placeholder="City..." className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-4 text-xs outline-none focus:border-brand-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {models.map((model, i) => (
            <motion.div 
              key={model.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-[2rem] overflow-hidden group cursor-pointer"
            >
              <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/model${model.id}/600/800`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">
                  {model.experience} Exp
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-2xl font-serif">{model.name}</h4>
                  <p className="text-zinc-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {model.location}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Metrics</p>
                    <div className="flex items-center gap-3 text-xs">
                      <Ruler className="w-3 h-3 text-brand-gold" /> {model.height}cm
                      <Weight className="w-3 h-3 text-brand-gold" /> {model.weight}kg
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Tone</p>
                    <div className="flex items-center gap-3 text-xs">
                      <User className="w-3 h-3 text-brand-gold" /> {model.skin}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {model.positions.map(p => (
                    <span key={p} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-medium border border-white/5">{p}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
