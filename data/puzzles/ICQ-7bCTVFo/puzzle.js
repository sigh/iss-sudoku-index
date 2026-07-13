// Title: EXclusiVe
// Author: NurglesGift
// Video: https://www.youtube.com/watch?v=ICQ-7bCTVFo
// Source: https://sudokupad.app/aixxhbtkvj
//
// Normal sudoku rules apply. Cells a knight's move apart cannot repeat a
// digit. Five clue types operate: X (adjacent sum 10), V (adjacent sum 5),
// cages (sum to the top-left clue), arrows (arm sums to the circle digit),
// and thermometers (strictly increasing from the bulb). "EXclusiVe" gimmick:
// within any single one of those five constraint types, digits may not
// repeat anywhere in the grid, even across separate instances of that type
// (e.g. a digit used in one cage can't appear in any other cage).

// Thermometers: bulb cell first, then the arm in increasing order.
const thermos = [
  ['R5C9', 'R5C8', 'R5C7'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R2C7', 'R1C7', 'R1C8'],
];

// Arrows: circle cell first, then the arm cells that sum to it. The circle
// cell is a normal grid cell holding its own digit and is not part of "the
// digits on the arrow" for the exclusivity rule below.
const arrows = [
  ['R8C3', 'R7C4', 'R6C5'],
  ['R3C1', 'R2C1', 'R2C2'],
];

// Killer-style two-cell cages; clue is the sum printed in the top-left cell.
const CAGE_SUM = 10;
const cages = [
  ['R9C3', 'R9C4'],
  ['R5C4', 'R6C4'],
  ['R8C6', 'R9C6'],
  ['R3C8', 'R3C9'],
];

// Adjacent-pair X (sum 10) and V (sum 5) clues.
const xClues = [
  ['R7C1', 'R8C1'],
  ['R7C4', 'R7C5'],
  ['R1C8', 'R2C8'],
  ['R4C8', 'R4C9'],
];
const vClues = [
  ['R3C4', 'R3C5'],
  ['R8C8', 'R9C8'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...thermos.map(cells => new Thermo(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(cells => new Cage(CAGE_SUM, ...cells)),
  ...xClues.map(cells => new X(...cells)),
  ...vClues.map(cells => new V(...cells)),
  // "EXclusiVe" gimmick: pool every cell that belongs to a given constraint
  // type and forbid repeats across the whole pool (not just within one
  // instance of that type, which Thermo/Arrow/Cage already enforce locally).
  new AllDifferent(...thermos.flat()),
  new AllDifferent(...arrows.map(([, ...arm]) => arm).flat()),
  new AllDifferent(...cages.flat()),
  new AllDifferent(...xClues.flat()),
  new AllDifferent(...vClues.flat()),
];
