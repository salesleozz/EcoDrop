// Cartoon SFX via Web Audio API — sem dependências externas.
let ctx;
function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep({ freq = 440, duration = 0.12, type = 'sine', gain = 0.15, sweepTo = null } = {}) {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, ac.currentTime + duration);
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export const sfx = {
  click: () => beep({ freq: 600, duration: 0.06, type: 'square', gain: 0.08 }),
  catch: () => {
    beep({ freq: 520, duration: 0.09, type: 'triangle', sweepTo: 880, gain: 0.18 });
    setTimeout(() => beep({ freq: 880, duration: 0.09, type: 'triangle', sweepTo: 1200, gain: 0.14 }), 70);
  },
  wrong: () => {
    beep({ freq: 220, duration: 0.18, type: 'sawtooth', sweepTo: 80, gain: 0.2 });
    setTimeout(() => beep({ freq: 160, duration: 0.22, type: 'sawtooth', sweepTo: 60, gain: 0.18 }), 120);
  },
  gameOver: () => {
    [523, 392, 311, 196].forEach((f, i) =>
      setTimeout(() => beep({ freq: f, duration: 0.22, type: 'triangle', gain: 0.18 }), i * 160)
    );
  },
  record: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => beep({ freq: f, duration: 0.18, type: 'sine', gain: 0.2 }), i * 120)
    );
  },
};

// Click SFX em qualquer <button>, sem precisar alterar cada componente.
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn, [data-sfx="click"]');
    if (btn && !btn.dataset.noSfx) sfx.click();
  }, true);
}