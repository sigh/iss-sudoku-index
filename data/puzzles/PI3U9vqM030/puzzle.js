// Title: Yo Banana Boy!
// Author: Danny Mecler
// Video: https://www.youtube.com/watch?v=PI3U9vqM030
// Source: https://app.crackingthecryptic.com/sudoku/dmQ8MHm29g

// Rules: Normal Sudoku rules apply. Both main diagonals contain 1-9 once.
// The killer cage shows its sum (cells R9C1-R9C3, all in row 9, so the row's
// own all-different already forbids repeats there; the cage's residual
// content is the sum). A clue outside the grid shows the sum of the
// indicated diagonal ray, on which digits may repeat (Little Killer).
// Every grey line is a palindrome consisting of only 2 digits, i.e. reading
// ABABA (5-cell lines) or ABBA (4-cell lines) -- the two example patterns the
// rules text names. Palindrome(...) gives the mirror symmetry; that alone
// would also allow e.g. ABCBA (3 digits) or ABBBA (2 digits, not alternating),
// so two residual constraints per line pin the "only 2 digits, alternating"
// reading exactly: the outer pair and the centre cell (odd lines only) are
// tied equal via SameValues, and the outer pair is forced unequal to its
// neighbour via Whisper(1) (|a-b|>=1 for integers is exactly a!=b).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Palindrome line cell lists, transcribed from the six drawn grey strokes.
const palindromeLines = [
  ['R2C5', 'R2C6', 'R3C7', 'R3C8', 'R4C8'],
  ['R2C2', 'R3C3', 'R3C4', 'R4C5', 'R4C6'],
  ['R3C1', 'R4C1', 'R3C2', 'R4C3'],
  ['R5C2', 'R6C2', 'R7C3', 'R7C4', 'R6C5'],
  ['R5C6', 'R6C7', 'R7C7', 'R7C8', 'R6C8'],
  ['R8C2', 'R9C3', 'R8C4', 'R9C5'],
];

const palindromes = palindromeLines.map(cells => new Palindrome(...cells));

const twoDigitTies = palindromeLines.flatMap(cells => {
  const mid = (cells.length - 1) / 2;
  return [
    new Whisper(1, cells[0], cells[1]),
    ...(cells.length % 2 === 1 ? [new SameValues(2, cells[0], cells[mid])] : []),
  ];
});

// Little Killer diagonal-sum clues: each off-grid arrow points diagonally
// into the grid from its anchor cell, paired with the nearest outside sum
// label (the label may render a row/column off from its true lane):
//   top C4/C5 boundary, down-right -> R1C5, sum 26
//   top C7/C8 boundary, down-right -> R1C8, sum 15
//   left R4/R5 boundary, down-right -> R5C1, sum 19
//   left R6/R7 boundary, down-right -> R7C1, sum 20
//   right R4/R5 boundary, down-left -> R5C9, sum 31
const littleKillers = [
  LittleKiller.fromCells(26, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(19, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(31, graph.ray('R5C9', 1, -1), geometry),
];

return [
  new Shape('9x9'),

  new Given('R1C5', 9),
  new Given('R4C5', 3),
  new Given('R5C5', 5),
  new Given('R6C5', 1),

  // Diagonal(-1) = main '\' diagonal R1C1..R9C9; Diagonal(1) = anti '/'
  // diagonal R1C9..R9C1 -- both drawn as one connected blue stroke through
  // the shared centre cell R5C5.
  new Diagonal(-1),
  new Diagonal(1),

  new Cage(9, 'R9C1', 'R9C2', 'R9C3'), // drawn killer cage across row 9

  ...littleKillers,
  ...palindromes,
  ...twoDigitTies,
];
