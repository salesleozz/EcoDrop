import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../api';
import { sfx } from '../sfx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const RECICLAVEIS = [
  { emoji: '📄', label: 'Papel' },
  { emoji: '🍾', label: 'Garrafa de vidro' },
  { emoji: '🧴', label: 'Garrafa plástica' },
  { emoji: '📦', label: 'Caixa de papelão' },
  { emoji: '🥫', label: 'Lata de alumínio' },
];
const NAO_RECICLAVEIS = [
  { emoji: '🍗', label: 'Restos de comida' },
  { emoji: '🩹', label: 'Fralda usada' },
  { emoji: '🚬', label: 'Cigarro' },
  { emoji: '🍔', label: 'Isopor' },
  { emoji: '🪞', label: 'Espelho quebrado' },
];

const BG_THEMES = ['bg-park', 'bg-beach', 'bg-city', 'bg-forest', 'bg-river'];

const BIN_W = 110; // maior para acompanhar ícones aumentados
const ITEM_SIZE = 64; // ícones maiores
const BASE_SPEED = 5.0; // aumento leve na velocidade conforme solicitadoo
const SPAWN_BASE_MS = 1400; // espaça um pouco mais os spawns iniciais
const MIN_SPAWN_MS = 120; // novo piso pequeno (removemos o piso anterior mais alto)

function randomItem(score = 0) {
  // Aumenta a proporção de não-recicláveis conforme a pontuação aumenta
  // Probabilidade inicial de reciclável: 0.65
  // Decai linearmente até um piso de 0.25 conforme a pontuação sobe
  const recProb = Math.max(0.25, 0.65 - score * 0.0012);
  const isRec = Math.random() < recProb;
  const pool = isRec ? RECICLAVEIS : NAO_RECICLAVEIS;
  const def = pool[Math.floor(Math.random() * pool.length)];
  return { ...def, recyclable: isRec };
}

