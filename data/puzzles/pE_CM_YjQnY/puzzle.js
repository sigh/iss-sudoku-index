// Title: Palindrome Portals
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=pE_CM_YjQnY
// Source: https://app.crackingthecryptic.com/sudoku/dTB2tNjbn2
//
// Normal sudoku rules apply (standard 9x9 rows/cols/boxes; regions in the
// payload are the standard 3x3 boxes). No given digits.
// Diagonal outside clues give the sum of digits along the diagonal, digits
// may repeat -> LittleKiller (its DESCRIPTION already states "values may
// repeat", so no extra all-different is added for these cells).
// Grey lines are palindromes -> Palindrome.
// "No two cells in the same position of their box may contain the same
// digit" is the standard disjoint-groups rule -> DisjointSets.
// A 7th lines-payload entry has no waypoints/coordinates and renders
// nothing (styling only); it is not a drawn clue and is omitted.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Diagonal sum clues: start cell and direction transcribed from the drawn
// off-grid arrows, each paired with its nearest sum badge; graph.ray()
// walks each diagonal to the grid edge.
const littleKillers = [
  LittleKiller.fromCells(20, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(26, graph.ray('R6C1', -1, 1), geometry),
  LittleKiller.fromCells(50, graph.ray('R9C1', -1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(19, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(33, graph.ray('R9C8', -1, -1), geometry),
  LittleKiller.fromCells(33, graph.ray('R9C9', -1, -1), geometry),
  LittleKiller.fromCells(44, graph.ray('R8C9', -1, -1), geometry),
];

// Palindrome lines: cells transcribed from the drawn grey lines.
const palindromes = [
  new Palindrome('R1C6', 'R2C7', 'R2C8'),
  new Palindrome('R3C4', 'R4C5', 'R4C6'),
  new Palindrome('R6C4', 'R7C5', 'R7C6'),
  new Palindrome('R6C7', 'R7C8', 'R7C9'),
  new Palindrome('R6C1', 'R7C2', 'R7C3'),
  new Palindrome('R8C2', 'R9C3', 'R9C4'),
];

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...littleKillers,
  ...palindromes,
];
