// Title: Musically Keen
// Author: The Pi Guy
// Video: https://www.youtube.com/watch?v=BfsapIsZX4o
// Source: https://sudokupad.app/jcj5nibbdm

// Fog of war (fog reveal is a UI-only mechanic; every cell is still a normal
// playable digit and is not encoded here).

// Cages (dotted outline, total to be deduced, equal across all three cages):
// R4C4-R4C5; R7C9-R8C9-R9C9; R3C9-R4C9-R5C9-R6C9.
const cages = [
  ['R4C4', 'R4C5'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9'],
];

// Thermometers (bulb first, strictly increasing to the tip).
const thermos = [
  ['R9C5', 'R8C5'],
  ['R7C5', 'R6C5', 'R6C6'],
  ['R1C2', 'R1C3'],
  ['R1C9', 'R2C9'],
];

// Renban lines (purple, hollow): consecutive set, no repeats, any order.
const renbans = [
  ['R8C8', 'R9C8', 'R9C7'],
  ['R3C8', 'R4C8'],
  ['R5C3', 'R6C3'],
  ['R7C2', 'R8C2'],
];

// Nabner lines (yellow, normal): no two digits on the same line are
// consecutive, considering every pair on the line (not just adjacent cells).
const nabners = [
  ['R3C5', 'R3C6'],
  ['R7C3', 'R8C3'],
  ['R7C1', 'R8C1'],
  ['R4C6', 'R4C7', 'R3C7'],
];

// Dutch whisper lines (orange, dashed): adjacent cells on the line differ by
// at least 4.
const dutchWhispers = [
  ['R7C8', 'R7C7', 'R8C7'],
  ['R3C4', 'R3C3', 'R4C3'],
  ['R9C1', 'R9C2', 'R9C3'],
];

const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

return [
  new Shape('9x9'),

  // Cages: equal (unknown) total across all three cages. Every cage's cells
  // already fall within a single row or column, so cage-internal
  // distinctness is already forced by standard Sudoku rules.
  new EqualSum(...cages),

  ...thermos.map(cells => new Thermo(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  ...nabners.map((cells, i) => new PairX(nabnerKey, `Nabner ${i + 1}`, ...cells)),
  ...dutchWhispers.map(cells => new Whisper(4, ...cells)),

  // No repeats on a constraint: taken together, all clues of the same
  // constraint type cover 9 cells and must contain each digit 1-9 exactly
  // once (equivalent to all-different over that combined cell set, since it
  // is exactly 9 cells).
  new AllDifferent(...cages.flat()),
  new AllDifferent(...thermos.flat()),
  new AllDifferent(...renbans.flat()),
  new AllDifferent(...nabners.flat()),
  new AllDifferent(...dutchWhispers.flat()),
];
