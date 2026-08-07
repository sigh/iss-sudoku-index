// Title: Tough Centre
// Author: Igor Jaskulski
// Video: https://www.youtube.com/watch?v=DAMOAheL-Ik
// Source: https://app.crackingthecryptic.com/sudoku/FjqjGf9HFL

// Normal sudoku rules apply, with standard 3x3 boxes (the payload's regions
// are the default box partition). Four thermometers (Thermo, bulb first)
// require increasing digits from the bulb, drawn as a filled circle
// overlay/underlay at the line's first cell. Two same-coloured (#A3E048,
// the puzzle's "green") lines require adjacent digits to differ by >= 5
// (Whisper(5, ...)). Outside-grid numbers are diagonal sums (LittleKiller);
// "these digits may repeat if allowed by other rules" needs no separate
// constraint, since a diagonal is never a full row/column/box. White dots
// (WhiteDot) mark consecutive pairs, X (X) pairs summing to 10, V (V) pairs
// summing to 5; the rules state not every possible X/V/dot is drawn, so an
// unmarked adjacent pair carries no constraint either way.

const thermos = [
  ['R1C6', 'R2C5', 'R2C6'], // bulb: circle overlay at R1C6
  ['R5C9', 'R4C8', 'R4C7'], // bulb: circle overlay at R5C9
  ['R4C4', 'R5C4', 'R6C5'], // bulb: circle overlay at R4C4
  ['R6C2', 'R6C3', 'R7C4'], // bulb: circle underlay at R6C2
].map(cells => new Thermo(...cells));

const greenLines = [
  ['R1C1', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R7C1'],
  ['R7C9', 'R8C8', 'R9C7'],
].map(cells => new Whisper(5, ...cells));

// Diagonal-sum cells, in the order the drawn arrow enters the grid.
// LittleKiller.fromCells derives ISS's canonical corner/direction from the
// cell list itself, rather than requiring it hand-picked (its cell map is
// built by walking fixed per-side rays, so the canonical corner is not
// always the cell nearest the drawn arrowhead -- for the "17" clue below it
// is the far end, R9C8).
const geometry9x9 = cellGeometry('9x9');
const littleKillers = [
  [9, ['R1C2', 'R2C1']],                     // arrow above C3
  [30, ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1']], // arrow above C7
  [17, ['R8C9', 'R9C8']],                     // arrow right of R7
].map(([sum, cells]) => LittleKiller.fromCells(sum, cells, geometry9x9));

const whiteDots = [
  ['R3C1', 'R3C2'],
  ['R5C1', 'R6C1'],
  ['R7C7', 'R8C7'],
  ['R3C7', 'R3C8'],
  ['R2C5', 'R2C6'],
].map(cells => new WhiteDot(...cells));

const xClues = [
  ['R1C1', 'R2C1'],
  ['R2C3', 'R2C4'],
  ['R3C4', 'R3C5'],
  ['R5C4', 'R5C5'],
  ['R4C6', 'R5C6'],
  ['R5C9', 'R6C9'],
  ['R6C7', 'R7C7'],
  ['R8C8', 'R9C8'],
  ['R8C9', 'R9C9'],
  ['R8C4', 'R8C5'],
  ['R8C3', 'R9C3'],
  ['R7C1', 'R8C1'],
].map(cells => new X(...cells));

const vClues = [
  ['R7C3', 'R8C3'],
  ['R5C8', 'R5C9'],
  ['R1C3', 'R2C3'],
].map(cells => new V(...cells));

return [
  new Shape('9x9'),
  new Given('R1C5', 5),
  new Given('R9C5', 1),
  ...thermos,
  ...greenLines,
  ...littleKillers,
  ...whiteDots,
  ...xClues,
  ...vClues,
];
