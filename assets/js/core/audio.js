(() => {
  const hasAudioSupport =
    typeof window.AudioContext !== "undefined" ||
    typeof window.webkitAudioContext !== "undefined";
  let audioContext = null;

  function getContext() {
    if (!hasAudioSupport) {
      return null;
    }
    if (!audioContext) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      audioContext = new Ctor();
    }
    return audioContext;
  }

  function createNoiseBuffer(ctx, duration = 0.25) {
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const fade = 1 - i / length;
      data[i] = (Math.random() * 2 - 1) * fade * 0.6;
    }
    return buffer;
  }

  function playTone({
    type = "sine",
    frequencyStart = 220,
    frequencyEnd = 220,
    duration = 0.4,
    gainStart = 0.0001,
    gainPeak = 0.12,
    gainEnd = 0.0001,
    startTime = 0,
    curve = "exponential",
  }) {
    const ctx = getContext();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime + startTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequencyStart, now);
    if (curve === "exponential" && frequencyEnd > 0) {
      oscillator.frequency.exponentialRampToValueAtTime(
        frequencyEnd,
        now + duration,
      );
    } else {
      oscillator.frequency.linearRampToValueAtTime(
        frequencyEnd,
        now + duration,
      );
    }

    gain.gain.setValueAtTime(gainStart, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(gainEnd, now + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  function playPaperFlip() {
    const ctx = getContext();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(320, now + 0.08);
    osc.frequency.linearRampToValueAtTime(180, now + 0.28);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.18);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.03, now + 0.04);
    noiseGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    noise.connect(noiseGain);
    gain.connect(ctx.destination);
    noiseGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
    noise.start(now);
    noise.stop(now + 0.21);
  }

  function playHover() {
    playTone({
      type: "sine",
      frequencyStart: 520,
      frequencyEnd: 680,
      duration: 0.25,
      gainPeak: 0.035,
      gainEnd: 0.0001,
    });
  }

  function playRelease() {
    playTone({
      type: "sine",
      frequencyStart: 360,
      frequencyEnd: 220,
      duration: 0.3,
      gainPeak: 0.045,
    });
  }

  function playMenu(open) {
    playTone({
      type: "sine",
      frequencyStart: open ? 320 : 420,
      frequencyEnd: open ? 520 : 240,
      duration: 0.28,
      gainPeak: 0.06,
    });
  }

  function playIndicatorPulse() {
    const ctx = getContext();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.18);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.21);

    playTone({
      type: "sine",
      frequencyStart: 700,
      frequencyEnd: 540,
      duration: 0.22,
      gainPeak: 0.045,
    });
  }

  function play(name) {
    switch (name) {
      case "card-flip":
        playPaperFlip();
        break;
      case "card-hover":
        playHover();
        break;
      case "card-close":
        playRelease();
        break;
      case "menu-open":
        playMenu(true);
        break;
      case "menu-close":
        playMenu(false);
        break;
      case "indicator":
        playIndicatorPulse();
        break;
      default:
        break;
    }
  }

  window.uiSound = {
    play,
    ensure: getContext,
  };
})();
