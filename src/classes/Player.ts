import { Team, Position } from '../types';

export class Player {
  public x: number;
  public y: number;
  public team: Team;
  public position: Position;
  public radius: number = 16;
  public speed: number;
  public hasBall: boolean = false;

  constructor(x: number, y: number, team: Team, position: Position) {
    this.x = x;
    this.y = y;
    this.team = team;
    this.position = position;
    // User players have speed 3.2, AI players can have customized speed depending on difficulty
    this.speed = team === 'blue' ? 3.2 : 2.0;
  }

  update(
    keys: Record<string, boolean>,
    isControlled: boolean,
    canvasWidth: number,
    canvasHeight: number
  ) {
    // Only move if controlled by user
    if (this.team === 'blue' && isControlled) {
      let dx = 0;
      let dy = 0;

      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      this.x += dx * this.speed;
      this.y += dy * this.speed;
    }

    // Keep players inside the pitch margins
    // The inner border is drawn at (20, 20) to (width - 20, height - 20)
    // We keep players inside with some margin
    const minX = 35;
    const maxX = canvasWidth - 35;
    const minY = 35;
    const maxY = canvasHeight - 35;

    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));
  }

  draw(ctx: CanvasRenderingContext2D, isControlled: boolean) {
    // 1. Draw Player Shadow
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, this.radius * 0.9, this.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();

    // 2. Controlled Ring Indicator
    if (this.team === 'blue' && isControlled) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)'; // Yellow ring
      ctx.lineWidth = 3;
      ctx.stroke();

      // Small directional indicator above player
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.radius - 12);
      ctx.lineTo(this.x - 5, this.y - this.radius - 18);
      ctx.lineTo(this.x + 5, this.y - this.radius - 18);
      ctx.closePath();
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    }

    // 3. Draw Player Circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    
    // Gradient fill for sleek, professional 3D sphere look
    const grad = ctx.createRadialGradient(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      2,
      this.x,
      this.y,
      this.radius
    );
    
    if (this.team === 'blue') {
      grad.addColorStop(0, '#60a5fa'); // Light blue
      grad.addColorStop(1, '#1d4ed8'); // Dark blue
    } else {
      grad.addColorStop(0, '#f87171'); // Light red
      grad.addColorStop(1, '#b91c1c'); // Dark red
    }
    
    ctx.fillStyle = grad;
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. Draw Player Position Text Label
    ctx.font = 'bold 10px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.position, this.x, this.y + 1);
  }
}
