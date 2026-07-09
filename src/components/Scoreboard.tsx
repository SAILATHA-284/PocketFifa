import React from 'react';
import { Difficulty, Team } from '../types';
import { Shield, Trophy, Flame, Play, Pause } from 'lucide-react';

interface ScoreboardProps {
  userScore: number;
  aiScore: number;
  matchTime: number; // remaining seconds
  totalMatchTime: number; // total duration
  difficulty: Difficulty;
  isPaused: boolean;
  onPauseToggle: () => void;
  onForfeitMatch: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  userScore,
  aiScore,
  matchTime,
  totalMatchTime,
  difficulty,
  isPaused,
  onPauseToggle,
  onForfeitMatch,
}) => {
  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get Difficulty Badge styling
  const renderDifficultyBadge = () => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] md:text-xs px-2.5 py-1 rounded-full font-semibold uppercase">
            <Shield size={12} /> Easy
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] md:text-xs px-2.5 py-1 rounded-full font-semibold uppercase">
            <Trophy size={12} /> Medium
          </span>
        );
      case 'hard':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] md:text-xs px-2.5 py-1 rounded-full font-semibold uppercase">
            <Flame size={12} /> Hard
          </span>
        );
    }
  };

  const progressPercent = Math.max(0, Math.min(100, (matchTime / totalMatchTime) * 100));

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 text-white flex flex-col p-4 shadow-xl select-none">
      {/* Scoreboard HUD Bar */}
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full gap-2">
        {/* User Team */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          <div className="text-right">
            <h2 className="text-sm md:text-lg font-bold tracking-wide">USER FC</h2>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold hidden md:block">
              Host Team
            </p>
          </div>
          {/* Blue team dot */}
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white shadow-sm shadow-blue-500/50" />
        </div>

        {/* Dynamic Display Board */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-2.5 shadow-inner">
          {/* User Score LED */}
          <span className="text-2xl md:text-4xl font-black font-mono tracking-wider text-yellow-400 select-none min-w-[28px] text-center">
            {userScore}
          </span>
          
          <span className="text-slate-500 text-lg md:text-2xl font-bold font-mono">:</span>
          
          {/* AI Score LED */}
          <span className="text-2xl md:text-4xl font-black font-mono tracking-wider text-yellow-400 select-none min-w-[28px] text-center">
            {aiScore}
          </span>
        </div>

        {/* AI Team */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-start">
          {/* Red team dot */}
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white shadow-sm shadow-red-500/50" />
          <div>
            <h2 className="text-sm md:text-lg font-bold tracking-wide">AI FC</h2>
            <p className="text-[10px] text-red-400 uppercase tracking-widest font-semibold hidden md:block">
              Guest Team
            </p>
          </div>
        </div>

        {/* Center Timer Section */}
        <div className="flex flex-col items-center justify-center min-w-[80px] md:min-w-[120px]">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
            Timer
          </span>
          <div className="bg-slate-900/60 font-mono text-xl md:text-2xl font-bold text-white px-3 py-1 rounded-lg border border-slate-800 tracking-wider">
            {formatTime(matchTime)}
          </div>
        </div>

        {/* Actions Segment */}
        <div className="flex items-center gap-2">
          {renderDifficultyBadge()}

          {/* Pause Button */}
          <button
            onClick={onPauseToggle}
            className={`p-2 rounded-lg cursor-pointer transition-all ${
              isPaused 
                ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play size={16} className="fill-slate-950" /> : <Pause size={16} />}
          </button>

          {/* Forfeit button */}
          <button
            onClick={onForfeitMatch}
            className="hidden md:inline-flex bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-900 text-slate-400 hover:text-red-300 text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer"
          >
            Forfeit
          </button>
        </div>
      </div>

      {/* Progress Timeline Indicator */}
      <div className="w-full max-w-5xl mx-auto h-1.5 bg-slate-900/80 rounded-full mt-3 overflow-hidden border border-slate-800/40">
        <div
          className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
