import React, { useEffect, useRef, useState } from 'react';
import { Player } from '../classes/Player';
import { Ball } from '../classes/Ball';
import { Difficulty, Team } from '../types';
import { sound } from '../utils/sound';

interface PitchCanvasProps {
  difficulty: Difficulty;
  isPaused: boolean;
  userScore: number;
  aiScore: number;
  onGoal: (scorer: Team) => void;
  onPlayerSwitch: (index: number) => void;
  currentPlayerIndex: number;
  triggerPass: number;
  triggerShoot: number;
  triggerTackle: number;
  triggerSwitch: number;
  triggerKickoffSignal: number;
}

export const PitchCanvas: React.FC<PitchCanvasProps> = ({
  difficulty,
  isPaused,
  userScore,
  aiScore,
  onGoal,
  onPlayerSwitch,
  currentPlayerIndex,
  triggerPass,
  triggerShoot,
  triggerTackle,
  triggerSwitch,
  triggerKickoffSignal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Refs for game state objects to keep them stable and fast in 60fps loop
  const userTeamRef = useRef<Player[]>([]);
  const aiTeamRef = useRef<Player[]>([]);
  const ballRef = useRef<Ball>(new Ball(500, 300));
  
  // Ball velocity vectors
  const ballVXRef = useRef<number>(0);
  const ballVYRef = useRef<number>(0);

  // Keyboard state ref
  const keysRef = useRef<Record<string, boolean>>({});

  // Scorer flash overlays
  const [goalOverlay, setGoalOverlay] = useState<Team | null>(null);
  const goalScoredRef = useRef(false);
  const ticksRef = useRef(0);

  // Constants
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 600;
  const BALL_FRICTION = 0.965;
  const PASS_POWER = 9;
  const SHOOT_POWER = 14;

  // Formation layouts
  const userFormation = [
    { x: 100, y: 300, pos: 'GK' as const },
    { x: 260, y: 170, pos: 'DEF' as const },
    { x: 260, y: 430, pos: 'DEF' as const },
    { x: 440, y: 300, pos: 'MID' as const },
    { x: 620, y: 300, pos: 'ST' as const },
  ];

  const aiFormation = [
    { x: 900, y: 300, pos: 'GK' as const },
    { x: 740, y: 170, pos: 'DEF' as const },
    { x: 740, y: 430, pos: 'DEF' as const },
    { x: 560, y: 300, pos: 'MID' as const },
    { x: 380, y: 300, pos: 'ST' as const },
  ];

  // Difficulty parameters multiplier
  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy':
        return { aiSpeed: 1.6, aiPassChance: 0.003, aiTackleRange: 22, aiReactionError: 15 };
      case 'medium':
        return { aiSpeed: 1.9, aiPassChance: 0.004, aiTackleRange: 23, aiReactionError: 10 };
      case 'hard':
        return { aiSpeed: 2.25, aiPassChance: 0.009, aiTackleRange: 27, aiReactionError: 2 };
    }
  };

  // 1. Kickoff setup
  const performKickoff = (kickingTeam: Team) => {
    // Whistle sound
    sound.playWhistle();

    // Reset User coordinates
    userTeamRef.current = userFormation.map(
      (f, i) => new Player(f.x, f.y, 'blue', f.pos)
    );

    // Reset AI coordinates
    const aiSettings = getDifficultySettings();
    aiTeamRef.current = aiFormation.map(
      (f, i) => {
        const p = new Player(f.x, f.y, 'red', f.pos);
        p.speed = aiSettings.aiSpeed;
        return p;
      }
    );

    // Reset Ball
    ballRef.current = new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ballVXRef.current = 0;
    ballVYRef.current = 0;

    // Reset control selection
    onPlayerSwitch(4); // Default to striker

    // Assign Ball possession
    if (kickingTeam === 'blue') {
      ballRef.current.giveTo(userTeamRef.current[4]);
    } else {
      ballRef.current.giveTo(aiTeamRef.current[4]);
    }
  };

  // Run Kickoff on initial boot or manual trigger signals
  useEffect(() => {
    performKickoff(userScore >= aiScore ? 'blue' : 'red');
  }, [triggerKickoffSignal]);

  // Handle mobile action trigger bridges
  useEffect(() => {
    if (triggerPass > 0) handlePass();
  }, [triggerPass]);

  useEffect(() => {
    if (triggerShoot > 0) handleShoot();
  }, [triggerShoot]);

  useEffect(() => {
    if (triggerTackle > 0) handleTackle();
  }, [triggerTackle]);

  useEffect(() => {
    if (triggerSwitch > 0) handleSwitchPlayer();
  }, [triggerSwitch]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;

      // Disable scrolling behavior for standard navigation keys
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Actions
      if (key === ' ' || key === 'j') {
        e.preventDefault();
        handlePass();
      }
      if (key === 'f' || key === 'l') {
        handleShoot();
      }
      if (key === 'e' || key === 'k') {
        handleTackle();
      }
      if (key === 'q' || key === 'i') {
        handleSwitchPlayer();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentPlayerIndex]);

  // ==========================================
  // ACTION IMPLEMENTATIONS
  // ==========================================

  // PASS
  const handlePass = () => {
    if (isPaused || goalOverlay) return;

    const passer = userTeamRef.current[currentPlayerIndex];
    const ball = ballRef.current;

    if (ball.owner !== passer) return;

    // Find passing direction vector based on user keys
    let dirX = 0;
    let dirY = 0;
    if (keysRef.current['w'] || keysRef.current['arrowup']) dirY -= 1;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) dirY += 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) dirX -= 1;
    if (keysRef.current['d'] || keysRef.current['arrowright']) dirX += 1;

    let bestTeammate = null;

    if (dirX !== 0 || dirY !== 0) {
      // Find teammate that sits closest to our movement/aiming direction vector
      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      const aimDX = dirX / len;
      const aimDY = dirY / len;

      let bestScore = -Infinity;

      userTeamRef.current.forEach((teammate) => {
        if (teammate === passer) return;
        const toX = teammate.x - passer.x;
        const toY = teammate.y - passer.y;
        const dist = Math.sqrt(toX * toX + toY * toY);
        
        // Dot product between aim vector and normalized target teammate vector
        const dot = (toX / dist) * aimDX + (toY / dist) * aimDY;
        
        // Weight by dot product and subtract a small penalty for distance
        const score = dot * 1000 - dist * 0.2;
        if (score > bestScore) {
          bestScore = score;
          bestTeammate = teammate;
        }
      });
    }

    // Fallback if not aiming: pass to nearest teammate
    if (!bestTeammate) {
      let minDist = Infinity;
      userTeamRef.current.forEach((teammate) => {
        if (teammate === passer) return;
        const dx = teammate.x - passer.x;
        const dy = teammate.y - passer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          bestTeammate = teammate;
        }
      });
    }

    if (bestTeammate) {
      // Perform kick
      const receiver: Player = bestTeammate;
      sound.playKick();
      ball.kick(passer);
      
      const dx = receiver.x - ball.x;
      const dy = receiver.y - ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      ballVXRef.current = (dx / dist) * PASS_POWER;
      ballVYRef.current = (dy / dist) * PASS_POWER;
    }
  };

  // SHOOT
  const handleShoot = () => {
    if (isPaused || goalOverlay) return;

    const shooter = userTeamRef.current[currentPlayerIndex];
    const ball = ballRef.current;

    if (ball.owner !== shooter) return;

    sound.playKick();
    ball.kick(shooter);

    // Aim towards red (opponent) goal nets
    // Net center is roughly (985, 300)
    let targetY = 300;
    
    // Allow user to aim upper or lower corners based on keys
    if (keysRef.current['w'] || keysRef.current['arrowup']) {
      targetY = 265; // Upper post area
    } else if (keysRef.current['s'] || keysRef.current['arrowdown']) {
      targetY = 335; // Lower post area
    } else {
      // Small random spread so shoots aren't perfectly robotic
      targetY = 275 + Math.random() * 50;
    }

    const dx = 985 - ball.x;
    const dy = targetY - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    ballVXRef.current = (dx / dist) * SHOOT_POWER;
    ballVYRef.current = (dy / dist) * SHOOT_POWER;
  };

  // TACKLE (USER ACTION)
  const handleTackle = () => {
    if (isPaused || goalOverlay) return;

    const tackler = userTeamRef.current[currentPlayerIndex];
    const ball = ballRef.current;

    // Tackler can only tackle if they are not already the owner
    if (ball.owner && ball.owner.team === 'red') {
      const dx = ball.owner.x - tackler.x;
      const dy = ball.owner.y - tackler.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 36) {
        sound.playTackle();
        ball.giveTo(tackler);
        onPlayerSwitch(currentPlayerIndex);
      }
    }
  };

  // MANUAL SWITCH PLAYER (USER ACTION)
  const handleSwitchPlayer = () => {
    if (isPaused || goalOverlay) return;

    // Switch selection to the outfield player closest to the ball
    const ball = ballRef.current;
    let bestIndex = currentPlayerIndex;
    let minDist = Infinity;

    userTeamRef.current.forEach((player, idx) => {
      if (player.position === 'GK') return; // GK is auto-managed generally
      const dx = player.x - ball.x;
      const dy = player.y - ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist && idx !== currentPlayerIndex) {
        minDist = dist;
        bestIndex = idx;
      }
    });

    onPlayerSwitch(bestIndex);
  };

  // ==========================================
  // PHYSICS & COLLISION SIMULATION ENGINE
  // ==========================================

  const keepBallInsideField = (ball: Ball) => {
    // Upper bounds
    if (ball.y < 35) {
      ball.y = 35;
      ballVYRef.current *= -0.4;
    }
    // Lower bounds
    if (ball.y > CANVAS_HEIGHT - 35) {
      ball.y = CANVAS_HEIGHT - 35;
      ballVYRef.current *= -0.4;
    }
    // Left boundary (non-goalposts)
    if (ball.x < 30) {
      const isInsideGoalY = ball.y >= 250 && ball.y <= 350;
      if (!isInsideGoalY) {
        ball.x = 30;
        ballVXRef.current *= -0.4;
      }
    }
    // Right boundary (non-goalposts)
    if (ball.x > CANVAS_WIDTH - 30) {
      const isInsideGoalY = ball.y >= 250 && ball.y <= 350;
      if (!isInsideGoalY) {
        ball.x = CANVAS_WIDTH - 30;
        ballVXRef.current *= -0.4;
      }
    }
  };

  const handlePlayerCollisions = () => {
    const allPlayers = [...userTeamRef.current, ...aiTeamRef.current];
    const len = allPlayers.length;

    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const p1 = allPlayers[i];
        const p2 = allPlayers[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          // Softly push apart
          const pushX = (dx / dist) * overlap * 0.2;
          const pushY = (dy / dist) * overlap * 0.2;

          p1.x -= pushX;
          p1.y -= pushY;
          p2.x += pushX;
          p2.y += pushY;
        }
      }
    }
  };

  // Free Ball possession auto-capture checks
  const checkFreeBallPossession = (ball: Ball) => {
    let nearestPlayer: Player | null = null;
    let minDistance = Infinity;

    const allPlayers = [...userTeamRef.current, ...aiTeamRef.current];
    allPlayers.forEach((player) => {
      const dx = player.x - ball.x;
      const dy = player.y - ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance) {
        minDistance = dist;
        nearestPlayer = player;
      }
    });

    if (nearestPlayer && minDistance < 22) {
      // Cooldown prevention: last kicker cannot instantly repossess within 400ms
      const kickerCooldown =
        ball.lastKicker === nearestPlayer && Date.now() - ball.lastKickedTime < 400;

      if (!kickerCooldown) {
        ball.giveTo(nearestPlayer);
        
        // Auto-switch user control to the blue player who intercepted/possesses the ball
        if (nearestPlayer.team === 'blue') {
          const idx = userTeamRef.current.indexOf(nearestPlayer);
          if (idx !== -1) {
            onPlayerSwitch(idx);
          }
        }
      }
    }
  };

  // Goal scorer netting checks
  const checkGoalScored = (ball: Ball) => {
    if (goalScoredRef.current) return;

    const GOAL_TOP = 250;
    const GOAL_BOTTOM = 350;

    if (ball.x <= 15 && ball.y >= GOAL_TOP && ball.y <= GOAL_BOTTOM) {
      triggerGoal('red');
      return;
    }

    if (ball.x >= CANVAS_WIDTH - 15 && ball.y >= GOAL_TOP && ball.y <= GOAL_BOTTOM) {
      triggerGoal('blue');
      return;
    }
  };

  const triggerGoal = (scorer: Team) => {
    if (goalScoredRef.current) return;
    goalScoredRef.current = true;

    setGoalOverlay(scorer);
    sound.playGoal();
    onGoal(scorer);

    setTimeout(() => {
      goalScoredRef.current = false;
      setGoalOverlay(null);
      performKickoff(scorer === 'blue' ? 'red' : 'blue');
    }, 2000);
  };

  // ==========================================
  // AI SIMULATION ALGORITHMS
  // ==========================================

  const simulateAI = (ball: Ball, aiSettings: ReturnType<typeof getDifficultySettings>) => {
    // ------------------------------------------
    // A. GOALKEEPER AI BEHAVIOR (Index 0)
    // ------------------------------------------
    const blueGK = userTeamRef.current[0];
    const redGK = aiTeamRef.current[0];

    // 1. Manage Blue GK (User)
    if (currentPlayerIndex !== 0) {
      const gkDistToBall = Math.sqrt((ball.x - blueGK.x) ** 2 + (ball.y - blueGK.y) ** 2);
      if (gkDistToBall < 80 && ball.owner?.team !== 'blue') {
        // Charge at ball to clear it!
        const dx = ball.x - blueGK.x;
        const dy = ball.y - blueGK.y;
        blueGK.x += (dx / gkDistToBall) * blueGK.speed;
        blueGK.y += (dy / gkDistToBall) * blueGK.speed;
      } else {
        // Slide to cover the goal line
        blueGK.x += (100 - blueGK.x) * 0.1;
        // Slide along Y to track ball, clamped inside the goal box
        const targetY = Math.max(250, Math.min(350, ball.y));
        blueGK.y += (targetY - blueGK.y) * 0.1;
      }

      // If Blue GK captures ball, clear it!
      if (ball.owner === blueGK) {
        sound.playKick();
        ball.kick(blueGK);
        // Kick upfield towards MID or ST
        const targetX = 400 + Math.random() * 200;
        const targetY = 100 + Math.random() * 400;
        const dx = targetX - ball.x;
        const dy = targetY - ball.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        ballVXRef.current = (dx / d) * PASS_POWER;
        ballVYRef.current = (dy / d) * PASS_POWER;
      }
    }

    // 2. Manage Red GK (AI)
    const redGKDistToBall = Math.sqrt((ball.x - redGK.x) ** 2 + (ball.y - redGK.y) ** 2);
    if (redGKDistToBall < 85 && ball.owner?.team !== 'red') {
      // Charge!
      const dx = ball.x - redGK.x;
      const dy = ball.y - redGK.y;
      redGK.x += (dx / redGKDistToBall) * redGK.speed;
      redGK.y += (dy / redGKDistToBall) * redGK.speed;
    } else {
      // Guard line
      redGK.x += (900 - redGK.x) * 0.1;
      const targetY = Math.max(250, Math.min(350, ball.y));
      redGK.y += (targetY - redGK.y) * 0.1;
    }

    // If Red GK captures ball, pass to outfield teammates immediately
    if (ball.owner === redGK) {
      // Choose receiver teammate from Red Team
      let receiver = aiTeamRef.current[1 + Math.floor(Math.random() * 4)];
      sound.playKick();
      ball.kick(redGK);
      
      const dx = receiver.x - ball.x;
      const dy = receiver.y - ball.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      ballVXRef.current = (dx / d) * PASS_POWER;
      ballVYRef.current = (dy / d) * PASS_POWER;
    }

    // ------------------------------------------
    // B. OUTFIELD AI PLAYERS (RED TEAM)
    // ------------------------------------------
    aiTeamRef.current.forEach((aiPlayer, idx) => {
      if (idx === 0) return; // Skip Goalkeeper

      // 1. AI Player HAS BALL -> Attack goal
      if (ball.owner === aiPlayer) {
        // Move towards left goal
        aiPlayer.x -= aiPlayer.speed;
        
        // Weave slightly vertically using sine curve to bypass user tackles
        aiPlayer.y += Math.sin(ticksRef.current / 15 + idx) * 0.55;

        // Shoot if inside strike zone (X < 420)
        const distToGoal = Math.sqrt((aiPlayer.x - 20) ** 2 + (aiPlayer.y - 300) ** 2);
        if (aiPlayer.x < 420 && Math.random() < 0.02) {
          // Shoot!
          sound.playKick();
          ball.kick(aiPlayer);
          
          // Randomize corner target
          const targetY = 265 + Math.random() * 70;
          const dx = 15 - ball.x;
          const dy = targetY - ball.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          ballVXRef.current = (dx / d) * SHOOT_POWER;
          ballVYRef.current = (dy / d) * SHOOT_POWER;
          return;
        }

        // Pass if teammate is in front or randomly based on difficulty
        let bestReceiver: Player | null = null;
        aiTeamRef.current.forEach((teammate, tIdx) => {
          if (tIdx === 0 || teammate === aiPlayer) return;
          // Teammate is further downfield
          if (teammate.x < aiPlayer.x) {
            if (!bestReceiver || teammate.x < bestReceiver.x) {
              bestReceiver = teammate;
            }
          }
        });

        if (bestReceiver && Math.random() < aiSettings.aiPassChance) {
          sound.playKick();
          ball.kick(aiPlayer);
          const dx = bestReceiver.x - ball.x;
          const dy = bestReceiver.y - ball.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          ballVXRef.current = (dx / d) * PASS_POWER;
          ballVYRef.current = (dy / d) * PASS_POWER;
        }
      }

      // 2. Opponent HAS BALL -> Defense chase & tackle
      else if (ball.owner && ball.owner.team === 'blue') {
        const target = ball.owner;
        const dx = target.x - aiPlayer.x;
        const dy = target.y - aiPlayer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Defensive reaction check
        if (dist < 260) {
          aiPlayer.x += (dx / dist) * aiPlayer.speed;
          aiPlayer.y += (dy / dist) * aiPlayer.speed;

          // Perform tackle
          if (dist < aiSettings.aiTackleRange) {
            sound.playTackle();
            ball.giveTo(aiPlayer);
          }
        } else {
          // Return to defensive home formations
          const home = aiFormation[idx];
          aiPlayer.x += (home.x - aiPlayer.x) * 0.015;
          aiPlayer.y += (home.y - aiPlayer.y) * 0.015;
        }
      }

      // 3. Free Ball -> Run to intercept
      else if (ball.isMoving || !ball.owner) {
        const dx = ball.x - aiPlayer.x;
        const dy = ball.y - aiPlayer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          aiPlayer.x += (dx / dist) * aiPlayer.speed;
          aiPlayer.y += (dy / dist) * aiPlayer.speed;
        } else {
          const home = aiFormation[idx];
          aiPlayer.x += (home.x - aiPlayer.x) * 0.015;
          aiPlayer.y += (home.y - aiPlayer.y) * 0.015;
        }
      }

      // 4. Default -> Return home
      else {
        const home = aiFormation[idx];
        aiPlayer.x += (home.x - aiPlayer.x) * 0.02;
        aiPlayer.y += (home.y - aiPlayer.y) * 0.02;
      }
    });

    // ------------------------------------------
    // C. USER TEAM OUTFIELD SUPPORT (AI-controlled)
    // ------------------------------------------
    userTeamRef.current.forEach((player, idx) => {
      // Skip GK (managed separately) and the currently user-controlled player
      if (idx === 0 || idx === currentPlayerIndex) return;

      const home = userFormation[idx];

      // 1. Teammate has ball -> Attack run support
      if (ball.owner && ball.owner.team === 'blue') {
        // Move slightly forward to find space
        const runX = Math.min(CANVAS_WIDTH - 100, home.x + 120);
        player.x += (runX - player.x) * 0.025;
        player.y += (home.y - player.y) * 0.025;
      }

      // 2. Opponent has ball -> Defensive backtracking/marking
      else if (ball.owner && ball.owner.team === 'red') {
        const opponent = ball.owner;
        const dx = opponent.x - player.x;
        const dy = opponent.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Track and block nearest opponent
        if (dist < 180) {
          player.x += (dx / dist) * player.speed * 0.8;
          player.y += (dy / dist) * player.speed * 0.8;

          // Defensive AI teammates can also tackle
          if (dist < 18) {
            sound.playTackle();
            ball.giveTo(player);
            // Switch user focus to this teammate since they intercepted the ball
            onPlayerSwitch(idx);
          }
        } else {
          player.x += (home.x - player.x) * 0.02;
          player.y += (home.y - player.y) * 0.02;
        }
      }

      // 3. Free ball near -> Chase ball
      else {
        const dx = ball.x - player.x;
        const dy = ball.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          player.x += (dx / dist) * player.speed * 0.85;
          player.y += (dy / dist) * player.speed * 0.85;
        } else {
          player.x += (home.x - player.x) * 0.02;
          player.y += (home.y - player.y) * 0.02;
        }
      }
    });
  };

  // ==========================================
  // RENDER PITCH CANVAS (DRAW FUNCTIONS)
  // ==========================================

  const drawPitch = (ctx: CanvasRenderingContext2D) => {
    // 1. Dynamic lawn striping patterns
    const bandsCount = 14;
    const bandWidth = CANVAS_WIDTH / bandsCount;

    for (let i = 0; i < bandsCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#1b5e20' : '#1e6823'; // Dark/light lawn green shades
      ctx.fillRect(i * bandWidth, 0, bandWidth + 1, CANVAS_HEIGHT);
    }

    // 2. White Chalk Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 4;

    // Pitch Outer border boundary
    ctx.strokeRect(30, 30, CANVAS_WIDTH - 60, CANVAS_HEIGHT - 60);

    // Halfway vertical dividing line
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 30);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
    ctx.stroke();

    // Center circular spot and ring
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    // Left Goal Nets Box
    ctx.strokeRect(30, 150, 160, 300); // Penalty Area
    ctx.strokeRect(30, 200, 60, 200);  // Goal Box

    // Right Goal Nets Box
    ctx.strokeRect(CANVAS_WIDTH - 190, 150, 160, 300); // Penalty Area
    ctx.strokeRect(CANVAS_WIDTH - 90, 200, 60, 200);   // Goal Box

    // Draw Corner Arcs
    const cornerR = 15;
    // Top-Left
    ctx.beginPath(); ctx.arc(30, 30, cornerR, 0, Math.PI / 2); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.arc(30, CANVAS_HEIGHT - 30, cornerR, 1.5 * Math.PI, 0); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.arc(CANVAS_WIDTH - 30, 30, cornerR, Math.PI / 2, Math.PI); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.arc(CANVAS_WIDTH - 30, CANVAS_HEIGHT - 30, cornerR, Math.PI, 1.5 * Math.PI); ctx.stroke();

    // 3. Real 3D physical goal posts with mesh lines
    ctx.fillStyle = '#f8fafc'; // White net framework
    ctx.lineWidth = 2;

    // Left Goal framework (behind outer boundaries)
    ctx.fillRect(10, 250, 20, 100);
    // Draw Net grid mesh inside Left goal
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    for (let y = 255; y < 350; y += 10) {
      ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(30, y); ctx.stroke();
    }
    for (let x = 12; x < 30; x += 6) {
      ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x, 350); ctx.stroke();
    }

    // Right Goal framework
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(CANVAS_WIDTH - 30, 250, 20, 100);
    // Mesh inside Right goal
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    for (let y = 255; y < 350; y += 10) {
      ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH - 30, y); ctx.lineTo(CANVAS_WIDTH - 10, y); ctx.stroke();
    }
    for (let x = CANVAS_WIDTH - 28; x < CANVAS_WIDTH - 10; x += 6) {
      ctx.beginPath(); ctx.moveTo(x, 250); ctx.lineTo(x, 350); ctx.stroke();
    }

    // Goal Post White Pipes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(28, 246, 4, 8); // Top Post Left
    ctx.fillRect(28, 346, 4, 8); // Bottom Post Left
    ctx.fillRect(CANVAS_WIDTH - 32, 246, 4, 8); // Top Post Right
    ctx.fillRect(CANVAS_WIDTH - 32, 346, 4, 8); // Bottom Post Right
  };

  // ==========================================
  // MASTER GAME TICK LOOP
  // ==========================================

  useEffect(() => {
    const loop = () => {
      if (isPaused || goalOverlay) {
        // Still draw but pause mechanics
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawPitch(ctx);
            userTeamRef.current.forEach((player, i) =>
              player.draw(ctx, i === currentPlayerIndex)
            );
            aiTeamRef.current.forEach((player) => player.draw(ctx, false));
            ballRef.current.draw(ctx);
          }
        }
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      ticksRef.current++;

      // 1. Move User Player
      userTeamRef.current.forEach((player, i) =>
        player.update(keysRef.current, i === currentPlayerIndex, CANVAS_WIDTH, CANVAS_HEIGHT)
      );

      // 2. Physics & Mechanics Updates
      const ball = ballRef.current;
      ball.update();

      // Free Ball vector physics with friction decay
      if (ball.isMoving && !ball.target) {
        ball.x += ballVXRef.current;
        ball.y += ballVYRef.current;

        ballVXRef.current *= BALL_FRICTION;
        ballVYRef.current *= BALL_FRICTION;

        // Stopped ball possession handoff
        if (Math.abs(ballVXRef.current) < 0.12 && Math.abs(ballVYRef.current) < 0.12) {
          ball.isMoving = false;
          ballVXRef.current = 0;
          ballVYRef.current = 0;
        }
      }

      // Check intercept/possession on every frame for a free moving ball
      if (!ball.owner) {
        checkFreeBallPossession(ball);
      }

      // 3. AI Updates (Goalkeepers, Opponents, User Support)
      const aiSettings = getDifficultySettings();
      simulateAI(ball, aiSettings);

      // 4. Resolve Collisions (boundaries, soccer goals, player-player overlays)
      keepBallInsideField(ball);
      handlePlayerCollisions();
      checkGoalScored(ball);

      // 5. Draw Frame
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          
          // Draw field
          drawPitch(ctx);

          // Draw players (with shadow inside class)
          userTeamRef.current.forEach((player, i) =>
            player.draw(ctx, i === currentPlayerIndex)
          );
          aiTeamRef.current.forEach((player) => player.draw(ctx, false));

          // Draw ball
          ball.draw(ctx);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, currentPlayerIndex, difficulty, goalOverlay]);

  return (
    <div className="relative w-full overflow-hidden select-none touch-none">
      <canvas
        id="pocket_football_canvas"
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto bg-emerald-950 rounded-2xl border-4 border-slate-900 shadow-2xl block"
      />

      {/* Goal Scored Animated overlay */}
      {goalOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="text-center transform scale-110 animate-bounce">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-widest text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] uppercase">
              GOAL!!
            </h1>
            <p className="text-xl md:text-2xl mt-4 font-bold text-white uppercase tracking-wider drop-shadow-md">
              {goalOverlay === 'blue' ? 'USER FC Scores!' : 'AI FC Scores!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
