import React from 'react';
import { Difficulty, Team } from '../types';
import { Trophy, RefreshCw, Star, Users, Flame, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ResultScreenProps {
  userScore: number;
  aiScore: number;
  difficulty: Difficulty;
  onRestart: () => void;
  onGoHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  userScore,
  aiScore,
  difficulty,
  onRestart,
  onGoHome,
}) => {
  const isUserWinner = userScore > aiScore;
  const isAIWinner = aiScore > userScore;
  const isDraw = userScore === aiScore;

  const getMatchVerdict = () => {
    if (isUserWinner) return '🏆 YOU WIN :)!';
    if (isAIWinner) return '🤖 BOT FC WINS!';
    return '🤝 DRAW!';
  };

  const getSubCommentary = () => {
    if (isUserWinner) {
      if (difficulty === 'hard') {
        return 'Absolute masterclass! Defeating the Hard AI is a legendary achievement. You are a world-class playmaker!';
      }
      return 'Superb performance! A stellar display of tactical passing and clinical finishing.';
    }
    if (isAIWinner) {
      if (difficulty === 'easy') {
        return 'Keep training! Practice your tackles and aim for the corners of the goal post to bypass the goalkeeper next time.';
      }
      return 'A valiant effort, but the opposition was too structured. Regroup and challenge them again!';
    }
    return 'An absolute nail-biter! Neither side could land the decisive final blow in regular time.';
  };

  const getBannerColor = () => {
    if (isUserWinner) return 'text-yellow-400 drop-shadow-[0_4px_15px_rgba(234,179,8,0.3)]';
    if (isAIWinner) return 'text-rose-500 drop-shadow-[0_4px_15px_rgba(239,68,68,0.3)]';
    return 'text-slate-300 drop-shadow-[0_4px_15px_rgba(203,213,225,0.3)]';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col justify-center items-center px-4 py-8 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl text-center"
      >
        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-block">
          MATCH FINISHED
        </span>

        <h1 className={`text-4xl md:text-5xl font-black tracking-tighter uppercase mt-2 mb-4 ${getBannerColor()}`}>
          {getMatchVerdict()}
        </h1>

        <p className="text-slate-400 text-sm md:text-base leading-relaxed px-4 mb-8">
          {getSubCommentary()}
        </p>

        {/* Dynamic score summary display board */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 mb-8 shadow-inner max-w-xs mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs tracking-widest uppercase text-slate-500 font-bold mb-2">
            <span>Home</span>
            <span>Vs</span>
            <span>Guest</span>
          </div>

          <div className="flex justify-between items-center px-4">
            <div className="flex flex-col items-center">
              <span className="w-4 h-4 bg-blue-500 rounded-full border border-white mb-1 shadow-sm" />
              <span className="text-sm font-semibold text-slate-300">USER</span>
            </div>

            <div className="flex items-center gap-4 text-4xl md:text-5xl font-black font-mono text-yellow-400">
              <span>{userScore}</span>
              <span className="text-slate-600 text-3xl">:</span>
              <span>{aiScore}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="w-4 h-4 bg-red-500 rounded-full border border-white mb-1 shadow-sm" />
              <span className="text-sm font-semibold text-slate-300">AI FC</span>
            </div>
          </div>
        </div>

        {/* Stats Table Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-xs font-mono">
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-center gap-2.5">
            <Users size={16} className="text-slate-500" />
            <div className="text-left">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">MATCH FORMAT</span>
              <span className="text-slate-200 font-semibold">5v5 Football</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 flex items-center gap-2.5">
            {difficulty === 'easy' ? (
              <Shield size={16} className="text-emerald-400" />
            ) : difficulty === 'medium' ? (
              <Trophy size={16} className="text-yellow-400" />
            ) : (
              <Flame size={16} className="text-rose-500" />
            )}
            <div className="text-left">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">DIFFICULTY</span>
              <span className="text-slate-200 font-semibold uppercase">{difficulty}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3">
          <button
            id="restartBtn"
            onClick={onRestart}
            className="w-full bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 transform hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <RefreshCw size={18} className="animate-spin-slow text-slate-950 font-black" /> PLAY AGAIN
          </button>

          <button
            onClick={onGoHome}
            className="w-full bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-850 hover:border-slate-800 font-semibold py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to Main Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
};
