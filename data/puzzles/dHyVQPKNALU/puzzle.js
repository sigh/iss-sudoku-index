// Title: Palindromaze
// Author: FinnishGuy
// Video: https://www.youtube.com/watch?v=dHyVQPKNALU
// Source: https://app.crackingthecryptic.com/sudoku/DnhfRLQ8FF

// Normal sudoku rules, standard 3x3 boxes. Three grey lines are independent
// palindromes. A "31" outside clue with a down-right arrow marks the
// diagonal R6C1-R7C2-R8C3-R9C4 (LittleKiller; digits may repeat there,
// as the rules note, since the diagonal is not itself an all-different
// group). White dots are consecutive-digit pairs, black dots are 1:2 ratio
// pairs; "not all possible dots are given" so unmarked adjacent pairs carry
// no restriction (no strict/negative dot class needed). Grey circles mark
// odd-digit cells (candidate restriction, not a dedicated Odd class).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Killer cages, top-left cell's total (source: drawn cage boxes).
  new Cage(10, 'R5C2', 'R5C3'),
  new Cage(10, 'R5C8', 'R5C9'),
  new Cage(14, 'R8C8', 'R9C8'),

  // Grey palindrome lines (source: drawn line paths, order preserved).
  new Palindrome(
    'R8C1', 'R9C2', 'R8C3', 'R9C4', 'R8C5', 'R9C6', 'R8C7', 'R9C8', 'R8C9',
    'R7C8', 'R6C9', 'R5C8', 'R4C9', 'R3C8', 'R2C7', 'R1C6', 'R2C5', 'R1C4',
    'R2C3', 'R1C2', 'R2C1', 'R3C2', 'R4C1', 'R5C2', 'R6C3', 'R7C4'),
  new Palindrome('R6C5', 'R7C6'),
  new Palindrome(
    'R6C7', 'R5C6', 'R4C7', 'R3C6', 'R4C5', 'R3C4', 'R4C3', 'R5C4'),

  // Outside diagonal sum: "31" badge + down-right arrow at R6C1;
  // ray matches ISS's own canonical diagonal start for that edge cell.
  LittleKiller.fromCells(31, graph.ray('R6C1', 1, 1), geometry),

  // Black dot: 1:2 ratio (drawn with a black fill).
  new BlackDot('R6C9', 'R7C9'),

  // White dots: consecutive (drawn with a white fill).
  new WhiteDot('R7C5', 'R7C6'),
  new WhiteDot('R7C3', 'R7C4'),
  new WhiteDot('R6C4', 'R6C5'),
  new WhiteDot('R5C5', 'R5C6'),
  new WhiteDot('R3C4', 'R4C4'),
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R2C6', 'R2C7'),
  new WhiteDot('R4C8', 'R5C8'),
  new WhiteDot('R5C7', 'R6C7'),

  // Grey-circle odd digits (drawn underlay circles).
  new Given('R1C8', 1, 3, 5, 7, 9),
  new Given('R2C9', 1, 3, 5, 7, 9),
];
