// Title: 400k milestone medley
// Author: olima
// Video: https://www.youtube.com/watch?v=6dVKx7QcRz0
// Source: https://tinyurl.com/wnkh6k
//
// Normal Sudoku rules apply (default row/col/box). No given digits.
// Outside numbers are the sandwich sum (digits strictly between the 1 and
// the 9) for that row/column: Sandwich. Outside arrows are the little-killer
// diagonal sum: LittleKiller. Grey circles are odd digits, encoded as
// candidate restrictions since there is no Odd class. White dots are
// Kropki-consecutive pairs: WhiteDot. Thermometer digits increase from the
// bulb: Thermo. Arrow digits sum to the circled (bulb) cell: Arrow, bulb
// first. The cage sums to its total with distinct digits: Cage. The green
// line's adjacent digits differ by at least 5: Whisper. The purple line
// holds a consecutive, any-order digit set: Renban.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Grey circles: odd digits.
  new Given('R9C2', 1, 3, 5, 7, 9),
  new Given('R9C3', 1, 3, 5, 7, 9),
  new Given('R9C4', 1, 3, 5, 7, 9),
  new Given('R9C5', 1, 3, 5, 7, 9),
  new Given('R8C1', 1, 3, 5, 7, 9),

  // Thermometers, increasing from the bulb. Both share bulb R2C4.
  new Thermo('R2C4', 'R3C4'),
  new Thermo('R2C4', 'R2C3', 'R2C2', 'R1C3'),

  // Killer cage.
  new Cage(4, 'R6C2', 'R6C3'),

  // Outside diagonal arrow: sum along the diagonal entering at R8C1 running
  // down-right.
  LittleKiller.fromCells(4, graph.ray('R8C1', 1, 1), geometry),

  // Outside sandwich sums. Sandwich only takes top/left clues, but the sum
  // between 1 and 9 in a row/column is the same fact regardless of which
  // margin printed it, so the right/bottom-margin clues below are built
  // from the same full row/column.
  Sandwich.fromCells(4, graph.column(5), geometry),
  Sandwich.fromCells(0, graph.column(6), geometry),
  Sandwich.fromCells(0, graph.column(7), geometry),
  Sandwich.fromCells(0, graph.row(4), geometry),
  Sandwich.fromCells(0, graph.row(5), geometry),
  Sandwich.fromCells(0, graph.row(6), geometry),

  // White dots: consecutive-digit pairs, one per adjacent cell edge
  // (an unlabelled dot, meaning difference of 1 / consecutive).
  new WhiteDot('R6C3', 'R6C4'),
  new WhiteDot('R6C4', 'R6C5'),
  new WhiteDot('R6C5', 'R6C6'),
  new WhiteDot('R6C6', 'R6C7'),
  new WhiteDot('R6C7', 'R6C8'),

  // Arrows: arm digits sum to the bulb (circled) cell.
  new Arrow('R3C5', 'R2C5', 'R1C5'),
  new Arrow('R3C6', 'R2C6', 'R2C7'),
  new Arrow('R3C7', 'R4C6', 'R4C7'),
  new Arrow('R3C8', 'R4C7'),
  new Arrow('R3C9', 'R4C8', 'R5C8'),

  // Green line: adjacent digits differ by at least 5.
  new Whisper(5, 'R7C5', 'R7C4', 'R8C5', 'R8C4'),

  // Purple line: a consecutive digit set in any order.
  new Renban('R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C3'),
];
