// Title: The Door around the Corner
// Author: XeonRisq
// Video: https://www.youtube.com/watch?v=716VK2JTMmo
// Source: https://app.crackingthecryptic.com/sudoku/Q2FPmtQ8FN

// Rules encoded below, in order:
//  1. Normal sudoku (9x9, standard boxes), plus the single given R8C7 = 8.
//  2. Outside clues. A clue is a digit X printed outside the frame with an arrow
//     head giving a diagonal direction. The ray starts in the cell the arrow points
//     into, runs diagonally until it would leave the grid, reflects 90 degrees off
//     that edge and continues until it would leave again; every ray here is nine
//     cells long, as the rules say. Let N be the digit in the ray's first cell:
//     the ray's Nth cell holds X, and no earlier ray cell holds X ("N will always
//     refer to the first occurrence of X"). Cells after the Nth are unrestricted.
//  3. Beige lines: every three sequential cells hold one low (1-3), one middle
//     (4-6) and one high (7-9) digit.
//  4. Blue lines: every three sequential cells must NOT do that.
// Nothing is omitted.

const shape = new Shape('9x9');

// Drawn clue data: the printed digit, the cell the arrow head points into, and the
// arrow's diagonal step as [rowStep, colStep]. Ten digits and eleven arrow heads are
// printed around the frame: the "5" left of R5 carries two arrow heads (one up-right,
// one down-right), so that digit appears twice.
const outsideClues = [
  { x: 5, entry: 'R1C2', step: [1, 1] },    // above C1, down-right
  { x: 5, entry: 'R1C5', step: [1, -1] },   // above C6, down-left
  { x: 5, entry: 'R1C8', step: [1, 1] },    // above C7, down-right
  { x: 4, entry: 'R3C1', step: [1, 1] },    // left of R2, down-right
  { x: 5, entry: 'R4C1', step: [-1, 1] },   // left of R5, up-right
  { x: 5, entry: 'R6C1', step: [1, 1] },    // left of R5, down-right
  { x: 5, entry: 'R7C1', step: [-1, 1] },   // left of R8, up-right
  { x: 5, entry: 'R3C9', step: [-1, -1] },  // right of R4, up-left
  { x: 2, entry: 'R6C9', step: [-1, -1] },  // right of R7, up-left
  { x: 3, entry: 'R9C5', step: [-1, -1] },  // below C6, up-left
  { x: 3, entry: 'R9C8', step: [-1, 1] },   // below C7, up-right
];

const inGrid = (row, col) => row >= 1 && row <= 9 && col >= 1 && col <= 9;

// Walk one clue's ray. At the edge, the axis that would go out of range flips sign,
// which is the rules' 90-degree reflection; the walk stops the second time it is
// cornered, so a ray is generated rather than transcribed.
const rayCells = ({ entry, step }) => {
  let { row, col } = parseCellId(entry);
  let [dr, dc] = step;
  const cells = [makeCellId(row, col)];
  let reflected = false;
  for (;;) {
    if (!inGrid(row + dr, col + dc)) {
      if (reflected) return cells;
      if (!inGrid(row + dr, col)) dr = -dr;
      if (!inGrid(row, col + dc)) dc = -dc;
      reflected = true;
    }
    row += dr;
    col += dc;
    cells.push(makeCellId(row, col));
  }
};

// One machine per clue, reading the ray's nine digits in order.
//   { n, i }      still short of the target: N is known, i cells have been read.
//   { done: true } the Nth cell has been read and held X; the rest is free.
// The start state { n: 0, i: 0 } has read nothing. A first cell of 1 makes the
// first cell itself the target, so it must equal X; any other first cell equal to X
// would put X before the Nth cell, which the "first occurrence" clause forbids.
const doorSpec = (x) => NFA.encodeSpec({
  startState: { n: 0, i: 0 },
  transition: (state, value) => {
    if (state.done) return state;
    if (state.i === 0) {
      if (value === 1) return x === 1 ? { done: true } : undefined;
      if (value === x) return undefined;
      return { n: value, i: 1 };
    }
    const pos = state.i + 1;
    if (pos === state.n) return value === x ? { done: true } : undefined;
    return value === x ? undefined : { n: state.n, i: pos };
  },
  accept: (state) => state.done === true,
}, shape);

const doorClues = outsideClues.map(
  (clue) => new NFA(doorSpec(clue.x), `door${clue.x}`, ...rayCells(clue)));

// Drawn line strokes, by colour. The four inner strokes share their corner cells but
// are four separate strokes in two colours, so each carries its own rule.
const beigeLines = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
];

const blueLines = [
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
];

// 0 = low (1-3), 1 = middle (4-6), 2 = high (7-9).
const band = (value) => Math.floor((value - 1) / 3);

// Sliding window of the previous two cells' bands; a third band distinct from both
// would complete a low/middle/high set, so that branch is rejected. Every window of
// three is therefore checked as it is read, and `accept` has nothing left to test.
const antiEntropicSpec = NFA.encodeSpec({
  startState: { a: null, b: null },
  transition: ({ a, b }, value) => {
    const c = band(value);
    if (a !== null && a !== b && b !== c && a !== c) return undefined;
    return { a: b, b: c };
  },
  accept: () => true,
}, shape);

return [
  shape,
  new Given('R8C7', 8),
  ...doorClues,
  ...beigeLines.map((cells) => new Entropic(...cells)),
  ...blueLines.map((cells, i) => new NFA(antiEntropicSpec, `blue${i + 1}`, ...cells)),
];
