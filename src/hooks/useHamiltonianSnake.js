import { useState, useEffect } from "react"
import { generateStaticPath } from "../utils/hamiltonian"
import { getNewFood } from "../utils/gameUtils"

// some helpers so that the snake can decide on shorter paths when it's not dangerous to do so (based on the length of the snake)
function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// helper we use while the snake is small so it can move directly toward food without fear of eating herself
function greedyCut(snake, food, gridSize) {
  const head = snake[0];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];

  let bestMove = null;
  let bestScore = Infinity;

  for (const dir of directions) {
    const next = { x: head.x + dir.x, y: head.y + dir.y };

    // skip out-of-bounds
    if (next.x < 0 || next.y < 0 || next.x >= gridSize || next.y >= gridSize) continue;
    // skip self collisions
    if (snake.some(seg => seg.x === next.x && seg.y === next.y)) continue;

    const dist = manhattan(next, food);

    // openness: count how many of the next cell's neighbors are empty
    const neighborDirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];
    let openCount = 0;
    for (const n of neighborDirs) {
      const check = { x: next.x + n.x, y: next.y + n.y };
      if (
        check.x >= 0 && check.y >= 0 &&
        check.x < gridSize && check.y < gridSize &&
        !snake.some(seg => seg.x === check.x && seg.y === check.y)
      ) {
        openCount++;
      }
    }

    // combine distance + openness into one simple score
    // smaller is better; openness gets a light weight
    const score = dist - openCount * 0.3;

    // tie-breaker: if scores are equal, randomize slightly to break loops
    if (score < bestScore || (score === bestScore && Math.random() < 0.5)) {
      bestScore = score;
      bestMove = dir;
    }
  }

  return bestMove;
}

export default function useHamiltonianSnake(gridSize, enabled = true) {
  const path = generateStaticPath();
  
  // all our manual setup
  const [snake, setSnake] = useState([{ x: 0, y: 0 }]);
  const [food, setFood] = useState({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // plus some new ones to help us set up a self-playing version
  const [index, setIndex] = useState(0);

  // keep all the same functionality, except now we need to track the path index
  useEffect(() => {
    if (!enabled || !running || path.length === 0) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const totalCells = gridSize * gridSize;
        const ratio = prevSnake.length / totalCells;
        const head = prevSnake[0];

        // --- 1️⃣ Free-Roam Mode (under 10% of board) ---
        if (ratio < 0.05) {
          const move = greedyCut(prevSnake, food, gridSize);
          if (!move) {
            // no valid direction = boxed in
            setRunning(false);
            setGameOver(true);
            return prevSnake;
          }

          const newHead = {
            x: head.x + move.x,
            y: head.y + move.y,
          };
          const newSnake = [newHead, ...prevSnake];
          const ateFood = newHead.x === food.x && newHead.y === food.y;

          if (ateFood) {
            setScore((prev) => prev + 100);
            const fresh = getNewFood(newSnake, gridSize);
            if (!fresh) setRunning(false);
            else setFood(fresh);
          } else {
            newSnake.pop();
          }

          // Collision check
          const hitSelf = newSnake
            .slice(1)
            .some(seg => seg.x === newHead.x && seg.y === newHead.y);

          if (hitSelf) {
            setRunning(false);
            setGameOver(true);
            return prevSnake;
          }

          // Keep Hamiltonian index synced to head position
          const newIndex = path.findIndex(p => p.x === newHead.x && p.y === newHead.y);
          if (newIndex !== -1) setIndex(newIndex);

          return newSnake;
        }

        // --- 2️⃣ Hamiltonian Path Mode ---
        const maxSkip = ratio < 0.10 ? 30 : ratio < 0.20 ? 15 : ratio < .25 ? 10 : ratio < .30 ? 3 : 1;
        const headDist = manhattan(head, food);
        const foodIndex = path.findIndex(p => p.x === food.x && p.y === food.y);

        let chosenIndex = (index + 1) % path.length;
        let nextCell = path[chosenIndex];
        let bestDist = headDist;

        // Try to find a better move ahead
        for (let skip = 2; skip <= maxSkip; skip++) {
          const testIndex = (index + skip) % path.length;
          const testCell = path[testIndex];
          const dx = Math.abs(testCell.x - head.x);
          const dy = Math.abs(testCell.y - head.y);
          const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
          const collides = prevSnake.some(seg => seg.x === testCell.x && seg.y === testCell.y);

          const testDist = manhattan(testCell, food);
          const getsCloser = testDist < bestDist;

          const passesFood =
            (index < foodIndex && testIndex > foodIndex) ||
            (index > foodIndex && testIndex < foodIndex);

          if (isAdjacent && !collides && getsCloser && !passesFood) {
            if (testDist < bestDist) {
              bestDist = testDist;
              chosenIndex = testIndex;
              nextCell = testCell;
            }
          }
        }

        if (!nextCell) {
          setRunning(false);
          setGameOver(true);
          return prevSnake;
        }

        const newHead = { x: nextCell.x, y: nextCell.y };
        const newSnake = [newHead, ...prevSnake];
        setIndex(chosenIndex);

        const ateFood = newHead.x === food.x && newHead.y === food.y;

        if (ateFood) {
          setScore((prev) => prev + 100);
          const fresh = getNewFood(newSnake, gridSize);

          if (!fresh) setRunning(false);
          else setFood(fresh);
        } else {
          newSnake.pop();
        }

        // reintroduce game over state, for when the snake fills the whole screen or runs into itself during shortcutting
        const hitSelf = newSnake
        .slice(1) // ignore the head
        .some(seg => seg.x === newHead.x && seg.y === newHead.y);

        if (hitSelf) {
          setRunning(false);
          setGameOver(true);
          return prevSnake;
        }

        return newSnake;
      })

      
    }, 50) // interval sets the speed, 175 is the default for manual, but the auto player should be faster so that there's less wait time

    return () => clearInterval(interval)
  }, [running, path, index, food, gridSize]);

  return { 
    snake, 
    setSnake,
    food,
    setFood,
    running, 
    setRunning, 
    gameOver, 
    setGameOver, 
    score,
    setScore,
    direction: null,
    setDirection: () => {},
    inputLocked: false,
    setInputLocked: () => {}
  }
}