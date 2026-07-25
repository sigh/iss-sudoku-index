// Title: Modds and Mevens
// Author: Scojo
// Video: https://www.youtube.com/watch?v=8zMOLRb5aYg
// Source: https://sudokupad.app/gsm8ktttzl

// Rules encoded:
// - Normal sudoku (default row/column/box AllDifferent).
// - Modular Lines (teal): every 3 consecutive cells along a line contain one
//   digit from each of {1,4,7}, {2,5,8}, {3,6,9} -- Modular(3, ...).
// - Odd Lots (circle): a circled cell's digit equals the count of odd digits
//   on its own line, drawn line included. The circled cell is itself part of
//   the line, so its own digit is one of the counted digits.
// - Even Lots (square): same, but the squared cell's digit equals the count
//   of even digits on its line.
// - Little Killer: the outside "47" clue with a down-right arrow at the
//   grid's top-left corner gives the sum of the main diagonal R1C1-R9C9.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// The four teal modular lines, transcribed in drawn stroke order. Circle and
// square markers are drawn as small icons centred on one cell of a line; each
// is matched below to the line cell at that grid position.
const LINE_A = ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8',
  'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R2C2',
  'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8'];
const LINE_B = ['R6C6', 'R6C5', 'R5C5', 'R5C6', 'R4C6', 'R4C7',
  'R5C7', 'R5C8', 'R6C8', 'R6C7'];
const LINE_C = ['R4C9', 'R5C9', 'R6C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R6C4'];
const LINE_D = ['R4C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2', 'R8C3', 'R9C3', 'R9C4'];

const modularLines = [LINE_A, LINE_B, LINE_C, LINE_D].map(
  cells => new Modular(3, ...cells));

// Odd Lots / Even Lots clue cells, each paired with the line it sits on.
const ODD_LOTS = [
  { cell: 'R3C8', line: LINE_A },
  { cell: 'R5C8', line: LINE_B },
  { cell: 'R7C8', line: LINE_C },
];
const EVEN_LOTS = [
  { cell: 'R6C8', line: LINE_B },
  { cell: 'R7C6', line: LINE_C },
  { cell: 'R4C2', line: LINE_D },
];

// Self-referential counting NFA: the first scanned cell is the clue cell
// itself (its digit is both the target count and, via `hit`, one of the
// counted digits); the remaining cells are the rest of that line, in any
// order -- only the total count matters, not cell order. `count` is clamped
// at target+1 once it can only fail, per the bounded-counting pattern.
const oddCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition({ target, count }, value) {
    const hit = (value % 2 === 1) ? 1 : 0;
    if (target === null) return { target: value, count: hit };
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);
const evenCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition({ target, count }, value) {
    const hit = (value % 2 === 0) ? 1 : 0;
    if (target === null) return { target: value, count: hit };
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);

const oddLots = ODD_LOTS.map(({ cell, line }) => new NFA(
  oddCountSpec, 'OddLots', cell, ...line.filter(c => c !== cell)));
const evenLots = EVEN_LOTS.map(({ cell, line }) => new NFA(
  evenCountSpec, 'EvenLots', cell, ...line.filter(c => c !== cell)));

// Little Killer: outside "47" badge with a down-right arrow drawn at the
// grid's top-left corner -- the main diagonal.
const littleKiller = LittleKiller.fromCells(47, graph.ray('R1C1', 1, 1), geometry);

return [
  new Shape('9x9'),

  ...modularLines,
  ...oddLots,
  ...evenLots,
  littleKiller,
];
