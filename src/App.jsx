import React, { useMemo, useState } from "react";

const MODES = {
  "1": { label: "初級", min: 1, max: 16, description: "1〜16" },
  "2": { label: "中級", min: 10, max: 256, description: "10〜256" },
  "3": { label: "上級", min: 100, max: 1024, description: "100〜1024" },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dealCards(modeKey) {
  const mode = MODES[modeKey];
  return Array.from({ length: 4 }, () => randomInt(mode.min, mode.max));
}

function primeFactors(n) {
  const factors = [];
  let i = 2;
  let num = n;

  if (num < 2) return [];

  while (num !== 1) {
    if (num % i === 0) {
      factors.push(i);
      num = Math.floor(num / i);
    } else {
      i++;
    }
  }

  return factors;
}

function getBestAnswer(cards) {
  let bestCards = [];
  let bestTotal = 0;
  let bestFactors = [];

  for (let bit = 1; bit < 16; bit++) {
    const selected = [];

    for (let i = 0; i < 4; i++) {
      if ((bit & (1 << i)) !== 0) {
        selected.push(cards[i]);
      }
    }

    const total = selected.reduce((sum, value) => sum + value, 0);
    const factors = primeFactors(total);

    if (factors.length > bestFactors.length) {
      bestCards = selected;
      bestTotal = total;
      bestFactors = factors;
    }
  }

  return {
    cards: bestCards,
    total: bestTotal,
    factors: bestFactors,
    factorCount: bestFactors.length,
  };
}

function makeRound(modeKey) {
  const newCards = dealCards(modeKey);
  const best = getBestAnswer(newCards);
  const minus = randomInt(1, 2);
  const newTarget = Math.max(1, best.factorCount - minus);

  return {
    cards: newCards,
    target: newTarget,
    best,
  };
}

export default function App() {
  const firstRound = makeRound("1");

  const [modeKey, setModeKey] = useState("1");
  const [cards, setCards] = useState(firstRound.cards);
  const [target, setTarget] = useState(firstRound.target);
  const [bestAnswer, setBestAnswer] = useState(firstRound.best);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [message, setMessage] = useState("目標以上の素因数数を出してください");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [life, setLife] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const selectedCards = useMemo(() => {
    return selectedIndexes.map((index) => cards[index]);
  }, [selectedIndexes, cards]);

  const startGame = (nextModeKey = modeKey) => {
    const round = makeRound(nextModeKey);

    setModeKey(nextModeKey);
    setCards(round.cards);
    setTarget(round.target);
    setBestAnswer(round.best);
    setSelectedIndexes([]);
    setMessage("目標以上の素因数数を出してください");
    setResult(null);
    setScore(0);
    setLife(3);
    setGameOver(false);
    setCalculated(false);
  };

  const nextRound = () => {
    const round = makeRound(modeKey);

    setCards(round.cards);
    setTarget(round.target);
    setBestAnswer(round.best);
    setSelectedIndexes([]);
    setMessage("次のカードを選んでください");
    setResult(null);
    setCalculated(false);
  };

  const toggleCard = (index) => {
    if (gameOver || calculated) {
      return;
    }

    setResult(null);

    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter((i) => i !== index));
    } else {
      setSelectedIndexes([...selectedIndexes, index]);
    }
  };

  const calculate = (values) => {
    if (gameOver || calculated) {
      return;
    }

    if (values.length === 0) {
      setMessage("1枚以上選んでください");
      setResult(null);
      return;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    const factors = primeFactors(total);
    const factorCount = factors.length;
    const clear = factorCount >= target;

    let addScore = 0;
    let nextScore = score;
    let nextLife = life;

    if (clear) {
      addScore = factorCount;

      if (factorCount === target) {
        addScore = addScore + 3;
      }

      nextScore = score + addScore;
      setScore(nextScore);

      if (nextScore > highScore) {
        setHighScore(nextScore);
      }

      setMessage("成功！ 次のラウンドへ進んでください");
    } else {
      nextLife = life - 1;
      setLife(nextLife);
      setMessage("失敗... ライフが1減りました");

      if (nextLife <= 0) {
        setGameOver(true);
        setMessage("ゲームオーバーです");
      }
    }

    setResult({
      total,
      factors,
      selected: values,
      factorCount,
      clear,
      addScore,
    });
    setCalculated(true);
  };

  const calculateSelectedCards = () => {
    calculate(selectedCards);
  };

  const factorText = result && result.factors.length > 0
    ? result.factors.join(" x ")
    : "なし";

  const bestFactorText = bestAnswer && bestAnswer.factors.length > 0
    ? bestAnswer.factors.join(" x ")
    : "なし";

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.title}>素因数カードゲーム</h1>
        <p style={styles.explain}>目標の素因数数をこえながら、できるだけ高いスコアを目指してください。</p>
        <hr />

        <h2 style={styles.heading}>モード</h2>
        <div style={styles.modeArea}>
          {Object.entries(MODES).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => startGame(key)}
              style={modeKey === key ? styles.selectedModeButton : styles.button}
            >
              {key}. {mode.label}
              <br />
              {mode.description}
            </button>
          ))}
        </div>

        <hr />

        <h2 style={styles.heading}>現在の状態</h2>
        <div style={styles.statusBox}>
          <p>スコア：{score}</p>
          <p>最高スコア：{highScore}</p>
          <p>ライフ：{life}</p>
          <p>目標：{target}個以上</p>
        </div>
        <p style={styles.smallText}>ぴったり目標と同じ数ならボーナス +3 点</p>
        {gameOver && (
          <div style={styles.gameOverBox}>
            <h2>ゲームオーバー</h2>
            <p>最終スコア：{score}</p>
            <button onClick={() => startGame(modeKey)} style={styles.bigButton}>
              もう一度遊ぶ
            </button>
          </div>
        )}

        <hr />

        <h2 style={styles.heading}>カード</h2>
        <div style={styles.cardsArea}>
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => toggleCard(index)}
              style={selectedIndexes.includes(index) ? styles.selectedCard : styles.card}
            >
              {card}
            </button>
          ))}
        </div>

        <p style={styles.selectedText}>選択中：{selectedCards.length === 0 ? "なし" : selectedCards.join(" + ")}</p>
        <button onClick={calculateSelectedCards} style={styles.bigButton}>
          計算する
        </button>

        <button onClick={nextRound} style={styles.button} disabled={!calculated || gameOver}>
          次のラウンドへ
        </button>

        <button onClick={() => startGame(modeKey)} style={styles.button}>
          最初から
        </button>

        <p style={styles.message}>メッセージ：{message}</p>

        {result && (
          <div style={styles.resultBox}>
            <h2>結果</h2>
            <p>選んだカード：{result.selected.join(" + ")}</p>
            <p>{result.total}({factorText})</p>
            <p>素因数数：{result.factorCount}</p>
            <p>目標：{target}個以上</p>
            <p>判定：{result.clear ? "成功" : "失敗"}</p>
            <p>今回の得点：{result.addScore}</p>

            <hr />

            <h3>このラウンドの最高</h3>
            <p>最高の選び方：{bestAnswer.cards.join(" + ")}</p>
            <p>{bestAnswer.total}({bestFactorText})</p>
            <p>最高素因数数：{bestAnswer.factorCount}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "white",
    color: "black",
    minHeight: "100vh",
    padding: "8px",
    fontFamily: "sans-serif",
    boxSizing: "border-box",
  },
  box: {
    width: "100%",
    maxWidth: "430px",
    margin: "0 auto",
    border: "2px solid black",
    padding: "12px",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    margin: "8px 0",
  },
  explain: {
    fontSize: "14px",
    lineHeight: "1.5",
  },
  heading: {
    fontSize: "18px",
    margin: "12px 0 8px 0",
  },
  modeArea: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "6px",
  },
  button: {
    backgroundColor: "white",
    color: "black",
    border: "1px solid black",
    padding: "10px 8px",
    margin: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  selectedModeButton: {
    backgroundColor: "black",
    color: "white",
    border: "1px solid black",
    padding: "10px 8px",
    margin: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  statusBox: {
    border: "1px solid black",
    padding: "8px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 8px",
  },
  smallText: {
    fontSize: "13px",
  },
  cardsArea: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "10px",
    marginBottom: "10px",
  },
  card: {
    width: "100%",
    height: "95px",
    backgroundColor: "white",
    color: "black",
    border: "2px solid black",
    fontSize: "30px",
    cursor: "pointer",
  },
  selectedCard: {
    width: "100%",
    height: "95px",
    backgroundColor: "black",
    color: "white",
    border: "2px solid black",
    fontSize: "30px",
    cursor: "pointer",
  },
  selectedText: {
    border: "1px solid black",
    padding: "8px",
    minHeight: "22px",
  },
  bigButton: {
    backgroundColor: "white",
    color: "black",
    border: "2px solid black",
    padding: "13px 10px",
    margin: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
  },
  message: {
    border: "1px solid black",
    padding: "10px",
    marginTop: "10px",
    fontSize: "14px",
  },
  resultBox: {
    border: "2px solid black",
    padding: "10px",
    marginTop: "12px",
    fontSize: "14px",
  },
  gameOverBox: {
    border: "3px double black",
    padding: "10px",
    marginTop: "10px",
  },
};
