import { useState, useEffect } from 'react';
import { GameState, Difficulty, Team } from './types';
import { HomeScreen } from './components/HomeScreen';
import { Scoreboard } from './components/Scoreboard';
import { PitchCanvas } from './components/PitchCanvas';
import { OnscreenControls } from './components/OnscreenControls';
import { ResultScreen } from './components/ResultScreen';
import { sound } from './utils/sound';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [userScore, setUserScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  
  // 3 minutes (180 seconds) standard match length
  const TOTAL_MATCH_TIME = 180;
  const [matchTime, setMatchTime] = useState<number>(TOTAL_MATCH_TIME);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(4);

  // Trigger counters to bridge parent UI buttons to the Canvas simulation loop
  const [triggerPass, setTriggerPass] = useState<number>(0);
  const [triggerShoot, setTriggerShoot] = useState<number>(0);
  const [triggerTackle, setTriggerTackle] = useState<number>(0);
  const [triggerSwitch, setTriggerSwitch] = useState<number>(0);
  
  // Signals kickoff reset
  const [triggerKickoffSignal, setTriggerKickoffSignal] = useState<number>(0);

  // Match countdown timer loop
  useEffect(() => {
    if (gameState !== 'GAME' || isPaused) return;

    const timer = setInterval(() => {
      setMatchTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sound.playWhistle();
          setGameState('RESULT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isPaused]);

  // ==========================================
  // ACTION DISPATCHERS (MOBILE / TOUCH COMPONENT)
  // ==========================================

  const handlePass = () => {
    setTriggerPass((p) => p + 1);
  };

  const handleShoot = () => {
    setTriggerShoot((s) => s + 1);
  };

  const handleTackle = () => {
    setTriggerTackle((t) => t + 1);
  };

  const handleSwitchPlayer = () => {
    setTriggerSwitch((sw) => sw + 1);
  };

  // ==========================================
  // MATCH LIFECYCLE HANDLERS
  // ==========================================

  const handleStartMatch = () => {
    setUserScore(0);
    setAiScore(0);
    setMatchTime(TOTAL_MATCH_TIME);
    setIsPaused(false);
    setCurrentPlayerIndex(4);
    setGameState('GAME');
    
    // Trigger canvas kickoff
    setTriggerKickoffSignal((prev) => prev + 1);
  };

  const handleForfeitMatch = () => {
    sound.playWhistle();
    setGameState('RESULT');
  };

  const handleGoalScored = (scorer: Team) => {
    if (scorer === 'blue') {
      setUserScore((s) => s + 1);
    } else {
      setAiScore((s) => s + 1);
    }
  };

  const handlePauseToggle = () => {
    setIsPaused((p) => !p);
  };

  const handleReturnToMenu = () => {
    setGameState('HOME');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col overflow-x-hidden antialiased select-none font-sans">
      <AnimatePresence mode="wait">
        {gameState === 'HOME' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <HomeScreen
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              onStartMatch={handleStartMatch}
            />
          </motion.div>
        )}

        {gameState === 'GAME' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col bg-slate-950"
          >
            {/* Header Score HUD */}
            <Scoreboard
              userScore={userScore}
              aiScore={aiScore}
              matchTime={matchTime}
              totalMatchTime={TOTAL_MATCH_TIME}
              difficulty={difficulty}
              isPaused={isPaused}
              onPauseToggle={handlePauseToggle}
              onForfeitMatch={handleForfeitMatch}
            />

            {/* Game Canvas container */}
            <div className="flex-1 flex items-center justify-center bg-slate-950/40 px-1 py-1 md:p-3">
  <div className="w-full max-w-6xl relative">
                <PitchCanvas
                  difficulty={difficulty}
                  isPaused={isPaused}
                  userScore={userScore}
                  aiScore={aiScore}
                  onGoal={handleGoalScored}
                  onPlayerSwitch={setCurrentPlayerIndex}
                  currentPlayerIndex={currentPlayerIndex}
                  triggerPass={triggerPass}
                  triggerShoot={triggerShoot}
                  triggerTackle={triggerTackle}
                  triggerSwitch={triggerSwitch}
                  triggerKickoffSignal={triggerKickoffSignal}
                />

                {/* Pause Cover Overlay */}
                {isPaused && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-2xl flex flex-col justify-center items-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase mb-4 animate-pulse">
                      Match Paused
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base font-medium max-w-xs text-center leading-relaxed">
                      Click the yellow play button or press pause in the header HUD to resume action.
                    </p>
                    <button
                      onClick={handlePauseToggle}
                      className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg cursor-pointer transition-all uppercase tracking-wide text-sm active:scale-95"
                    >
                      Resume Match
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tactical Game pad controllers */}
            <OnscreenControls
              onPassClick={handlePass}
              onShootClick={handleShoot}
              onTackleClick={handleTackle}
              onSwitchClick={handleSwitchPlayer}
            />
          </motion.div>
        )}

        {gameState === 'RESULT' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ResultScreen
              userScore={userScore}
              aiScore={aiScore}
              difficulty={difficulty}
              onRestart={handleStartMatch}
              onGoHome={handleReturnToMenu}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
