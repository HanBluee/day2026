// 音效全部用 WebAudio 现场合成：不用音频文件，因此不受微信自动播放限制，
// 也不会有任何版权问题。所有调用都必须发生在用户点击之后。

let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** 一小段噪声，用来做搭扣、脚步这类"非乐音" */
function noise(dur) {
  const c = ac();
  if (!c) return null;
  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function tone(freq, { dur = 0.18, type = 'sine', gain = 0.12, delay = 0, slide = 0 } = {}) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function burst({ dur = 0.06, freq = 1800, q = 1.2, gain = 0.16, delay = 0 } = {}) {
  const c = ac();
  const src = noise(dur);
  if (!c || !src) return;
  const t0 = c.currentTime + delay;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(t0);
}

export const sfx = {
  get muted() { return muted; },
  toggle() { muted = !muted; return muted; },

  /** 黄铜搭扣：咔哒 */
  clasp() {
    if (muted) return;
    burst({ dur: 0.05, freq: 2600, q: 1.6, gain: 0.2 });
    tone(210, { dur: 0.1, type: 'square', gain: 0.05, slide: -90 });
  },

  /** 盒盖掀开的空气声 */
  open() {
    if (muted) return;
    burst({ dur: 0.5, freq: 520, q: 0.7, gain: 0.07 });
    tone(320, { dur: 0.7, gain: 0.05, slide: 90 });
  },

  /** 两个挂件吸合：清脆的"啪" */
  snap() {
    if (muted) return;
    burst({ dur: 0.035, freq: 3600, q: 2, gain: 0.26 });
    tone(880, { dur: 0.16, type: 'triangle', gain: 0.1, slide: 260 });
    tone(1320, { dur: 0.9, type: 'sine', gain: 0.07, delay: 0.03 });
  },

  /** 藏东西、翻柜子这类小动作 */
  tap() {
    if (muted) return;
    burst({ dur: 0.04, freq: 1500, q: 1.4, gain: 0.11 });
  },

  /** 倒计时最后几秒 */
  tick(urgent = false) {
    if (muted) return;
    tone(urgent ? 1180 : 760, { dur: 0.07, type: 'triangle', gain: urgent ? 0.1 : 0.05 });
  },

  /** 宿舍门被推开 */
  door() {
    if (muted) return;
    burst({ dur: 0.34, freq: 300, q: 0.6, gain: 0.16 });
    tone(120, { dur: 0.3, type: 'square', gain: 0.04, slide: -40 });
  },

  /** 化险为夷之后那口气 */
  relief() {
    if (muted) return;
    tone(523.25, { dur: 0.5, gain: 0.07 });
    tone(659.25, { dur: 0.55, gain: 0.06, delay: 0.1 });
    tone(783.99, { dur: 0.9, gain: 0.055, delay: 0.2 });
  },

  /** 分镜翻页 */
  whoosh() {
    if (muted) return;
    burst({ dur: 0.22, freq: 900, q: 0.6, gain: 0.07 });
    tone(420, { dur: 0.22, type: 'triangle', gain: 0.035, slide: -160 });
  },

  /** 字幕出现前的轻响 */
  blip() {
    if (muted) return;
    tone(1240, { dur: 0.05, type: 'sine', gain: 0.03 });
  },

  /** 窗户被拉开 */
  curtain() {
    if (muted) return;
    burst({ dur: 0.28, freq: 1400, q: 0.9, gain: 0.14 });
    tone(260, { dur: 0.22, type: 'square', gain: 0.04, slide: -120 });
  },
};
