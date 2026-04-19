import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Ruler, Weight, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ModelSearch() {
  const [filters, setFilters] = useState({
    gender: 'all',
    minAge: 16,
    maxAge: 70,
  });
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTalent = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.gender !== 'all') params.append('gender', filters.gender);
    params.append('minAge', filters.minAge.toString());
    params.append('maxAge', filters.maxAge.toString());

    fetch(`/api/talent?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTalent();
  }, [filters]);

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto space-y-12 pb-32">
      <div className="space-y-4">
        <h1 className="text-5xl font-serif">Talent Pool</h1>
        <p className="text-zinc-500 max-w-xl">Find the perfect face for your production. Detailed casting metrics and verified experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <div className="space-y-8 h-fit lg:sticky lg:top-24 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
              Filters
            </h3>
            <button 
              onClick={() => setFilters({ gender: 'all', minAge: 16, maxAge: 70 })}
              className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white underline transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {["Male", "Female", "Other", "All"].map(g => (
                  <button 
                    key={g}
                    onClick={() => setFilters(prev => ({ ...prev, gender: g.toLowerCase() }))}
                    className={cn(
                      "px-3 py-2 border rounded-lg text-xs transition-colors",
                      filters.gender === g.toLowerCase() ? "bg-brand-gold text-black border-brand-gold" : "bg-white/5 border-white/10 hover:border-brand-gold"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Min Age</label>
                <span className="text-xs text-brand-gold">{filters.minAge}</span>
              </div>
              <input 
                type="range" min="16" max="70" 
                value={filters.minAge}
                onChange={e => setFilters(prev => ({ ...prev, minAge: parseInt(e.target.value) }))}
                className="w-full accent-brand-gold cursor-pointer" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Max Age</label>
                <span className="text-xs text-brand-gold">{filters.maxAge}</span>
              </div>
              <input 
                type="range" min="16" max="70" 
                value={filters.maxAge}
                onChange={e => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
                className="w-full accent-brand-gold cursor-pointer" 
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input type="text" placeholder="City..." className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-8 pr-4 text-xs outline-none focus:border-brand-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-32 text-center text-zinc-500 italic">Scanning casting profiles...</div>
          ) : models.length === 0 ? (
            <div className="py-32 text-center text-zinc-500 italic">No talent matches your current selection.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {models.map((talent, i) => (
                <Link 
                  to={`/project/${talent.id}`}
                  key={talent.id}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-[2rem] overflow-hidden group cursor-pointer h-full flex flex-col"
                  >
                    <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                      <img 
                        src={talent.user.photoURL || `https://picsum.photos/seed/talent${talent.id}/600/800`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10 text-white">
                        {talent.experience}
                      </div>
                    </div>
                    <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-2xl font-serif text-white">{talent.user.displayName}</h4>
                        <p className="text-zinc-500 text-sm flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {talent.city}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Metrics</p>
                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <Ruler className="w-3 h-3 text-brand-gold" /> {talent.height}cm
                            <Weight className="w-3 h-3 text-brand-gold" /> {talent.weight}kg
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Type</p>
                          <div className="flex items-center gap-2 text-xs text-brand-gold font-bold">
                            <UserIcon className="w-3 h-3" /> {talent.type}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {JSON.parse(talent.positions || "[]").map((p: string) => (
                          <span key={p} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-medium border border-white/5 text-zinc-400">{p}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function locally if not available
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
