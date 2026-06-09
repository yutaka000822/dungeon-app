import heroImg from "./hero.jpg";
import { useState, useEffect } from "react";

const CARDS = [
  { id: 1, name: "斬撃", cost: 1, damage: 8, type: "attack", desc: "敵に8ダメージ" },
  { id: 2, name: "防御", cost: 1, block: 6, type: "skill", desc: "6ブロック獲得" },
  { id: 3, name: "強撃", cost: 2, damage: 15, type: "attack", desc: "敵に15ダメージ" },
  { id: 4, name: "回復", cost: 2, heal: 8, type: "skill", desc: "HPを8回復" },
];

function App() {
  // FastAPIから取得したモンスターを入れる箱
  const [monster, setMonster] = useState(null);
  const [monsterHp, setMonsterHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(50);
  const [block, setBlock] = useState(0);
  const [energy, setEnergy] = useState(3);
  const [log, setLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // 画面が開いたらFastAPIからモンスターを取得する
  useEffect(() => {
    fetch("http://localhost:8000/api/enemies")
      .then((res) => res.json())
      .then((data) => {
        // ランダムで1体選ぶ
        const random = data[Math.floor(Math.random() * data.length)];
        setMonster(random);
        setMonsterHp(random.hp);
        setLog([`⚔️ ${random.name}が現れた！`]);
      });
  }, []);

  // モンスターが読み込まれるまでローディング表示
  if (!monster) return (
    <div style={{
      backgroundColor: "#0d0d1a", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#c9a84c", fontSize: "1.5rem"
    }}>
      ⚔️ モンスターを召喚中...
    </div>
  );

  const addLog = (msg) => setLog((prev) => [msg, ...prev]);

  const playCard = (card) => {
    if (gameOver) return;
    if (energy < card.cost) { addLog("⚡ エネルギーが足りない！"); return; }
    setEnergy((e) => e - card.cost);
    if (card.damage) {
      const newHp = Math.max(0, monsterHp - card.damage);
      setMonsterHp(newHp);
      addLog(`💥 ${card.name}！${monster.name}に${card.damage}ダメージ！`);
      if (newHp <= 0) { addLog("🎉 勝利！"); setGameOver(true); return; }
    }
    if (card.block) {
      setBlock((b) => b + card.block);
      addLog(`🛡️ ${card.name}！${card.block}ブロック獲得！`);
    }
    if (card.heal) {
      setPlayerHp((h) => Math.min(50, h + card.heal));
      addLog(`💚 ${card.name}！HPを${card.heal}回復！`);
    }
  };

  const endTurn = () => {
    if (gameOver) return;
    const dmg = Math.max(0, monster.attack - block);
    const newHp = Math.max(0, playerHp - dmg);
    setPlayerHp(newHp);
    setBlock(0);
    setEnergy(3);
    addLog(`👹 ${monster.name}の攻撃！${dmg}ダメージ！`);
    if (newHp <= 0) { addLog("💀 ゲームオーバー…"); setGameOver(true); }
  };

  const reset = () => {
    fetch("http://localhost:8000/api/enemies")
      .then((res) => res.json())
      .then((data) => {
        const random = data[Math.floor(Math.random() * data.length)];
        setMonster(random);
        setMonsterHp(random.hp);
        setLog([`⚔️ ${random.name}が現れた！`]);
        setPlayerHp(50);
        setBlock(0);
        setEnergy(3);
        setGameOver(false);
      });
  };

  const monsterHpPct = (monsterHp / monster.hp) * 100;
  const playerHpPct = (playerHp / 50) * 100;

  return (
    <div style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200'), linear-gradient(to bottom, #0a0015, #1a0030)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundBlendMode: "overlay",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#e0e0e0",
    }}>

      {/* 上部ステータスバー */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 24px", backgroundColor: "rgba(0,0,0,0.6)",
        borderBottom: "1px solid rgba(201,168,76,0.3)",
      }}>
        <div>❤️ {playerHp}/50　🛡️ {block}</div>
        <div style={{ color: "#c9a84c", fontSize: "1.2rem", fontWeight: "bold" }}>
          ⚔️ ONCE UPON A DUNGEON
        </div>
        <div>⚡ {energy}/3</div>
      </div>

      {/* メインバトルエリア */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "20px" }}>

        {/* プレイヤー */}
        <div style={{ textAlign: "center" }}>
          <img src={heroImg} alt="hero" style={{
            height: "180px",
            imageRendering: "pixelated",
            mixBlendMode: "screen"
          }} />
          <div style={{ fontSize: "0.9rem", marginTop: "8px" }}>あなた</div>
          <div style={{
            width: "120px", backgroundColor: "#222", borderRadius: "4px", height: "10px", marginTop: "6px", overflow: "hidden"
          }}>
            <div style={{
              height: "100%", width: `${playerHpPct}%`,
              backgroundColor: playerHpPct > 50 ? "#27ae60" : playerHpPct > 25 ? "#f39c12" : "#e74c3c",
              transition: "width 0.4s",
            }}/>
          </div>
        </div>

        {/* バトルログ */}
        <div style={{
          backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px", padding: "12px", width: "200px", height: "150px",
          overflowY: "auto", fontSize: "0.8rem", color: "#aaa",
        }}>
          {log.map((l, i) => <div key={i} style={{ marginBottom: "4px" }}>{l}</div>)}
        </div>

        {/* モンスター */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "5rem" }}>👹</div>
          <div style={{ color: "#ff6b6b", marginTop: "8px" }}>{monster.name}</div>
          <div style={{
            width: "120px", backgroundColor: "#222", borderRadius: "4px", height: "10px", marginTop: "6px", overflow: "hidden"
          }}>
            <div style={{
              height: "100%", width: `${monsterHpPct}%`,
              backgroundColor: "#e74c3c", transition: "width 0.4s",
            }}/>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "4px" }}>
            ⚔️ 次のターン: {monster.attack}ダメージ
          </div>
        </div>
      </div>

      {/* 下部カードエリア */}
      <div style={{
        backgroundColor: "rgba(0,0,0,0.7)",
        borderTop: "1px solid rgba(201,168,76,0.3)",
        padding: "16px 24px",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "12px" }}>
          {CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => playCard(card)}
              style={{
                backgroundColor: card.type === "attack" ? "#2c1010" : "#0f1f2c",
                border: `2px solid ${card.type === "attack" ? "#e74c3c" : "#3498db"}`,
                borderRadius: "10px",
                padding: "12px 10px",
                width: "100px",
                textAlign: "center",
                cursor: energy >= card.cost ? "pointer" : "not-allowed",
                opacity: energy >= card.cost ? 1 : 0.5,
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-12px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{
                backgroundColor: "#c9a84c", color: "#0d0d1a",
                borderRadius: "50%", width: "24px", height: "24px",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px", fontWeight: "bold", fontSize: "0.9rem",
              }}>{card.cost}</div>
              <div style={{ fontSize: "0.95rem", fontWeight: "bold", marginBottom: "4px" }}>{card.name}</div>
              <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* ターン終了ボタン */}
        <div style={{ textAlign: "right" }}>
          {!gameOver ? (
            <button onClick={endTurn} style={{
              backgroundColor: "#c9a84c", color: "#0d0d1a",
              border: "none", padding: "10px 32px",
              borderRadius: "8px", cursor: "pointer",
              fontWeight: "bold", fontSize: "1rem",
            }}>ターン終了</button>
          ) : (
            <button onClick={reset} style={{
              backgroundColor: "#7ec8e3", color: "#0d0d1a",
              border: "none", padding: "10px 32px",
              borderRadius: "8px", cursor: "pointer",
              fontWeight: "bold", fontSize: "1rem",
            }}>もう一度</button>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;