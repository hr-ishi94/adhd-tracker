import type { RoutineBlock } from '../types';
import { timeToMinutes } from './time';

class NotificationService {
  private scheduledTimeouts: number[] = [];
  private audioContext: AudioContext | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }

  public playGentleChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      // Gentle, calm 2-tone chime (440Hz -> 554.37Hz, A4 to C#5 major third)
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.15);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch (err) {
      console.debug('Audio chime unable to play:', err);
    }
  }

  public showNotification(
    title: string,
    body: string,
    onTap?: () => void
  ): void {
    this.playGentleChime();

    if (this.getPermission() === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          silent: true, // We handle gentle sound ourselves to avoid jarring system beeps
        });

        notif.onclick = () => {
          window.focus();
          if (onTap) onTap();
          notif.close();
        };
      } catch (err) {
        console.warn('System notification failed, falling back to banner:', err);
      }
    }
  }

  public notifyBlockStart(block: RoutineBlock): void {
    // "Plain, factual tone — no exclamation points, no guilt." (SPEC §4.4)
    const title = `It's ${block.name} time`;
    const body = `Scheduled from ${block.startTime} to ${block.endTime}.`;
    this.showNotification(title, body);
  }

  public scheduleRoutineChecks(
    blocks: RoutineBlock[],
    onTriggerBlock: (block: RoutineBlock) => void
  ): void {
    // Clear previous timeouts
    this.clearScheduled();

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    blocks.forEach((block) => {
      const blockMins = timeToMinutes(block.startTime);
      let diffMins = blockMins - currentMins;
      if (diffMins < 0) {
        diffMins += 1440; // Tomorrow
      }

      if (diffMins > 0 && diffMins <= 1440) {
        const delayMs = diffMins * 60 * 1000 - (now.getSeconds() * 1000);
        if (delayMs > 0) {
          const timer = window.setTimeout(() => {
            onTriggerBlock(block);
          }, delayMs);
          this.scheduledTimeouts.push(timer);
        }
      }
    });
  }

  public clearScheduled(): void {
    this.scheduledTimeouts.forEach((t) => clearTimeout(t));
    this.scheduledTimeouts = [];
  }
}

export const notifications = new NotificationService();
