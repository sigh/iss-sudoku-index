// Title: Corinthian Pillar
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=TiV5b-sCQH8
// Source: https://tinyurl.com/ynypzcrs
//
// Normal sudoku rules on a 9x9 grid with default 3x3 boxes, zero givens.
// "Digits in white circles must appear in the four surrounding squares" is
// the payload's `quadruple` clue, encoded with Quad. "Digits along indicated
// diagonals must sum to the given total and may repeat" is the payload's
// `littlekillersum` clue, encoded with LittleKiller. "Digits along lines must
// form palindromes" is encoded with Palindrome.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // Palindrome lines (payload `palindrome`).
  new Palindrome(
    'R5C1', 'R6C1', 'R6C2', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C5', 'R1C4', 'R2C4'),
  new Palindrome(
    'R8C6', 'R9C6', 'R9C5', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C8', 'R4C9', 'R5C9'),

  // Quadruple circles (payload `quadruple`): the listed values must all
  // appear somewhere in the 2x2 block. Quad's first argument is the block's
  // top-left cell.
  new Quad('R1C4', 1, 2, 3),
  new Quad('R3C3', 3, 4, 5),
  new Quad('R8C5', 7, 8, 9),
  new Quad('R6C6', 5, 6, 7),

  // Little-killer diagonal sums (payload `littlekillersum`); repeats allowed.
  // graph.ray(startCell, dRow, dCol) walks from the outside-edge cell the
  // arrow enters at, in the direction the payload's own cell order and
  // "direction" field describe.
  LittleKiller.fromCells(9, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(31, graph.ray('R6C9', 1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R1C9', 1, -1), geometry),
];
