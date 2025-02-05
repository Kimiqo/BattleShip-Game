export default class AudioManager {
    static sounds = {
        hit: new Audio('/sounds/hit.mp3'),
        miss: new Audio('/sounds/miss.mp3')
    };

    static lastPlayTime = {
        hit: 0,
        miss: 0
    };

    static COOLDOWN = 300; // 300ms cooldown between sounds

    static init() {
        // Pre-load all sounds
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.5;
        });
    }

    static play(soundName) {
        const sound = this.sounds[soundName];
        if (!sound) return;

        const now = Date.now();
        const lastPlay = this.lastPlayTime[soundName] || 0;

        // Check if enough time has passed since last play
        if (now - lastPlay >= this.COOLDOWN) {
            sound.currentTime = 0; // Reset the sound
            sound.play().catch(e => console.log('Audio playback failed:', e));
            this.lastPlayTime[soundName] = now;
        }
    }

    static setVolume(volume) {
        Object.values(this.sounds).forEach(sound => {
            sound.volume = volume;
        });
    }
}
