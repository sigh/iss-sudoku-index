// Title: Knight Fever
// Author: apiyo
// Video: https://www.youtube.com/watch?v=XMl4mMVqm0g
// Source: https://app.crackingthecryptic.com/sudoku/Dqjhn2j4mP
//
// Normal sudoku rules (default row/column/box all-different, standard 3x3
// boxes). Anti-knight: no two cells a knight's move apart repeat a digit.
// Arrow: digits on the arm sum to the digit in the circled cell. Thermo:
// digits strictly increase from the bulb. Two outside-grid clues each give
// the sum of a short diagonal ray of cells entering the grid at the stated
// cell and direction.
//
// The puzzle draws one thermometer that forks into two arms from a single
// shared bulb (R3C3); each arm is its own Thermo starting at that bulb,
// which enforces "increasing from R3C3" independently along both arms --
// exactly the drawn fork. Two cells (R6C4, R3C6) are simultaneously a
// thermometer's bulb/tip and an arrow's circle -- the video's "hidden
// thermometer" -- both roles are encoded as their own constraints on that
// shared cell.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  new AntiKnight(),

  // Thermometers (grey lines, bulb = grey circle underlay).
  new Thermo('R3C3', 'R2C4', 'R1C5'),
  new Thermo('R3C3', 'R4C2', 'R5C1'),
  new Thermo('R6C4', 'R6C3', 'R6C2', 'R6C1'),
  new Thermo('R7C4', 'R8C4'),
  new Thermo('R9C4', 'R9C3'),
  new Thermo('R1C6', 'R2C6', 'R3C6'),

  // Arrows (magenta lines, circle = purple-bordered underlay). Arrow takes
  // the circled cell first, then the arm cells.
  new Arrow('R3C6', 'R2C7', 'R3C8'),
  new Arrow('R3C6', 'R4C5', 'R5C5'),
  new Arrow('R6C4', 'R5C4', 'R4C4'),
  new Arrow('R7C9', 'R7C8', 'R8C7'),

  // Outside diagonal-sum clues. Each ray is only 2 cells long because it
  // enters the grid one cell from a corner and immediately exits again.
  LittleKiller.fromCells(6, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(14, graph.ray('R8C9', 1, -1), geometry),
];
