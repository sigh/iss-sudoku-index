// Title: Loopy Odysee
// Author: gdc
// Video: https://www.youtube.com/watch?v=wjkcBGAxjiI
// Source: https://sudokupad.app/fjllpp2awq

// Standard 9x9 Sudoku. A one-cell-wide orthogonal loop may touch diagonally but
// not orthogonally. Neighbouring loop digits differ by at least 5. Circles lie
// on the loop and count the cells in their within-box loop segments.

const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

// Drawn circle centres from the source artwork.
const circles = ['R1C1', 'R2C5', 'R4C7', 'R6C1', 'R7C6', 'R9C4'];

// Loop membership: every paired Var cell is on or off; every drawn circle is on.
const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  ...loop.at(circles).map(cell => new Given(cell, ON)),
];

// Each on cell has exactly two orthogonally adjacent on cells. Together with
// ConnectedValues this is one loop; it permits diagonal contact as stated.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') return value === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// For each orthogonal pair, read membership and digit for both cells. The digit
// condition applies only when both cells are consecutive loop cells.
const differenceMachine = NFA.encodeSpec({
  startState: { phase: 'aMembership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aMembership': return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit': return { phase: 'bMembership', a: value };
      case 'bMembership': return value === ON ? { phase: 'bDigit', a: state.a } : { phase: 'skip', left: 1 };
      case 'bDigit': return Math.abs(state.a - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip': return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const differences = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(differenceMachine, 'difference',
    loop.at(cell), cell, loop.at(other), other)));

// A circle's segment is its connected component of on-loop cells inside its 3x3
// box. This NFA reads all nine box memberships then the circle digit and accepts
// precisely when that component has the indicated size.
function segmentMachine(circleIndex) {
  return NFA.encodeSpec({
    startState: { cells: [] },
    transition: ({ cells, count }, value) => {
      if (cells === undefined && count === undefined) return { done: true };
      if (count !== undefined) return value === count ? { done: true } : undefined;
      const next = [...cells, value === ON];
      if (next.length < 9) return { cells: next };
      const seen = new Set([circleIndex]);
      const pending = [circleIndex];
      while (pending.length) {
        const index = pending.pop();
        const row = Math.floor(index / 3), col = index % 3;
        for (const [dRow, dCol] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const other = (row + dRow) * 3 + col + dCol;
          if (row + dRow >= 0 && row + dRow < 3 && col + dCol >= 0 && col + dCol < 3 &&
              next[other] && !seen.has(other)) {
            seen.add(other);
            pending.push(other);
          }
        }
      }
      return { count: seen.size };
    },
    accept: ({ done }) => done === true,
  }, geometry.numValues);
}
const segmentCounts = circles.map(circle => {
  const { row, col } = parseCellId(circle);
  const box = Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
  const cells = graph.box(box);
  return new NFA(segmentMachine(cells.indexOf(circle)), 'segment count', ...loop.at(cells), circle);
});

return [
  new Shape('9x9'),
  new Given('R5C8', 8), new Given('R6C3', 7), new Given('R7C5', 4),
  loop.toVar('loop'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  ...differences,
  ...segmentCounts,
];
