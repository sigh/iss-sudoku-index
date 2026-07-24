// Title: Unique Under the Fog 3.0
// Author: Visumation
// Video: https://www.youtube.com/watch?v=TrTzKkT330E
// Source: https://sudokupad.app/44t9pol5x3

// Standard 9x9 sudoku, no givens. Rules encoded:
//   - German Whisper (GW) lines: adjacent digits differ by at least 5.
//   - Modular (MO) lines: every run of 3 sequential cells has one digit from
//     each of {1,4,7}/{2,5,8}/{3,6,9}.
//   - Dutch Whisper (DW) lines: adjacent digits differ by at least 4.
//   - Parity (P) lines: adjacent digits alternate odd/even.
//   - Cages: distinct digits, summing to the printed total when given; a
//     real cage may lack a total, and one is a single cell (no local rule,
//     but its cell still joins the type union below).
//   - Black dots: the two digits are in a 1:2 ratio.
//   - Grey squares: an even digit. Grey circle: an odd digit.
// The title rule: beyond each instance's own rule, a digit may occur at most
// once among all cells belonging to clues of one lettered type anywhere in
// the puzzle -- one extra AllDifferent over each type's full cell union.
// The single-cell grey-circle type needs no extra constraint.
//
// The fog/reveal mechanic is solving UI only, not a final-grid rule; not
// encoded.
//
// A stray "RB" text label sits at R1C6 with no drawn line, cage, dot, or
// shaded cell attached, and no rules-text clue type matches those letters.
// Treated as leftover setter scaffolding, not a clue.

const germanWhispers = [
  ['R2C4', 'R2C5', 'R2C6'],
  ['R4C8', 'R5C8', 'R6C8'],
];
const modulars = [
  ['R6C1', 'R6C2', 'R7C2'],
  ['R1C9', 'R2C9', 'R3C9'],
];
const dutchWhispers = [
  ['R2C7', 'R2C8', 'R3C8'],
  ['R2C2', 'R3C2'],
];
const parities = [
  ['R4C5', 'R5C5', 'R6C5'],
  ['R7C3', 'R8C2', 'R8C3'],
  ['R9C7', 'R9C8', 'R9C9'],
];

// [cells, total] pairs; total is undefined for a real no-total cage.
const cages = [
  [['R7C1', 'R7C2'], 5],
  [['R1C3', 'R2C3', 'R3C3'], 21],
  [['R7C7', 'R7C8', 'R7C9'], undefined],
  [['R1C4'], undefined],
];

const blackDots = [
  ['R3C4', 'R4C4'],
  ['R6C4', 'R7C4'],
  ['R5C6', 'R5C7'],
];

const greySquares = ['R5C2', 'R2C5', 'R5C8', 'R8C5'];
const greyCircle = 'R1C9';

// The P-line rule as a pairwise predicate: adjacent digits differ in parity.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

const cageCells = cages.flatMap(([cells]) => cells);

return [
  new Shape('9x9'),

  ...germanWhispers.map(cells => new Whisper(5, ...cells)),
  new AllDifferent(...germanWhispers.flat()),

  ...modulars.map(cells => new Modular(3, ...cells)),
  new AllDifferent(...modulars.flat()),

  ...dutchWhispers.map(cells => new Whisper(4, ...cells)),
  new AllDifferent(...dutchWhispers.flat()),

  ...parities.map(cells => new Pair(parityKey, 'Parity', ...cells)),
  new AllDifferent(...parities.flat()),

  ...cages.map(([cells, total]) =>
    total === undefined
      ? (cells.length > 1 ? new AllDifferent(...cells) : '')
      : new Cage(total, ...cells)),
  new AllDifferent(...cageCells),

  ...blackDots.map(cells => new BlackDot(...cells)),
  new AllDifferent(...blackDots.flat()),

  ...greySquares.map(cell => new Given(cell, 2, 4, 6, 8)),
  new AllDifferent(...greySquares),

  new Given(greyCircle, 1, 3, 5, 7, 9),
];
