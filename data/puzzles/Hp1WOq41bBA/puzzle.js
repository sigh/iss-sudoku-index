// Title: Haspiainen
// Author: Spef
// Video: https://www.youtube.com/watch?v=Hp1WOq41bBA
// Source: https://app.crackingthecryptic.com/sudoku/3BN3RjTLTM

// Normal sudoku rules apply, plus:
// - Anti-king: cells a chess king's move apart must not contain the same digit.
// - Arrow: digits along an arrow sum to the digit in its attached circle. Each
//   circle sits on the arrow's own bulb cell (no printed clue digit), so the
//   bulb cell's grid value is the sum.
// - Quadruple: digits marked in a circle must appear in one of the four cells
//   surrounding the circle.
// - Marked diagonal: digits on the diagonal must not repeat.

// Arrow paths, bulb cell first then arm cells in path order; transcribed from
// the drawn arrow waypoints (bulb overlay circle followed by the line's kinks).
const arrows = [
  ['R3C6', 'R2C7', 'R2C8', 'R2C9'],
  ['R4C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R6C6', 'R7C5', 'R8C5', 'R9C5'],
  ['R6C1', 'R7C2', 'R8C2', 'R9C2'],
  ['R8C9', 'R8C8', 'R9C8'],
];

// The quad clue is drawn as two adjacent split circles ("2 4" and "5 6") over
// the same R3C3/R3C4/R4C3/R4C4 intersection; together they list all four
// required digits for the one clue.
const quadCell = 'R3C3';
const quadValues = [2, 4, 5, 6];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...arrows.map(cells => new Arrow(...cells)),
  new Quad(quadCell, ...quadValues),
  // Drawn diagonal runs R1C9-R9C1, the positive-slope (bottom-left to
  // top-right) diagonal, direction 1.
  new Diagonal(1),
];
