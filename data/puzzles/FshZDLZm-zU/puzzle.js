// Title: Year of the Dragon
// Author: Marushia Dark
// Video: https://www.youtube.com/watch?v=FshZDLZm-zU
// Source: https://sudokupad.app/bDLDDJTNLG

// Rules encoded here:
//  - Normal sudoku.
//  - Adjacent digits on a coloured line differ by at least the digit in the
//    cell of the same colour: purple R1C1 (3), brown R9C1 (4), blue R9C3 (2),
//    green R9C6 (5), grey R1C8 (no given, so its whisper reads that cell).
//  - The grey line and the single purple line each hold a set of non-repeating
//    consecutive digits in any order.
//  - Two dragons. Each runs between two of the four red dots through cells that
//    are orthogonally or diagonally adjacent, and its digits are a run of
//    consecutive digits in order along it. Dragons may touch; they may not
//    branch, take a cell of the other dragon, or enter an X cell.
//
// Omitted: "may not cross" is encoded as "no cell belongs to two dragon
// routes". Whether it additionally forbids two diagonal dragon steps that cross
// at a shared grid corner is left unencoded, so such crossings are allowed here.

const graph = cellGraph('9x9');

// Coloured strokes, transcribed from the drawn line waypoints.
const greyLine = ['R7C8', 'R7C7', 'R7C6'];
const purpleStrokes = [
  ['R1C2', 'R2C3', 'R2C4', 'R3C3'],
  ['R2C3', 'R2C2', 'R2C1', 'R3C2'],
];
const greenLine = ['R1C6', 'R2C6', 'R3C6', 'R3C7', 'R3C8', 'R4C7', 'R4C6',
  'R5C6', 'R6C6', 'R7C6', 'R8C7', 'R8C8', 'R8C9', 'R7C9'];
const brownStrokes = [
  ['R4C3', 'R4C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
  ['R5C2', 'R5C1', 'R6C1', 'R6C2'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R2C6', 'R2C7', 'R2C8'],
];
const blueStrokes = [
  ['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R7C2'],
  ['R6C6', 'R6C7', 'R6C8'],
  ['R3C3', 'R3C2', 'R3C1'],
];
// The two purple strokes meet at R2C3, so the rules' "one purple line" is their
// seven-cell union; the whisper still binds only the pairs actually drawn.
const purpleCells = [...new Set(purpleStrokes.flat())];

// Red dots (dragon ends) and X cells (barred to dragons), from the drawn marks.
const redDots = ['R1C8', 'R2C6', 'R3C7', 'R5C1'];
const barredCells = ['R2C9', 'R5C4'];

// The grey whisper's threshold is the digit in R1C8 rather than a written
// number, so it is read from that cell: [threshold, a, b] with |a - b| >= it.
const greyWhisper = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, limit: value };
    if (s.k === 1) return { k: 2, limit: s.limit, first: value };
    if (s.k === 2) return Math.abs(s.first - value) >= s.limit ? { k: 3 } : undefined;
    return undefined;
  },
  accept: s => s.k === 3,
}, 9);
const greyWhisperPairs = greyLine.slice(1).map(
  (cell, i) => new NFA(greyWhisper, 'grey whisper', 'R1C8', greyLine[i], cell));

// --- Dragons -------------------------------------------------------------
// A dragon's digits rise by one along it, so its cells are already ordered by
// their digits. Each cell carries two pointers: UP names the neighbour holding
// the next digit up, DOWN the neighbour holding the next digit down, and NONE
// says there is no such neighbour. A dragon is then a chain of pointers.
const NONE = 1;
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const dirCode = i => i + 2;                  // NONE is 1, the 8 steps are 2..9
const opposite = i => DIRS.length - 1 - i;   // DIRS is symmetric about its middle

const up = graph.makeOverlay('VU');
const down = graph.makeOverlay('VD');

// A pointer may only name a step that stays on the grid.
const pointerDomains = graph.cells().flatMap(cell => {
  const codes = DIRS.flatMap(
    ([dR, dC], i) => graph.step(cell, dR, dC) ? [dirCode(i)] : []);
  if (codes.length === DIRS.length) return [];
  return [new Given(up.at(cell), NONE, ...codes),
  new Given(down.at(cell), NONE, ...codes)];
});

// One machine per step direction, reading [UP(cell), DOWN(neighbour), cell,
// neighbour]. The two pointers must agree on whether the step is taken, and
// where it is taken the neighbour holds the next digit up.
const stepSpecs = DIRS.map((_, i) => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, value) => {
    if (s.k === 0) return { k: 1, taken: value === dirCode(i) };
    if (s.k === 1) {
      const back = value === dirCode(opposite(i));
      return s.taken === back ? { k: 2, taken: s.taken } : undefined;
    }
    // need 0 marks a step not taken, leaving the two digits unrelated.
    if (s.k === 2) return { k: 3, need: s.taken ? value + 1 : 0 };
    if (s.k === 3) return s.need === 0 || value === s.need ? { k: 4 } : undefined;
    return undefined;
  },
  accept: s => s.k === 4,
}, 9));
const dragonSteps = DIRS.flatMap(([dR, dC], i) => graph.cells().flatMap(cell => {
  const next = graph.step(cell, dR, dC);
  return next ? [new NFA(stepSpecs[i], 'dragon step', up.at(cell), down.at(next),
    cell, next)] : [];
}));

// A cell with one pointer set and not the other ends a dragon, so only a red dot
// may be one; every other cell is either passed through (both pointers set) or
// off the dragons (neither). Each red dot is therefore an end, and since no cell
// carries two pointers of the same kind the four dots end exactly two chains.
const isEnd = Pair.fnToKey((u, d) => (u === NONE) !== (d === NONE), 9);
const notEnd = Pair.fnToKey((u, d) => (u === NONE) === (d === NONE), 9);
const dragonEnds = graph.cells().map(cell => new Pair(
  redDots.includes(cell) ? isEnd : notEnd,
  redDots.includes(cell) ? 'dragon end' : 'not a dragon end',
  up.at(cell), down.at(cell)));

const barred = barredCells.flatMap(
  cell => [new Given(up.at(cell), NONE), new Given(down.at(cell), NONE)]);

return [
  new Shape('9x9'),
  new Given('R1C1', 3), new Given('R9C1', 4),
  new Given('R9C3', 2), new Given('R9C6', 5),

  ...purpleStrokes.map(cells => new Whisper(3, ...cells)),
  new Whisper(5, ...greenLine),
  ...brownStrokes.map(cells => new Whisper(4, ...cells)),
  ...blueStrokes.map(cells => new Whisper(2, ...cells)),
  ...greyWhisperPairs,
  new Renban(...greyLine),
  new Renban(...purpleCells),

  up.toVar('dragon step to the next digit up'),
  down.toVar('dragon step to the next digit down'),
  ...pointerDomains,
  ...barred,
  ...dragonSteps,
  ...dragonEnds,
];
