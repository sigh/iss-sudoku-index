// Title: Sun Chariot
// Author: Miky
// Video: https://www.youtube.com/watch?v=lgFzP5oPr6c
// Source: https://app.crackingthecryptic.com/sudoku/t9qDfPMm2p
//
// Normal sudoku rules apply (standard rows/columns/3x3 boxes, from the
// puzzle's own `regions`). Cells a knight's move apart cannot repeat
// (AntiKnight). Arrows: digits along an arrow sum to the digit in its
// circle bulb, repeats allowed along the arm. A killer cage sums to its
// printed total with no repeated digit. Black dots mark a 1:2 ratio between
// the two adjacent cells; "not all possible black dots are given" is a
// scope note (this is not a StrictKropki ruleset -- undotted adjacent pairs
// carry no constraint). The two outside clues give the sum of the cells
// along the indicated diagonal, repeats allowed.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Three arrow bulbs (drawn as the three white circles at R5C4, R6C4,
  // R6C8) with seven arms total; R6C4 carries five separate arrows.
  new Arrow('R5C4', 'R4C3'),
  new Arrow('R6C4', 'R5C3'),
  new Arrow('R6C4', 'R6C3', 'R6C2', 'R6C1'),
  new Arrow('R6C4', 'R7C4', 'R8C4', 'R9C4'),
  new Arrow('R6C4', 'R7C5'),
  new Arrow('R6C4', 'R5C5', 'R4C5', 'R5C6'),
  new Arrow('R6C8', 'R7C9'),

  // Killer cage, total 45 (printed in the cage's top-left corner).
  new Cage(45,
    'R2C5', 'R2C6', 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R4C8', 'R5C7', 'R5C8'),

  // Black dots (1:2 ratio), drawn edges only.
  new BlackDot('R1C5', 'R1C6'),
  new BlackDot('R1C7', 'R2C7'),
  new BlackDot('R4C9', 'R5C9'),
  new BlackDot('R7C7', 'R7C8'),
  new BlackDot('R7C7', 'R8C7'),

  // Outside diagonal sum clues. Each ray direction is taken from the
  // arrow's own drawn off-grid waypoint (down-left from R1C6, down-right
  // from R5C1), which resolves the otherwise-ambiguous which-diagonal
  // reading for a badge placed between two candidate lanes.
  LittleKiller.fromCells(32, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(23, graph.ray('R5C1', 1, 1), geometry),
];
