// Title: Anti-Knight Thermo Little Killer
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=1eTBW4FZ3Lo
// Source: https://app.crackingthecryptic.com/sudoku/Nh8QfBh3hp

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Cells a knight's move apart
// cannot repeat a digit. The two outside diagonal clues give the sum of
// digits along the indicated diagonal, repeats allowed (LittleKiller).
// Digits strictly increase along each thermometer from the bulb end.

const geometry = cellGeometry(9);

// Two little-killer diagonal sums. Arrow direction and paired overlay total
// transcribed from the drawn off-grid arrows (down-right into the grid from
// R1C2 and from R3C1); LittleKiller.fromCells derives the canonical corner
// and walks the diagonal from the explicit cell list.
const littleKillers = [
  [16, ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9']],
  [14, ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

// Four thermometers, bulb first. Transcribed from the drawn grey lines,
// bulb ends confirmed by the grey circle underlays.
const thermos = [
  ['R6C9', 'R6C8', 'R5C7'],
  ['R5C9', 'R4C8'],
  ['R4C7', 'R3C6', 'R3C5'],
  ['R4C3', 'R5C4', 'R6C5'],
].map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...littleKillers,
  ...thermos,
];
