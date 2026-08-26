// Title: May 27, 2022: Tic Tac Toe
// Author: clover!
// Video: https://www.youtube.com/watch?v=gKQTO43SAxY
// Source: https://tinyurl.com/25hmmc98

// Normal sudoku rules (default row/col/box AllDifferent) plus the givens
// below.
//
// "The digits on each gray line have the same parity (either all odd or all
// even). If the digits on a gray line in a region are all odd (or even),
// then the digit in the corresponding cell in the central region is odd (or
// even)." Since the first sentence already forces a line's three cells to a
// single parity, the second sentence's conditional always fires: it adds the
// central cell to that same parity. So each group below (a line's 3 cells
// plus its corresponding central-box cell) must share one parity, encoded as
// one PairX (same-parity relation over every pair in the group) per box. The
// central-box cell for each line is the cell in the central box (R4-6,C4-6)
// holding the box's own position among the 3x3 arrangement of boxes -- the
// mapping the rules' own worked example ("top right box" -> "top right cell
// of the central box") specifies: each outer box's line pairs with the cell
// holding that same relative position (e.g. top-left, middle-right) inside
// the central box.
const samePairty = PairX.fnToKey((a, b) => (a - b) % 2 === 0, 9);

const parityGroups = [
  // Top-left box line -> central top-left cell.
  ['R3C1', 'R2C2', 'R1C3', 'R4C4'],
  // Top-middle box line -> central top-middle cell.
  ['R1C4', 'R2C5', 'R3C6', 'R4C5'],
  // Top-right box line -> central top-right cell.
  ['R3C7', 'R2C8', 'R1C9', 'R4C6'],
  // Middle-left box line -> central middle-left cell.
  ['R6C1', 'R5C2', 'R4C3', 'R5C4'],
  // Middle-right box line -> central middle-right cell.
  ['R6C7', 'R5C8', 'R4C9', 'R5C6'],
  // Bottom-left box line -> central bottom-left cell.
  ['R7C3', 'R8C2', 'R9C1', 'R6C4'],
  // Bottom-middle box line -> central bottom-middle cell.
  ['R7C4', 'R8C5', 'R9C6', 'R6C5'],
  // Bottom-right box line -> central bottom-right cell.
  ['R9C7', 'R8C8', 'R7C9', 'R6C6'],
];

return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's grid values.
  new Given('R1C2', 9),
  new Given('R1C5', 1),
  new Given('R1C8', 6),
  new Given('R2C1', 8),
  new Given('R2C6', 2),
  new Given('R2C9', 5),
  new Given('R3C3', 1),
  new Given('R3C5', 3),
  new Given('R4C2', 3),
  new Given('R4C7', 6),
  new Given('R4C9', 4),
  new Given('R6C1', 2),
  new Given('R6C3', 4),
  new Given('R6C8', 5),
  new Given('R7C5', 5),
  new Given('R7C7', 7),
  new Given('R8C1', 1),
  new Given('R8C4', 6),
  new Given('R8C9', 2),
  new Given('R9C2', 8),
  new Given('R9C5', 7),
  new Given('R9C8', 9),

  ...parityGroups.map(
    (cells, i) => new PairX(samePairty, `Tic-tac-toe parity ${i}`, ...cells)),
];
