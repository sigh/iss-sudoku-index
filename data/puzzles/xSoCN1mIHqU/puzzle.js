// Title: Diamond Heist
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=xSoCN1mIHqU
// Source: https://sudokupad.app/2od7bk8x77?setting-digitoutlines=0

// Normal sudoku rules apply (standard 3x3 boxes; no givens).
//
// Escape path: a path from the ventilation shaft (R9C9) to the door (R2C1),
// moving orthogonally, never revisiting a cell, never crossing one of the
// seven coloured display plinths (the diamond cells), and never stepping on
// a cell holding an even digit.
//
// Diamonds: each diamond cell's digit equals the sum of the digits on the
// "key" cells sharing its plinth's colour and letter. No two diamonds share
// a digit.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// --- Diamond / key letter groups -------------------------------------------
// Cell positions read from the drawn letter-labelled circles matched by
// colour and letter to each diamond's plinth (see the puzzle's colour/letter
// key).
const diamonds = {
  A: 'R1C9', B: 'R3C3', C: 'R3C5', D: 'R5C6',
  E: 'R5C8', F: 'R6C2', G: 'R8C8',
};
const keys = {
  A: ['R6C5'],
  B: ['R6C1', 'R5C7'],
  C: ['R3C9', 'R8C2'],
  D: ['R3C2', 'R4C1', 'R4C3'],
  E: ['R6C4'],
  F: ['R2C3', 'R2C8', 'R3C1', 'R7C3', 'R7C6', 'R9C3'],
  G: ['R7C9', 'R8C9', 'R9C8'],
};
const plinthCells = Object.values(diamonds);

// Arrow's first cell is the sum target; the rest are the addends -- exactly
// "diamond digit = sum of its matching keys' digits".
const diamondSums = Object.entries(diamonds).map(
  ([letter, cell]) => new Arrow(cell, ...keys[letter]));

// --- Escape path -------------------------------------------------------
// Solver-discovered simple path with two fixed endpoints: one Var per grid
// cell holds path membership (ON/OFF). ConnectedValues gives one connected
// ON region; degree 1 at the two endpoints and degree 2 at every other ON
// cell forces that region to be a single simple path (orthogonal self-touch
// is already excluded, since a self-touch cell would need a 3rd ON
// neighbour, which the degree check rejects).
const START = 'R9C9';
const END = 'R2C1';
const ON = 1;
const OFF = 2;

const path = graph.makeOverlay('VP');

const pathMembership = [
  path.makeReplicate(new Given(path.cells()[0], ON, OFF)),
  new Given(path.at(START), ON),
  new Given(path.at(END), ON),
  ...path.at(plinthCells).map(cell => new Given(cell, OFF)),
];

// Reads this cell's own membership, then each orthogonal neighbour's, and
// accepts an off cell unconditionally or an on cell with exactly `target`
// on-neighbours. `target` is 1 at the two path endpoints, 2 everywhere else.
function degreeMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, membership) => {
      if (phase === 'start') {
        return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (membership === ON ? 1 : 0);
      return count > target ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
  }, geometry.numValues);
}
const endpointDegree = degreeMachine(1);
const interiorDegree = degreeMachine(2);
const endpoints = new Set([START, END]);
const pathDegrees = gridCells.map(cell => new NFA(
  endpoints.has(cell) ? endpointDegree : interiorDegree,
  'path-degree', ...path.at([cell, ...graph.neighbours(cell)])));

// Alarm rule: any on-path cell's digit must be odd. Reads (membership,
// digit); an off cell is unconstrained.
const noEvenOnPath = Pair.fnToKey(
  (membership, digit) => membership === OFF || digit % 2 === 1, geometry.numValues);
const pathParity = gridCells.map(
  cell => new Pair(noEvenOnPath, 'path-parity', path.at(cell), cell));

return [
  new Shape('9x9'),
  ...diamondSums,
  new AllDifferent(...plinthCells),
  path.toVar('path'),
  ...pathMembership,
  new ConnectedValues('VP', ON),
  ...pathDegrees,
  ...pathParity,
];
