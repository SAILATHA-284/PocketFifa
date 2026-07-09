import React from 'react';
import { Difficulty } from '../types';
import { Sparkles, Trophy, Settings, HelpCircle, Flame, Shield, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeScreenProps {
  difficulty: Difficulty;
  setDifficulty: (level: Difficulty) => void;
  onStartMatch: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  difficulty,
  setDifficulty,
  onStartMatch,
}) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-900 via-green-950 to-slate-950 text-white flex flex-col justify-center items-center px-4 py-8 select-none">
      {/* Title block with subtle hover animation */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles size={14} className="animate-pulse" /> Retro Arcade Football
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          ⚽ POCKET <span className="text-emerald-400">FOOTBALL</span>
        </h1>
        <p className="text-emerald-200/60 mt-2 text-sm md:text-base max-w-md mx-auto">
          Fast-paced, physics-based 5-on-5 action. Dribble, pass, tackle, and strike your way to victory!
        </p>
      </motion.div>

      {/* Main card panel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-xl bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl flex flex-col gap-6"
      >
        {/* Difficulty Selector */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3 flex items-center gap-2">
            <Settings size={14} /> Select Match Difficulty
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'easy' as const, label: 'Easy', color: 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 active:bg-emerald-500 active:text-white', icon: Shield },
              { id: 'medium' as const, label: 'Medium', color: 'border-yellow-500/30 hover:border-yellow-500/60 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400 active:bg-yellow-500 active:text-white', icon: Trophy },
              { id: 'hard' as const, label: 'Hard', color: 'border-rose-500/30 hover:border-rose-500/60 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 active:bg-rose-500 active:text-white', icon: Flame },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = difficulty === item.id;
              return (
                <button
                  key={item.id}
                  id={`diff_${item.id}`}
                  onClick={() => setDifficulty(item.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? item.id === 'easy' ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold scale-102 shadow-lg shadow-emerald-500/20'
                        : item.id === 'medium' ? 'bg-yellow-500 border-yellow-400 text-slate-950 font-bold scale-102 shadow-lg shadow-yellow-500/20'
                        : 'bg-rose-500 border-rose-400 text-white font-bold scale-102 shadow-lg shadow-rose-500/20'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white hover:scale-102'
                  }`}
                >
                  <Icon size={18} className={`mb-1.5 ${isActive ? 'scale-110' : 'opacity-60'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Play button */}
        <button
          id="playBtn"
          onClick={onStartMatch}
          className="w-full bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold py-4 px-6 rounded-xl text-lg md:text-xl tracking-wide shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-3 transform hover:scale-102 active:scale-98 transition-all cursor-pointer"
        >
          <Play size={20} className="fill-slate-950" /> PLAY MATCH
        </button>

        {/* Divider */}
        <hr className="border-slate-800/80" />

        {/* Keyboard Controls Legend */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
            <HelpCircle size={14} /> Control Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Movement Column */}
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2">
              <span className="text-emerald-400 font-bold mb-1 block">🏃 MOVEMENT:</span>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Run Up:</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white font-semibold">W</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Run Down:</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white font-semibold">S</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Run Left:</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white font-semibold">A</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Run Right:</span>
                <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white font-semibold">D</kbd>
              </div>
              <p className="text-[10px] text-slate-500/80 mt-1 italic">
                *Arrow keys are also fully supported
              </p>
            </div>

            {/* Actions Column */}
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2 justify-between">
              <div>
                <span className="text-emerald-400 font-bold mb-2 block">⚽ MATCH ACTIONS:</span>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Pass Ball:</span>
                    <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white font-semibold">Space / J</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Shoot Goal:</span>
                    <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white font-semibold">F / L</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Slide Tackle:</span>
                    <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white font-semibold">E / K</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Switch Player:</span>
                    <kbd className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-white font-semibold">Q / I</kbd>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic leading-relaxed mt-2">
                *Aim shoots high or low by pressing <kbd className="bg-slate-800/60 px-1 py-0.2 rounded">W</kbd> or <kbd className="bg-slate-800/60 px-1 py-0.2 rounded">S</kbd> while shooting.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
