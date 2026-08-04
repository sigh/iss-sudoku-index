// Title: The Palindrome Scratchpad
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=lUHliO2M3fI
// Source: https://app.crackingthecryptic.com/sudoku/8rf39jJJbh
//
// Normal sudoku rules apply (default Shape('9x9') rows/cols/boxes; regions are
// the ordinary 9 boxes). A clue outside the grid gives the sum of the diagonal
// it points into (LittleKiller). Digits joined by a white dot are consecutive
// (WhiteDot). Identical digits cannot be a king's move apart (AntiKing, global).
// Grey lines are straight palindromes (Palindrome).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside diagonal-sum clues: each ray starts at the on-grid cell nearest the
// off-grid arrow and runs to the grid edge; LittleKiller.fromCells accepts
// either direction along the diagonal.
const littleKillers = [
  LittleKiller.fromCells(39, graph.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(19, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(31, graph.ray('R9C3', -1, 1), geometry),
];

// White dots (edge overlays, fill/border white-on-black, per rules text).
const whiteDots = [
  ['R3C2', 'R3C3'],
  ['R2C3', 'R3C3'],
  ['R5C5', 'R5C6'],
  ['R8C5', 'R8C6'],
  ['R7C4', 'R8C4'],
  ['R8C2', 'R9C2'],
].map(([a, b]) => new WhiteDot(a, b));

// Palindrome lines (grey, straight, from lines[].wayPoints).
const palindromes = [
  ['R3C6', 'R2C7', 'R1C8'],
  ['R4C7', 'R3C8', 'R2C9'],
  ['R6C7', 'R7C8', 'R8C9'],
  ['R7C6', 'R8C7', 'R9C8'],
  ['R6C3', 'R7C2', 'R8C1'],
  ['R7C4', 'R8C3', 'R9C2'],
  ['R2C1', 'R3C2', 'R4C3'],
  ['R3C4', 'R2C3', 'R1C2'],
  ['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7'],
  ['R9C7', 'R8C6', 'R7C5', 'R6C4', 'R5C3'],
  ['R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2'],
  ['R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4'],
].map(cells => new Palindrome(...cells));

return [
  new Shape('9x9'),
  new AntiKing(),
  ...littleKillers,
  ...whiteDots,
  ...palindromes,
];
