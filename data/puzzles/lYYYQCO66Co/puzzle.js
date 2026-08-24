// Title: Roses
// Author: PulverizingPancake
// Video: https://www.youtube.com/watch?v=lYYYQCO66Co
// Source: https://app.crackingthecryptic.com/sudoku/947h9hGH7M

// Normal sudoku rules apply. Cages sum to the small clue in their top-left
// corner and forbid repeats within the cage. Digits along an arrow sum to
// the digit in that arrow's circle (bulb). Clues outside the grid give the
// sum of the digits along the diagonal they point into; digits may repeat
// on that diagonal unless another rule forbids it (Little Killer
// semantics) -- no other rule here restricts these particular diagonals.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages: cell lists and totals from the drawn `cages` array.
  new Cage(15, 'R1C2', 'R1C3', 'R2C2', 'R3C2', 'R2C1'),
  new Cage(27, 'R1C4', 'R2C3', 'R2C4', 'R3C4', 'R2C5'),
  new Cage(6, 'R3C5', 'R4C5'),
  new Cage(9, 'R4C4', 'R5C4', 'R5C3'),
  new Cage(27, 'R3C1', 'R4C1', 'R4C2', 'R4C3', 'R5C2'),
  new Cage(24, 'R6C6', 'R6C7', 'R6C8', 'R6C9'),
  new Cage(18, 'R7C6', 'R8C6', 'R9C6', 'R9C7'),
  new Cage(15, 'R7C7', 'R8C7', 'R7C8'),
  new Cage(23, 'R7C9', 'R8C9', 'R9C9', 'R9C8'),

  // Arrows: circle (bulb) cell first, then the arm cells it sums.
  new Arrow('R5C5', 'R5C6', 'R5C7'),
  new Arrow('R2C9', 'R3C8', 'R2C8', 'R1C8'),
  new Arrow('R9C2', 'R8C3', 'R8C2', 'R8C1'),

  // Outside diagonal-sum clues. Each ray starts at the drawn arrow's on-grid
  // cell and travels in the drawn direction to the far edge. LittleKiller
  // allows repeats along the diagonal, which is exactly what the rules
  // state for these clues.
  LittleKiller.fromCells(13, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(29, graph.ray('R1C5', 1, -1), geometry),
  LittleKiller.fromCells(35, graph.ray('R1C6', 1, -1), geometry),
];
