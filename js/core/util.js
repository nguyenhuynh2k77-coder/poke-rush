/* ============ util.js — helpers compartidos ============ */
window.G = window.G || {};

/** Altura a la que vuelan proyectiles y efectos sobre el plano del suelo. */
G.LIFT = 18;

G.U = {
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  lerp(a, b, t) { return a + (b - a) * t; },
  rand(a, b) { return a + Math.random() * (b - a); },
  randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  /** Elige n elementos distintos al azar. */
  pickN(arr, n) {
    const c = arr.slice();
    const out = [];
    while (out.length < n && c.length) out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]);
    return out;
  },

  dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); },
  dist2(ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; },

  /** Normaliza un vector; devuelve [0,0] si es nulo. */
  norm(x, y) { const m = Math.hypot(x, y); return m > 1e-6 ? [x / m, y / m] : [0, 0]; },

  /** Interpolación independiente del framerate. */
  damp(a, b, rate, dt) { return b + (a - b) * Math.exp(-rate * dt); },

  /** Hash determinista 2D -> [0,1). Para generar el mapa siempre igual. */
  hash(x, y, seed = 0) {
    // Todo en enteros de 32 bits con Math.imul: es la función más llamada
    // al hornear el mapa, y así V8 no sale nunca de la ruta rápida.
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  },

  /** "3:07" a partir de segundos. */
  mmss(s) {
    const m = Math.floor(s / 60);
    return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  },

  /** Colores de tipo Pokémon (para proyectiles, tags y efectos). */
  TYPE_COLOR: {
    normal: '#b0a99f', fire: '#ff7b3d', water: '#4b9bff', grass: '#5fcb6a',
    electric: '#ffd33d', ice: '#7fe0e0', fighting: '#e0533d', poison: '#b45ec4',
    ground: '#d6b25c', flying: '#9bb8ff', psychic: '#ff5f9e', bug: '#a3c43d',
    rock: '#bfa96b', ghost: '#7a6bc4', dragon: '#6b58ff', dark: '#6b5c52',
    steel: '#a8b8c4', fairy: '#ff9ed8'
  },

  TYPE_NAME: {
    normal: 'Normal', fire: 'Fuego', water: 'Agua', grass: 'Planta',
    electric: 'Eléctrico', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
    ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
    rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
    steel: 'Acero', fairy: 'Hada'
  },
  // ---------- Daily Run: RNG cố định theo ngày ----------
  _origRandom: Math.random,
  /** Ghi đè Math.random bằng PRNG mulberry32 có seed (toàn bộ trận đấu deterministic). */
  seedRandom(seed) {
    let a = seed >>> 0;
    Math.random = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },
  /** Khôi phục Math.random gốc (khi thoát về menu). */
  restoreRandom() { Math.random = G.U._origRandom; },
  /** Ngày theo giờ Tây Ban Nha (đồng bộ với ranking), dạng 'YYYYMMDD'. */
  dailyKey(date = new Date()) {
    const p = {};
    for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)) p[x.type] = x.value;
    return p.year + p.month + p.day;
  },
  /** Seed 32-bit cố định cho ngày hiện tại. */
  dailySeed() {
    const s = G.U.dailyKey();
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  },
  /** Starter cố định của ngày (xoay vòng danh sách starters → mọi người cùng 1 Pokemon). */
  dailyStarterDex() {
    const k = G.U.dailyKey();
    const n = (parseInt(k.slice(0, 4)) * 372 + parseInt(k.slice(4, 6)) * 31 + parseInt(k.slice(6, 8))) % G.STARTERS.length;
    return G.STARTERS[n].dex;
  },  
  /** Key của ngày cách hiện tại `days` ngày (dương = tương lai, âm = quá khứ), theo giờ Madrid. */
  dailyKeyOffset(days) {
    return G.U.dailyKey(new Date(Date.now() + days * 86400000));
  },
};
