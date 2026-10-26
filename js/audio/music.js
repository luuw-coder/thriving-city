// Trình phát nhạc. Nhạc có sẵn khai báo ở js/data/music.js; nhạc nạp từ máy chỉ sống trong phiên chơi.
Game.music = {
  tracks: [], i: -1, vol: 0.5, audio: new Audio(),
  init() { this.tracks = (Game.musicTracks || []).slice(); this.audio.volume = this.vol; this.audio.onended = () => this.next(); },
  play(i) {
    if (!this.tracks.length) return; if (i !== undefined) this.i = i; if (this.i < 0) this.i = 0;
    this.audio.src = this.tracks[this.i].src; this.audio.play().catch(() => {});
  },
  toggle() { if (this.audio.paused) { this.audio.src ? this.audio.play().catch(() => {}) : this.play(); } else this.audio.pause(); },
  next() { if (this.tracks.length) this.play((this.i + 1) % this.tracks.length); },
  setVol(v) { this.vol = v; this.audio.volume = v; },
  addFiles(files) { for (const f of files) this.tracks.push({ name: f.name.replace(/\.[^.]+$/, ''), src: URL.createObjectURL(f) }); }
};
