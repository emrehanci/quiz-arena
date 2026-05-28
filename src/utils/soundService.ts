/**
 * Sound Service
 * Handles playing audio files in the application
 */

class SoundService {
  private successSound: HTMLAudioElement;
  private failSound: HTMLAudioElement;
  private victorySound: HTMLAudioElement;
  private clockSound: HTMLAudioElement;
  private openSound: HTMLAudioElement;
  private startSound: HTMLAudioElement;
  private jokerSound: HTMLAudioElement;

  constructor() {
    this.successSound = new Audio('/success.mp3');
    this.failSound = new Audio('/fail.mp3');
    this.victorySound = new Audio('/victory.mp3');
    this.clockSound = new Audio('/clock.mp3');
    this.openSound = new Audio('/open.mp3');
    this.startSound = new Audio('/start.mp3');
    this.jokerSound = new Audio('/joker.mp3');
    
    // Preload sounds
    this.successSound.load();
    this.failSound.load();
    this.victorySound.load();
    this.clockSound.load();
    this.openSound.load();
    this.startSound.load();
    this.jokerSound.load();
  }

  /**
   * Play success sound for correct answers
   */
  playSuccess(): void {
    this.successSound.currentTime = 0; // Reset to start
    this.successSound.play().catch(error => {
      console.warn('Could not play success sound:', error);
    });
  }

  /**
   * Play fail sound for wrong answers
   */
  playFail(): void {
    this.failSound.currentTime = 0; // Reset to start
    this.failSound.play().catch(error => {
      console.warn('Could not play fail sound:', error);
    });
  }

  /**
   * Play victory sound for game completion
   */
  playVictory(): void {
    this.victorySound.currentTime = 0; // Reset to start
    this.victorySound.play().catch(error => {
      console.warn('Could not play victory sound:', error);
    });
  }

  /**
   * Play clock sound for timer warning
   */
  playClock(): void {
    this.clockSound.currentTime = 0; // Reset to start
    this.clockSound.play().catch(error => {
      console.warn('Could not play clock sound:', error);
    });
  }

  /**
   * Play open sound when question opens
   */
  playOpen(): void {
    this.openSound.currentTime = 0; // Reset to start
    this.openSound.play().catch(error => {
      console.warn('Could not play open sound:', error);
    });
  }

  /**
   * Play start sound when game begins
   */
  playStart(): void {
    this.startSound.currentTime = 0; // Reset to start
    this.startSound.play().catch(error => {
      console.warn('Could not play start sound:', error);
    });
  }

  /**
   * Play joker sound when a joker is used
   */
  playJoker(): void {
    this.jokerSound.currentTime = 0; // Reset to start
    this.jokerSound.play().catch(error => {
      console.warn('Could not play joker sound:', error);
    });
  }

  /**
   * Set volume for all sounds (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.successSound.volume = clampedVolume;
    this.failSound.volume = clampedVolume;
    this.victorySound.volume = clampedVolume;
    this.clockSound.volume = clampedVolume;
    this.openSound.volume = clampedVolume;
    this.startSound.volume = clampedVolume;
    this.jokerSound.volume = clampedVolume;
  }

  /**
   * Mute all sounds
   */
  mute(): void {
    this.successSound.muted = true;
    this.failSound.muted = true;
    this.victorySound.muted = true;
    this.clockSound.muted = true;
    this.openSound.muted = true;
    this.startSound.muted = true;
    this.jokerSound.muted = true;
  }

  /**
   * Unmute all sounds
   */
  unmute(): void {
    this.successSound.muted = false;
    this.failSound.muted = false;
    this.victorySound.muted = false;
    this.clockSound.muted = false;
    this.openSound.muted = false;
    this.startSound.muted = false;
    this.jokerSound.muted = false;
  }
}

// Create singleton instance
export const soundService = new SoundService();