export default function Game() {
  const { user, updateRecord } = useAuth();
  const navigate = useNavigate();

  const arenaRef = useRef(null);
  const binXRef = useRef(0);
  const itemsRef = useRef([]);
  const rafRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const lastTsRef = useRef(0);

  const [binX, setBinX] = useState(0);
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [finalRecord, setFinalRecord] = useState(user?.record ?? 0);
  const [bg] = useState(() => BG_THEMES[Math.floor(Math.random() * BG_THEMES.length)]);
  const [confirmExit, setConfirmExit] = useState(false);

  const endGame = useCallback(async (finalScore) => {
    setRunning(false);
    setGameOver(true);
    sfx.gameOver();
    try {
      const { isRecord: rec, record } = await api.submitScore(finalScore);
      setIsRecord(rec);
      setFinalRecord(record);
      if (rec) { updateRecord(record); sfx.record(); }
    } catch (e) {
      console.error(e);
    }
  }, [updateRecord]);

  // input: keyboard + mouse + touch
  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const init = arena.clientWidth / 2 - BIN_W / 2;
    binXRef.current = init;
    setBinX(init);

    const clamp = (x) => Math.max(0, Math.min(arena.clientWidth - BIN_W, x));

    const keys = { left: false, right: false };
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = true;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = true;
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = false;
    };
    const onPointer = (e) => {
      const rect = arena.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - BIN_W / 2;
      binXRef.current = clamp(x);
      setBinX(binXRef.current);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    arena.addEventListener('mousemove', onPointer);
    arena.addEventListener('touchmove', onPointer, { passive: true });

    const kbTick = setInterval(() => {
      if (!running) return;
      const step = 14;
      if (keys.left) binXRef.current = clamp(binXRef.current - step);
      if (keys.right) binXRef.current = clamp(binXRef.current + step);
      if (keys.left || keys.right) setBinX(binXRef.current);
    }, 16);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      arena.removeEventListener('mousemove', onPointer);
      arena.removeEventListener('touchmove', onPointer);
      clearInterval(kbTick);
    };
  }, [running]);

  // game loop
  useEffect(() => {
    if (!running) return;
    const arena = arenaRef.current;
    if (!arena) return;

    const loop = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      const w = arena.clientWidth;
      const h = arena.clientHeight;
      const difficulty = 1 + Math.min(score / 100, 2.2);
      // não aumenta mais a velocidade com a pontuação
      const speed = BASE_SPEED;
      // spawnInterval decresce com a pontuação — removemos o piso alto anterior
      // mantendo um mínimo seguro para não explodir a quantidade de spawns
      const spawnInterval = Math.max(MIN_SPAWN_MS, SPAWN_BASE_MS - score * 8);

      // spawn
      if (ts - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = ts;
        const def = randomItem(score);
        // spawn em posição horizontal aleatória, queda em linha reta (sem vx)
        itemsRef.current.push({
          id: ts + Math.random(),
          x: Math.random() * (w - ITEM_SIZE),
          y: -ITEM_SIZE,
          // velocidade vertical com pequena variação percentual
          vy: speed * (1 + Math.random() * 0.12),
          ...def,
        });
      }

      // move + collide
      const binY = h - 90;
      const bx = binXRef.current;
      const remaining = [];
      let caughtWrong = false;
      let scoreDelta = 0;

      for (const it of itemsRef.current) {
        it.y += it.vy * (dt / 16);
        const hitsBin =
          it.y + ITEM_SIZE >= binY &&
          it.y + ITEM_SIZE <= binY + 60 &&
          it.x + ITEM_SIZE > bx + 10 &&
          it.x < bx + BIN_W - 10;

        if (hitsBin) {
          if (it.recyclable) {
            scoreDelta += 10;
            sfx.catch();
          } else {
            caughtWrong = true;
          }
          continue;
        }
        if (it.y > h + ITEM_SIZE) continue; // missed, just disappears
        remaining.push(it);
      }

      itemsRef.current = remaining;
      setItems([...remaining]);
      if (scoreDelta) setScore((s) => s + scoreDelta);

      if (caughtWrong) {
        sfx.wrong();
        const finalScore = score + scoreDelta;
        endGame(finalScore);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [running, score, endGame]);

  const restart = () => {
    itemsRef.current = [];
    setItems([]);
    setScore(0);
    setIsRecord(false);
    setGameOver(false);
    lastSpawnRef.current = 0;
    lastTsRef.current = 0;
    setRunning(true);
  };

  const wantExit = () => {
    if (running && score > 0) setConfirmExit(true);
    else navigate('/');
  };

  return (
    <div className={`ec-game-wrapper ${bg}`}>
      <Header />

      <div className="ec-hud d-flex justify-content-between align-items-center px-3 py-2">
        <div />
        <div className="ec-score">Pontos: <strong>{score}</strong></div>
        <div className="ec-record-mini">🏆 {Math.max(finalRecord, score)}</div>
      </div>

      <div className="ec-arena" ref={arenaRef}>
        {/* fixed top-right close button to avoid overlapping the theme toggle */}
        <button
          className="theme-exit btn btn-sm shadow"
          title="Sair do jogo"
          aria-label="Sair"
          onClick={wantExit}
        >
          ← Sair
        </button>
        {items.map((it) => (
          <div
            key={it.id}
            className="ec-item"
            style={{ transform: `translate(${it.x}px, ${it.y}px)` }}
            title={it.label}
            aria-label={it.label}
          >
            {it.emoji}
          </div>
        ))}
        <div
          className="ec-bin"
          style={{ transform: `translateX(${binX}px)`, width: BIN_W }}
          aria-label="Lixeira de reciclagem"
        >
          ♻️
        </div>

        {gameOver && (
          <div className="ec-overlay">
            <div className="ec-card card p-4 text-center shadow-lg" style={{ maxWidth: 420 }}>
              {isRecord ? (
                <>
                  <h3 className="text-success">Novo recorde! 🎉</h3>
                  <p className="fs-4 m-0">{score} pontos</p>
                </>
              ) : (
                <>
                  <h3>Fim de jogo</h3>
                  <p className="fs-5 m-0">Seus pontos: <strong>{score}</strong></p>
                  <p className="text-secondary">Recorde: {finalRecord}</p>
                </>
              )}
              <div className="d-flex gap-2 justify-content-center mt-3">
                <button className="btn btn-success ec-btn-primary" onClick={restart}>Jogar novamente</button>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>Sair</button>
              </div>
            </div>
          </div>
        )}

        {confirmExit && (
          <div className="ec-overlay">
            <div className="ec-card card p-4 text-center shadow-lg" style={{ maxWidth: 380 }}>
              <h5>Sair do jogo?</h5>
              <p className="text-secondary">Você perderá a pontuação atual.</p>
              <div className="d-flex gap-2 justify-content-center mt-2">
                <button className="btn btn-danger" onClick={() => navigate('/')}>Sim, sair</button>
                <button className="btn btn-outline-secondary" onClick={() => setConfirmExit(false)}>Continuar jogando</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}