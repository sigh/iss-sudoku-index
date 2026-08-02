// Title: Sphere of Influence
// Author: sdholmes
// Video: https://www.youtube.com/watch?v=EwD7JFa4JFo
// Source: https://sudokupad.app/rLBq9Fnt8L

// Normal Sudoku. Each circle/square cell gives the count of low (1-4)/high
// (5-9) digits in its inclusive 3x3 neighbourhood. The cell tables are the
// drawn circle and square centres.
const circles = ['R1C1', 'R2C9', 'R4C7', 'R7C6', 'R8C2', 'R9C7', 'R9C9'];
const squares = ['R1C6', 'R2C3', 'R3C3', 'R4C2', 'R5C1', 'R6C5', 'R6C6',
  'R6C7', 'R7C7', 'R7C8', 'R9C1', 'R9C2'];
const graph = cellGraph('9x9');

function neighbourhoodCountMachine(isCounted) {
  // First read the marked cell as the target. State then retains that target
  // and a saturated count of the predicate in the inclusive neighbourhood.
  return NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      const nextCount = count + (isCounted(value) ? 1 : 0);
      if (target === null) return { target: value, count: nextCount };
      return { target, count: Math.min(nextCount, target + 1) };
    },
    accept: ({ target, count }) => target !== null && count === target,
    maxDepth: 9,
  }, 9);
}

const lowCount = neighbourhoodCountMachine(value => value >= 1 && value <= 4);
const highCount = neighbourhoodCountMachine(value => value >= 5 && value <= 9);

return [
  new Shape('9x9'),
  new Given('R1C5', 8),
  new Given('R3C3', 8),
  // One NFA per drawn circle/square; each ordered list starts with its clue cell.
  ...circles.map(cell => new NFA(lowCount, 'low count', cell, ...graph.kingNeighbours(cell))),
  ...squares.map(cell => new NFA(highCount, 'high count', cell, ...graph.kingNeighbours(cell))),
];
