export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameState = 'HOME' | 'GAME' | 'RESULT';

export type Team = 'blue' | 'red';

export type Position = 'GK' | 'DEF' | 'MID' | 'ST';

export interface PlayerState {
  x: number;
  y: number;
  team: Team;
  position: Position;
  radius: number;
  speed: number;
  hasBall: boolean;
}

export interface BallState {
  x: number;
  y: number;
  radius: number;
  speed: number;
  isMoving: boolean;
  owner: PlayerState | null;
  target: PlayerState | null;
}
