// Title: These Aren't The Circles You're Looking For
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=kFyUDHPqVmM
// Source: https://sudokupad.app/9t76BmHtFp

// Standard Sudoku. Each VS cell records whether its matching grid cell is
// unshaded (1) or shaded (2). For each digit N, its shaded count is zero or N.
// A circle digit equals the shaded-digit sum in its clipped 3x3 neighbourhood.

const UNSHADED = 1;
const SHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();
const circleCells = [
  'R1C1', 'R1C2', 'R1C4', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R2C1', 'R2C2', 'R2C8', 'R2C9', 'R4C1', 'R5C4', 'R5C6',
  'R7C4', 'R7C9', 'R8C1', 'R8C2', 'R8C9', 'R9C1', 'R9C2', 'R9C4',
];

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], UNSHADED, SHADED));

// The NFA reads grid and shade cells in pairs, retaining only a bounded count
// of shaded occurrences of one fixed digit.
function shadedCountMachine(target) {
  return NFA.encodeSpec({
    startState: { digit: null, count: 0 },
    transition: ({ digit, count }, value) => {
      if (digit === null) return { digit: value, count };
      const next = count + (digit === target && value === SHADED ? 1 : 0);
      return next > target ? undefined : { digit: null, count: next };
    },
    accept: ({ digit, count }) => digit === null && (count === 0 || count === target),
    maxDepth: gridCells.length * 2,
  }, 9);
}

// The circle is read first, followed by grid/shade pairs in its local window.
// A running sum above the circle digit cannot recover, so it is rejected early.
const circleSumMachine = NFA.encodeSpec({
  startState: { target: null, digit: null, sum: 0 },
  transition: ({ target, digit, sum }, value) => {
    if (target === null) return { target: value, digit: null, sum: 0 };
    if (digit === null) return { target, digit: value, sum };
    const next = sum + (value === SHADED ? digit : 0);
    return next > target ? undefined : { target, digit: null, sum: next };
  },
  accept: ({ target, digit, sum }) => target !== null && digit === null && sum === target,
  maxDepth: 19,
}, 9);

const shadedCounts = Array.from({ length: 9 }, (_, index) => {
  const target = index + 1;
  return new NFA(shadedCountMachine(target), `shaded-${target}`,
    ...gridCells.flatMap(cell => [cell, shade.at(cell)]));
});

const circleSums = circleCells.map(circle => {
  const cells = [circle, ...graph.kingNeighbours(circle)];
  return new NFA(circleSumMachine, 'shaded-neighbourhood-sum', circle,
    ...cells.flatMap(cell => [cell, shade.at(cell)]));
});

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new Given('R5C5', 2, 4, 6, 8),
  ...shadedCounts,
  ...circleSums,
];
