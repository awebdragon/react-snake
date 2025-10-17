// food helper
export const getNewFood = (snake, gridSize) => {
  let newFood;
  let attempts = 0;

  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    }
    attempts++
    // safety net to avoid infinite loop if the snake fills almost the whole board
    if (attempts > gridSize * gridSize) {
      return null; // signal "no room left"
    }
  } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));

  return newFood;
};