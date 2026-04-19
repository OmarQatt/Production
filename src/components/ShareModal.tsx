import React, { useState } from 'react';
import { X, Copy, Check, Twitter, Facebook, Linkedin, Mail, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { icon: Twitter, label: 'Twitter', color: 'bg-[#1DA1F2]', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { icon: Facebook, label: 'Facebook', color: 'bg-[#4267B2]', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { icon: Linkedin, label: 'LinkedIn', color: 'bg-[#0077b5]', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { icon: Mail, label: 'Email', color: 'bg-zinc-700', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}` },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass w-full max-w-sm rounded-[2.5rem] p-8 relative overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-8 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto">
                   <Share2 className="w-8 h-8 text-brand-gold" />
                </div>
                <h3 className="text-2xl font-serif">Share Listing</h3>
                <p className="text-zinc-500 text-xs font-light">
                  Invite your production team to collaborate on this selection.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {shareOptions.map((option) => (
                  <a 
                    key={option.label}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                       <option.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-zinc-500">{option.label}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-3 pt-4">
                 <div className="relative">
                    <input 
                      readOnly 
                      value={url}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-[10px] font-mono outline-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:text-brand-gold transition-colors"
                    >
                       {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
