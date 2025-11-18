import { useState, useEffect, useRef } from "react"
import { generateStaticPath } from "../utils/hamiltonian"
import { getNewFood } from "../utils/gameUtils"

// import type keyword tells TS that you’re importing only types, not actual runtime values. It’s a small optimization and prevents circular dependencies.
import type { Position, HamiltonianSnakeState } from "../types"

// some helpers so that the snake can decide on shorter paths when it's not dangerous to do so (based on the length of the snake)
function manhattan(a:Position, b:Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

/* move towards the target while not colliding with self */
function chooseSafeStep(
  head: Position,
  target: Position,
  snake: Position[],
  gridSize: number
): Position | null {
  const dirs: Position[] = [
    { x: 1, y: 0 },  // right
    { x: -1, y: 0 }, // left
    { x: 0, y: 1 },  // down
    { x: 0, y: -1 }, // up
  ]

  // Rank directions by how much they reduce distance to target (lower is better)
  const ranked = dirs
    .map((d) => {
      const next = { x: head.x + d.x, y: head.y + d.y }
      const invalid =
        next.x < 0 ||
        next.y < 0 ||
        next.x >= gridSize ||
        next.y >= gridSize ||
        snake.some((s) => s.x === next.x && s.y === next.y)
      return {
        d,
        invalid,
        score: manhattan(next, target),
      }
    })
    .filter((r) => !r.invalid)
    .sort((a, b) => a.score - b.score)

  if (ranked.length === 0) return null
  
  // Prefer the best, mild random tie-break to reduce loops
  const best = ranked.filter((r) => r.score === ranked[0]!.score);
  if (best.length === 0) return null;

  const fallback = best[0]!; // assert: at least one element
  const index = Math.floor(Math.random() * best.length);
  const choice = best[index] ?? fallback; // fallback is never undefined, so result isn't either

  return choice.d;
}

// helper we use while the snake is small so it can move directly toward food without fear of eating herself
function greedyCut(snake:Position[], food:Position, gridSize:number): Position | null {
  const head = snake[0]!
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ]

  let bestMove: Position | null = null
  let bestScore = Infinity

  for (const dir of directions) {
    const next = { x: head.x + dir.x, y: head.y + dir.y }

    // skip out-of-bounds
    if (next.x < 0 || next.y < 0 || next.x >= gridSize || next.y >= gridSize) continue
    // skip self collisions
    if (snake.some(seg => seg.x === next.x && seg.y === next.y)) continue

    const dist = manhattan(next, food)

    // openness: count how many of the next cell's neighbors are empty
    const neighborDirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ]
    let openCount = 0
    for (const n of neighborDirs) {
      const check = { x: next.x + n.x, y: next.y + n.y }
      if (
        check.x >= 0 && check.y >= 0 &&
        check.x < gridSize && check.y < gridSize &&
        !snake.some(seg => seg.x === check.x && seg.y === check.y)
      ) {
        openCount++
      }
    }

    // combine distance + openness into one simple score
    // smaller is better openness gets a light weight
    const score = dist - openCount * 0.3

    // tie-breaker: if scores are equal, randomize slightly to break loops
    if (score < bestScore || (score === bestScore && Math.random() < 0.5)) {
      bestScore = score
      bestMove = dir
    }
  }

  return bestMove
}

/* type for handling transitions between movement mode */
type SnakeMode = "free" | "aligning" | "hamiltonian"

