// Title: Killer On The Road
// Author: Zombie Hunter
// Video: https://www.youtube.com/watch?v=0CzXpiCYE6Q
// Source: https://app.crackingthecryptic.com/sudoku/F4ThRDdQRp

// Normal sudoku. A hidden 1-cell-wide loop of orthogonally-connected cells
// may touch itself diagonally but not orthogonally. A cell's digit next to a
// drawn arrow gives the count of loop cells beyond it (own cell excluded)
// along that direction, to the grid's edge. "All possible arrows are given"
// is an exhaustiveness clause: at every (cell, direction) with no drawn
// arrow, that direction's loop-count must NOT equal the cell's digit. Each
// cage's small corner total sums only that cage's on-loop cells (0..all of
// them); the ordinary killer "no repeat" still covers every cage cell
// regardless of loop membership.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Loop-membership overlay: one Var per grid cell, ON (1) or OFF (2). Degree-2
// on ON cells + ConnectedValues gives a single simple cycle (nordschleife.js
// pattern); unlike that script, no no-diagonal-touch NFA is added, since this
// rule permits a diagonal self-touch.
const ON = 1;
const OFF = 2;
const loop = graph.makeOverlay('VL');
const loopDomain = loop.makeReplicate(new Given(loop.cells()[0], ON, OFF));

// --- Degree 2 on ON cells, free on OFF cells. ---
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = graph.cells().map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// ConnectedValues requires a non-empty single ON region, so this alone also
// forbids the trivial "no loop at all" grid.
const singleLoop = new ConnectedValues('VL', ON);

// --- Directional loop-count arrows + the "all possible arrows" negative. ---
// One NFA per row/column and direction, scanning cell-by-cell from the far
// edge toward the near edge so the running ON-count seen so far is already
// the correct "cells beyond, this way" count for the next cell to be read.
// At each cell: an arrow drawn there requires count === digit; otherwise the
// exhaustiveness clause requires count !== digit.
//
// Drawn arrows, decoded from the payload's arrow waypoint geometry:
const markedDown = new Set(['R1C1', 'R5C5']);
const markedRight = new Set(['R2C6', 'R5C5']);
const markedLeft = new Set(['R2C6', 'R9C9']);
const markedUp = new Set(['R5C7', 'R5C3', 'R8C4']);

function directionalCountNFAs(markedSet, cellsInOrderFn, lineIndices) {
  return lineIndices.map(n => {
    const cellsInOrder = cellsInOrderFn(n);
    const marked = cellsInOrder.map(cell => markedSet.has(cell));
    const machine = NFA.encodeSpec({
      startState: { phase: 'digit', pos: 0, count: 0 },
      transition: ({ phase, pos, count }, value) => {
        if (phase === 'digit') {
          const holds = marked[pos] ? value === count : value !== count;
          return holds ? { phase: 'membership', pos, count } : undefined;
        }
        const nextCount = count + (value === ON ? 1 : 0);
        return { phase: 'digit', pos: pos + 1, count: nextCount };
      },
      accept: ({ phase, pos }) => phase === 'digit' && pos === cellsInOrder.length,
      // pos climbs once per cell with no natural ceiling the compiler can see
      // (it never rejects on its own past the last cell), so bound state
      // creation explicitly at the real symbol count (two per cell).
      maxDepth: cellsInOrder.length * 2,
    }, geometry.numValues);
    const symbols = cellsInOrder.flatMap(cell => [cell, loop.at(cell)]);
    return new NFA(machine, 'loop-count', ...symbols);
  });
}

const lines = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rightScans = directionalCountNFAs(markedRight,
  r => [9, 8, 7, 6, 5, 4, 3, 2, 1].map(c => makeCellId(r, c)), lines);
const leftScans = directionalCountNFAs(markedLeft,
  r => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c)), lines);
const downScans = directionalCountNFAs(markedDown,
  c => [9, 8, 7, 6, 5, 4, 3, 2, 1].map(r => makeCellId(r, c)), lines);
const upScans = directionalCountNFAs(markedUp,
  c => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c)), lines);

// --- Cages: AllDifferent over every cell (loop membership irrelevant to
// that half of the rule) plus a running-sum NFA over just the on-loop cells
// for the total. Not a `Cage`/`Sum`, since those would total every cell.
//
// Cell lists transcribed from the payload's drawn cage cell arrays.
const cages = [
  { total: 8, cells: ['R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3'] },
  { total: 12, cells: ['R1C4', 'R2C4', 'R2C5', 'R1C5', 'R1C6', 'R2C6'] },
  { total: 16, cells: ['R1C7', 'R1C8', 'R2C8', 'R2C9', 'R3C9'] },
  { total: 20, cells: ['R4C8', 'R5C8', 'R6C8', 'R6C9', 'R4C9', 'R5C9'] },
  { total: 24, cells: ['R7C9', 'R8C9', 'R8C8', 'R9C8', 'R9C7'] },
  { total: 15, cells: ['R8C4', 'R9C4', 'R9C5', 'R8C5', 'R8C6', 'R9C6'] },
  { total: 17, cells: ['R7C1', 'R8C1', 'R8C2', 'R9C2', 'R9C3'] },
  { total: 20, cells: ['R4C1', 'R5C1', 'R6C1', 'R6C2', 'R5C2', 'R4C2'] },
  { total: 9, cells: ['R3C4', 'R4C4', 'R4C3'] },
  { total: 9, cells: ['R6C6', 'R7C6', 'R6C7'] },
  { total: 1, cells: ['R3C6', 'R4C6', 'R4C7'] },
  { total: 9, cells: ['R6C3', 'R6C4', 'R7C4'] },
];

function cageLoopSum(total, cells) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: ({ phase, sum, digit }, value) => {
      if (phase === 'digit') return { phase: 'membership', sum, digit: value };
      const nextSum = sum + (value === ON ? digit : 0);
      if (nextSum > total) return undefined; // sum only grows: dead branch
      return { phase: 'digit', sum: nextSum };
    },
    accept: ({ phase, sum }) => phase === 'digit' && sum === total,
  }, geometry.numValues);
  const symbols = cells.flatMap(cell => [cell, loop.at(cell)]);
  return new NFA(machine, 'cage-loop-sum', ...symbols);
}

const cageConstraints = cages.flatMap(({ total, cells }) => [
  new AllDifferent(...cells),
  cageLoopSum(total, cells),
]);

// Givens transcribed from the payload's drawn cell values. R3C2 and R7C8
// carry no drawn arrow and are plain sudoku givens here.
const givens = [
  ['R1C1', 4], ['R2C6', 2], ['R3C2', 9], ['R5C3', 4], ['R5C5', 1],
  ['R5C7', 3], ['R7C8', 9], ['R8C4', 2], ['R9C9', 3],
].map(([cell, value]) => new Given(cell, value));

return [
  new Shape('9x9'),
  loop.toVar('loop membership'),
  loopDomain,
  singleLoop,
  ...degrees,
  ...givens,
  ...rightScans, ...leftScans, ...downScans, ...upScans,
  ...cageConstraints,
];
