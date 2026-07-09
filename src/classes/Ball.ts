import { Player } from './Player';

export class Ball {
  public x: number;
  public y: number;
  public radius: number = 8;
  public speed: number = 9;
  public isMoving: boolean = false;
  public owner: Player | null = null;
  public target: Player | null = null;
  
  // Cooldown tracking to prevent kicker from instantly re-posessing the ball
  public lastKicker: Player | null = null;
  public lastKickedTime: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update() {
    // 1. If ball is owned, follow the owner
    if (this.owner && !this.isMoving) {
      // Symmetrical ball placement based on team
      const offset = this.owner.team === 'blue' ? 14 : -14;
      this.x = this.owner.x + offset;
      this.y = this.owner.y;
    }

    // 2. Controlled targeted pass (used by AI or targeted passes)
    if (this.isMoving && this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.speed) {
        this.giveTo(this.target);
      } else {
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 1. Draw Ball Shadow
    ctx.beginPath();
    ctx.arc(this.x + 3, this.y + 4, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();

    // 2. Draw Ball Outer Body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Draw Retro Soccer Ball Pentagon Patterns
    // Center pentagon
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    const rInner = this.radius * 0.35;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const px = this.x + Math.cos(angle) * rInner;
      const py = this.y + Math.sin(angle) * rInner;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Outer edge lines to make it look realistic
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(this.x + Math.cos(angle) * rInner, this.y + Math.sin(angle) * rInner);
      ctx.lineTo(this.x + Math.cos(angle) * this.radius, this.y + Math.sin(angle) * this.radius);
      ctx.stroke();
    }
  }

  giveTo(player: Player) {
    if (this.owner) {
      this.owner.hasBall = false;
    }

    this.owner = player;
    player.hasBall = true;
    this.isMoving = false;
    this.target = null;
  }

  kick(kicker: Player) {
    if (this.owner) {
      this.owner.hasBall = false;
    }
    this.lastKicker = kicker;
    this.lastKickedTime = Date.now();
    this.owner = null;
    this.isMoving = true;
    this.target = null;
  }
}
