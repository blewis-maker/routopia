import { AnimationOptions, GestureHandler, AccessibilityConfig } from '@/types/ui';

interface AnimationState {
  id: string;
  startTime: number;
  duration: number;
  easing: (t: number) => number;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

export class AnimationSystem {
  private animations: Map<string, AnimationState>;
  private gestureHandler: GestureHandler;
  private accessibilityConfig: AccessibilityConfig;
  private animationFrame: number | null;

  constructor() {
    this.animations = new Map();
    this.gestureHandler = new GestureHandler();
    this.accessibilityConfig = this.initializeAccessibility();
    this.animationFrame = null;
    this.startAnimationLoop();
  }

  addAnimation(
    id: string,
    options: AnimationOptions,
    onUpdate: (progress: number) => void,
    onComplete?: () => void
  ): void {
    this.animations.set(id, {
      id,
      startTime: performance.now(),
      duration: options.duration,
      easing: options.easing || (t => t),
      onUpdate,
      onComplete
    });
  }

  removeAnimation(id: string): void {
    this.animations.delete(id);
  }

  pauseAll(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  resumeAll(): void {
    if (!this.animationFrame) {
      this.startAnimationLoop();
    }
  }

  private startAnimationLoop(): void {
    const update = (timestamp: number) => {
      this.animations.forEach((animation, id) => {
        const elapsed = timestamp - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        
        animation.onUpdate(animation.easing(progress));
        
        if (progress >= 1) {
          animation.onComplete?.();
          this.animations.delete(id);
        }
      });

      this.animationFrame = requestAnimationFrame(update);
    };

    this.animationFrame = requestAnimationFrame(update);
  }

  private initializeAccessibility(): AccessibilityConfig {
    return {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      screenReader: false // Detect screen reader when possible
    };
  }
} 