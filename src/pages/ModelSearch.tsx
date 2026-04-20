import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Ruler, Weight, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ModelSearch() {
  const [filters, setFilters] = useState({
    type: 'ALL',
    gender: 'all',
    minAge: 16,
    maxAge: 70,
    experience: 'ALL',
    status: 'ALL',
    city: '',
    role: '',
  });
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTalent = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.type !== 'ALL') params.append('type', filters.type);
    if (filters.gender !== 'all') params.append('gender', filters.gender);
    if (filters.experience !== 'ALL') params.append('experience', filters.experience);
    if (filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.city) params.append('city', filters.city);
    if (filters.role) params.append('role', filters.role);
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
        <h1 className="text-5xl font-serif">Talent & Crew <span className="text-brand-gold italic">Pool.</span></h1>
        <p className="text-zinc-500 max-w-xl">Find perfect faces and world-class crew. Detailed metrics, verified experience, and real-time availability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <div className="space-y-8 h-fit lg:sticky lg:top-24 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
              Advanced Filters
            </h3>
            <button 
              onClick={() => setFilters({ type: 'ALL', gender: 'all', minAge: 16, maxAge: 70, experience: 'ALL', status: 'ALL', city: '', role: '' })}
              className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white underline transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Talent Type</label>
              <div className="grid grid-cols-3 gap-2">
                {["MODEL", "CREW", "ALL"].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilters(prev => ({ ...prev, type: t }))}
                    className={cn(
                      "px-2 py-2 border rounded-lg text-[10px] font-bold transition-colors",
                      filters.type === t ? "bg-brand-gold text-black border-brand-gold" : "bg-white/5 border-white/10 hover:border-brand-gold"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {["Male", "Female", "Other", "All"].map(g => (
                  <button 
                    key={g}
                    onClick={() => setFilters(prev => ({ ...prev, gender: g.toLowerCase() }))}
                    className={cn(
                      "px-3 py-2 border rounded-lg text-[10px] font-bold transition-colors",
                      filters.gender === g.toLowerCase() ? "bg-brand-gold text-black border-brand-gold" : "bg-white/5 border-white/10 hover:border-brand-gold"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Experience Tier</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-xs outline-none focus:border-brand-gold"
                value={filters.experience}
                onChange={e => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              >
                <option value="ALL">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="PROFESSIONAL">Professional</option>
              </select>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Availability</label>
               <div className="grid grid-cols-2 gap-2">
                 {["AVAILABLE", "ALL"].map(s => (
                   <button 
                     key={s}
                     onClick={() => setFilters(prev => ({ ...prev, status: s }))}
                     className={cn(
                       "px-3 py-2 border rounded-lg text-[10px] font-bold transition-colors",
                       filters.status === s ? "bg-green-500 text-black border-green-500" : "bg-white/5 border-white/10 hover:border-green-500"
                     )}
                   >
                     {s === 'AVAILABLE' ? 'Online Now' : 'Show All'}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Age Bracket</label>
                <span className="text-[10px] font-mono text-brand-gold">{filters.minAge} - {filters.maxAge}</span>
              </div>
              <div className="space-y-4">
                <input 
                  type="range" min="16" max="70" 
                  value={filters.minAge}
                  onChange={e => setFilters(prev => ({ ...prev, minAge: parseInt(e.target.value) }))}
                  className="w-full accent-brand-gold cursor-pointer" 
                />
                <input 
                  type="range" min="16" max="70" 
                  value={filters.maxAge}
                  onChange={e => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
                  className="w-full accent-brand-gold cursor-pointer" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Region / City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="e.g. London" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-8 pr-4 text-xs outline-none focus:border-brand-gold"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Specific Role</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="e.g. Photographer, Model..." 
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-8 pr-4 text-xs outline-none focus:border-brand-gold"
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-32 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Scanning production directory...</div>
          ) : models.length === 0 ? (
            <div className="py-32 text-center space-y-4 glass rounded-[3rem]">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                 <UserIcon className="w-8 h-8 text-zinc-800" />
               </div>
               <p className="text-zinc-500 italic max-w-xs mx-auto">No talent records match your current production requirements.</p>
            </div>
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
                    className="glass rounded-[2rem] overflow-hidden group cursor-pointer h-full flex flex-col hover:border-brand-gold/30 transition-all active:scale-[0.98]"
                  >
                    <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                      <img 
                        src={talent.user.photoURL || `https://picsum.photos/seed/talent${talent.id}/600/800`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black tracking-[.2em] uppercase border border-white/10 text-brand-gold">
                        {talent.experience}
                      </div>
                      {talent.status === 'AVAILABLE' && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500/20 backdrop-blur-md px-2 py-1 rounded-full border border-green-500/30">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                           <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest">Available</span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xl font-serif text-white group-hover:text-brand-gold transition-colors">{talent.user.displayName}</h4>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {talent.city}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-[.2em]">Metrics</p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                            {talent.height}cm / {talent.weight}kg
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-[.2em]">Age</p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                            {talent.age} yrs
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {JSON.parse(talent.positions || "[]").slice(0, 3).map((p: string) => (
                          <span key={p} className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-bold uppercase tracking-widest border border-white/5 text-zinc-500">{p}</span>
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
