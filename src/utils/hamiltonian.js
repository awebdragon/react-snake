// the not-so-AI intelligence of the self-playing snake
export const generateHamiltonianCycle = (gridSize) => {
  const path = [];

  for (let y = 0; y < gridSize; y++) {
    if (y % 2 === 0) {
      // left-to-right on even rows
      for (let x = 0; x < gridSize; x++) {
        path.push({ x, y });
      }
    } else {
      // right-to-left on odd rows
      for (let x = gridSize - 1; x >= 0; x--) {
        path.push({ x, y });
      }
    }
  }

  // close the loop: return to starting cell
  path.push(path[0]);

  return path;
};