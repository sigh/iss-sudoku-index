// Title: Oscilloscope
// Author: FinnishGuy
// Video: https://www.youtube.com/watch?v=wSN-nyRO1Uk
// Source: https://app.crackingthecryptic.com/sudoku/P4FrjqFPRh

// Normal sudoku rules apply (standard 3x3 boxes). Digits may not repeat
// along the blue diagonal. Grey lines are palindromes. The arrow's arm
// sums to its circle. The grey-square cell holds an even digit. Outside
// diagonal clues sum the indicated diagonal, repeats allowed there (LittleKiller
// adds no local distinctness beyond row/column). The red line is an
// oscillator: consecutive digits alternate high (>5) and low (<5); 5 fits
// neither category, so it cannot appear on the line -- encoded below as a
// per-cell candidate restriction plus a pairwise differ-in-category rule
// along the path.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Red oscillator line, 16 cells, transcribed from the drawn zig-zag path.
const oscillatorLine = [
  'R2C1', 'R1C2', 'R2C3', 'R3C2', 'R4C3', 'R3C4', 'R4C5', 'R5C4',
  'R6C5', 'R5C6', 'R6C7', 'R7C6', 'R8C7', 'R7C8', 'R8C9', 'R9C8',
];

// High/low differ between consecutive cells; 5 is excluded per-cell below,
// so this predicate only needs to separate the >5 and <5 groups.
const altHighLowKey = Pair.fnToKey((a, b) => (a > 5) !== (b > 5), 9);

// Grey palindrome lines, transcribed from the two drawn straight segments
// (intermediate cell centres interpolated along each segment).
const palindromeA = ['R2C5', 'R3C6', 'R4C7', 'R5C8'];
const palindromeB = ['R5C2', 'R6C3', 'R7C4', 'R8C5'];

return [
  new Shape('9x9'),
  new Diagonal(1), // blue diagonal R9C1..R1C9 ('/'), no repeats
  ...oscillatorLine.map(cell => new Given(cell, 1, 2, 3, 4, 6, 7, 8, 9)),
  new Pair(altHighLowKey, 'oscillator alternates high/low', ...oscillatorLine),
  new Palindrome(...palindromeA),
  new Palindrome(...palindromeB),
  new Arrow('R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Given('R8C8', 2, 4, 6, 8),
  // Outside diagonal sums; each ray runs from the edge cell nearest its
  // clue to the opposite edge, direction taken from the drawn arrow.
  LittleKiller.fromCells(25, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(9, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R9C7', -1, 1), geometry),
];