export default function useHamiltonianSnake(gridSize:number, enabled:boolean = true): HamiltonianSnakeState {
  const path = generateStaticPath()
  
  // all our manual setup
  const [snake, setSnake] = useState<Position[]>([{ x: 0, y: 0 }])
  const [food, setFood] = useState<Position>({ x: 1, y: 0 })
  const [running, setRunning] = useState<boolean>(false)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)

  // plus some new ones to help us set up a self-playing version
  const [index, setIndex] = useState<number>(0)

  // mode an alignment
  const [mode, setMode] = useState<SnakeMode>("free")
  const [waypoints, setWaypoints] = useState<Position[]>([])
  const [wpIndex, setWpIndex] = useState<number>(0)

  // prevent multiple alignment inits in one tick
  const aligningInitGuard = useRef(false)

  // reset the guard when restarting or on game over
  useEffect(() => {
    aligningInitGuard.current = false;
  }, [running, gameOver]);

  // core tick - much of the same functionality as manual, but now we need to keep track of the snake movement modes and transitions, and the hamiltonian path index
  useEffect(() => {
    if (!enabled || !running || path.length === 0 || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake: Position[]) => {
        const totalCells = gridSize * gridSize;
        const ratio = prevSnake.length / totalCells;
        const head = prevSnake[0]!;

        // ---------- MODE: FREE ----------
        if (mode === "free") {
          // early greedy roaming
          if (ratio < 0.05) {
            const move = greedyCut(prevSnake, food, gridSize);
            if (!move) {
              setRunning(false);
              setGameOver(true);
              return prevSnake;
            }

            const newHead = { x: head.x + move.x, y: head.y + move.y };
            const newSnake = [newHead, ...prevSnake];
            const ateFood = newHead.x === food.x && newHead.y === food.y;

            if (ateFood) {
              setScore((p) => p + 100);
              const fresh = getNewFood(newSnake, gridSize);
              if (!fresh) setRunning(false);
              else setFood(fresh);
            } else {
              newSnake.pop();
            }

            const hitSelf = newSnake
              .slice(1)
              .some((seg) => seg.x === newHead.x && seg.y === newHead.y);
            if (hitSelf) {
              setRunning(false);
              setGameOver(true);
              return prevSnake;
            }

            // sync Hamiltonian index if we happen to be on the path
            const newIndex = path.findIndex(
              (p) => p.x === newHead.x && p.y === newHead.y
            );
            if (newIndex !== -1) setIndex(newIndex);

            // If we just grew to/over threshold, prime alignment on next tick
            const newRatio = newSnake.length / totalCells;
            if (newRatio >= 0.05 && !aligningInitGuard.current) {
              aligningInitGuard.current = true;
              // compute alignment waypoints:
              const midX = Math.floor(gridSize / 2);
              const midY = Math.floor(gridSize / 2);
              const maxY = gridSize - 1;
              const cycleStart = path[0]!; // path always exists, and therefor so does its first position

              const wps: Position[] = [
                { x: 0, y: midY },   // center-left
                { x: 0, y: maxY },   // bottom-left
                { x: midX, y: maxY },// bottom-center
                cycleStart,          // Hamiltonian entry
              ];

              setWaypoints(wps);
              setWpIndex(0);
              setMode("aligning");
            }

            return newSnake;
          }

          // If we crossed threshold without eating this tick, also init alignment
          if (!aligningInitGuard.current) {
            aligningInitGuard.current = true;
            const midX = Math.floor(gridSize / 2);
            const midY = Math.floor(gridSize / 2);
            const maxY = gridSize - 1;
            const cycleStart = path[0]!;

            const wps: Position[] = [
              { x: 0, y: midY },
              { x: 0, y: maxY },
              { x: midX, y: maxY },
              cycleStart,
            ];
            setWaypoints(wps);
            setWpIndex(0);
            setMode("aligning");
          }

          return prevSnake; // nothing else to do this tick
        }

        // ---------- MODE: ALIGNING ----------
        // the fun transition between free mode and hamiltonian, now with 90% fewer instant deaths
        if (mode === "aligning") {
          const target = waypoints[wpIndex];

          // If for any reason current target is undefined, fail safe into Hamiltonian - this shouldn't ever happen
          if (!target) {
            setMode("hamiltonian");
            return prevSnake;
          }

          // Step toward the current waypoint
          const step = chooseSafeStep(head, target, prevSnake, gridSize);
          if (!step) {
            // No safe step found — bail into Hamiltonian rather than die
            setMode("hamiltonian");
            return prevSnake;
          }

          const newHead = { x: head.x + step.x, y: head.y + step.y };
          const newSnake = [newHead, ...prevSnake];

          // Don’t intentionally eat during alignment; but if it happens organically, make sure the snake growth still happens
          const ateFood = newHead.x === food.x && newHead.y === food.y;
          if (ateFood) {
            setScore((p) => p + 100);
            const fresh = getNewFood(newSnake, gridSize);
            if (!fresh) setRunning(false);
            else setFood(fresh);
          } else {
            newSnake.pop();
          }

          const hitSelf = newSnake
            .slice(1)
            .some((seg) => seg.x === newHead.x && seg.y === newHead.y);
          if (hitSelf) {
            // If aligning gets us boxed in, hand control to Hamiltonian next tick
            setMode("hamiltonian");
            return prevSnake;
          }

          // If reached (or effectively reached) the waypoint, position 0, the starting point in the path
          const reached =
            Math.abs(newHead.x - target.x) + Math.abs(newHead.y - target.y) <= 1;

          if (reached) {
            if (wpIndex < waypoints.length - 1) {
              setWpIndex(wpIndex + 1);
            } else {
              // Finished alignment → snap Hamiltonian index and switch
              const startIdx = path.findIndex(
                (p) => p.x === newHead.x && p.y === newHead.y
              );
              setIndex(startIdx !== -1 ? startIdx : 0);
              setMode("hamiltonian");
            }
          }

          return newSnake;
        }

        // ---------- MODE: HAMILTONIAN ----------
        // After we transition into the hamiltonian path, we want the snake to cut corners. Fewer and fewer corners as she gets longer and is in more danger of not filling the whole board
        const maxSkip =
          ratio < 0.1 ? 30 : ratio < 0.2 ? 20 : ratio < 0.25 ? 15 : ratio < 0.3 ? 5 : 1;

        const headDist = manhattan(head, food);
        const foodIndex = path.findIndex((p) => p.x === food.x && p.y === food.y);

        let chosenIndex = (index + 1) % path.length;
        let nextCell = path[chosenIndex];
        let bestDist = headDist;

        for (let skip = 2; skip <= maxSkip; skip++) {
          const testIndex = (index + skip) % path.length;
          const testCell = path[testIndex]!;
          const dx = Math.abs(testCell.x - head.x);
          const dy = Math.abs(testCell.y - head.y);
          const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
          const collides = prevSnake.some(
            (seg) => seg.x === testCell.x && seg.y === testCell.y
          );

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

        const hitSelf = newSnake
          .slice(1)
          .some((seg) => seg.x === newHead.x && seg.y === newHead.y);
        if (hitSelf) {
          setRunning(false);
          setGameOver(true);
          return prevSnake;
        }

        return newSnake;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [enabled, running, gameOver, path, index, food, gridSize, mode, waypoints, wpIndex]);

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
    direction: { x: 0, y: 0 }, // was null before TS
    setDirection: () => {},
    inputLocked: false,
    setInputLocked: () => {},
    path,
    setPath: () => {}, // placeholder, since path is static
    pathIndex: index,
    setPathIndex: setIndex
  }
}