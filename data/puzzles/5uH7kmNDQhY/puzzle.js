// Title: Thermo Little Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5uH7kmNDQhY
// Source: https://cracking-the-cryptic.web.app/sudoku/JLTpdmPbLT

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Digits strictly increase along
// each thermometer from the bulb to the far end. Cages and outside diagonals
// show a sum; the rules explicitly allow repeated digits within a cage or
// along a diagonal, so cages are encoded with Sum rather than Cage.

const geometry = cellGeometry(9);

// Four 2x2 cages, transcribed from the payload's cages array (cells + value).
// Repeats allowed per the rules text, so Sum (not Cage/AllDifferent) is used.
const cageSums = [
  [15, ['R1C1', 'R1C2', 'R2C1', 'R2C2']],
  [18, ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
  [23, ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
  [25, ['R8C8', 'R8C9', 'R9C8', 'R9C9']],
].map(([total, cells]) => new Sum(total, ...cells));

// Two thermometers (grey lines, bulb = grey circle underlay at the line's
// first waypoint), transcribed from the payload's lines array.
const thermos = [
  ['R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7'],
].map((cells) => new Thermo(...cells));

// Four little-killer diagonal-sum clues. Each outside arrow's drawn heading
// resolved a boundary-tied entry cell; cell lists below walk the diagonal
// from that entry cell. LittleKiller.fromCells derives the canonical corner
// from the explicit cell list, so the walking direction doesn't matter to
// the constraint itself.
const littleKillers = [
  [33, ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1']],
  [41, ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7']],
  [42, ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9']],
  [48, ['R7C9', 'R6C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4', 'R1C3']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...cageSums,
  ...thermos,
  ...littleKillers,
];
