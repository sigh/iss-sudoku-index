// Title: Foggy Regional Constraints
// Author: Belamis
// Video: https://www.youtube.com/watch?v=bmeFslHcDMw
// Source: https://sudokupad.app/3w7wprj07z

// Normal sudoku rules apply. No given digits. Dynamic fog is a solving-UI
// mechanic (digits reveal more of the grid) and is not encoded.
//
// German Whispers (green lines): adjacent digits differ by at least 5.
// Killer cages: digits in a cage do not repeat, and sum to the cage's total
//   when one is shown; two cages show no total but are still real cages.
// Renban (purple lines): a non-repeating set of consecutive digits.
// Parity (peach lines): adjacent digits alternate odd/even.
// Kropki (black dots): the two digits are in a 1:2 ratio.
// Constraint Regions: each of the five rule types above may contain no
//   repeated digit anywhere in the puzzle -- i.e. beyond each individual
//   line/cage/dot's own local rule, the union of every cell that belongs to
//   that rule type is itself one all-different set.

const cages = [
  // Killer cages: cells and totals from the drawn cage geometry.
  new Cage(10, 'R7C6', 'R7C7', 'R7C8'),
  new Cage(12, 'R1C2', 'R2C2', 'R3C2'),
  // Cages below draw no total; their own within-cage distinctness is already
  // implied by the shared row/column, so they add no local constraint here,
  // but their cells still belong to the killer constraint-region set.
];
const cageCells = [
  ...cages.flatMap(c => c.cells),
  'R1C4', 'R2C4', // no-total cage
  'R6C3', // no-total single-cell cage
];

const whispers = [
  // German Whisper lines (green), cells from the drawn line geometry.
  new Whisper(5, 'R7C1', 'R7C2', 'R7C3'),
  new Whisper(5, 'R2C7', 'R3C7', 'R4C7'),
  new Whisper(5, 'R9C8', 'R9C9'),
];
const whisperCells = whispers.flatMap(w => w.cells);

const renbans = [
  // Renban lines (purple), cells from the drawn line geometry.
  new Renban('R8C1', 'R9C1', 'R9C2'),
  new Renban('R2C6', 'R3C6'),
  new Renban('R5C7', 'R6C7', 'R6C8'),
];
const renbanCells = renbans.flatMap(r => r.cells);

// Parity lines have no dedicated ISS class; alternating odd/even along a
// path is a pairwise relation between consecutive cells, so each line is one
// Pair over its ordered cells.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const parityLines = [
  ['R8C4', 'R8C3', 'R9C4'],
  ['R3C9', 'R4C9', 'R4C8'],
  ['R3C1', 'R4C1', 'R5C1'],
];
const parities = parityLines.map(
  cells => new Pair(parityKey, 'Parity', ...cells));
const parityCells = parityLines.flat();

const dots = [
  // Kropki black dots (1:2 ratio), cells from the drawn edge marks.
  new BlackDot('R1C5', 'R1C6'),
  new BlackDot('R4C4', 'R4C5'),
  new BlackDot('R5C5', 'R6C5'),
];
const dotCells = dots.flatMap(d => d.cells);

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
  ...renbans,
  ...parities,
  ...dots,
  // Constraint Regions: one all-different set per rule type, over every
  // cell that belongs to that type (across all of its lines/cages/dots).
  new AllDifferent(...cageCells),
  new AllDifferent(...whisperCells),
  new AllDifferent(...renbanCells),
  new AllDifferent(...parityCells),
  new AllDifferent(...dotCells),
];
