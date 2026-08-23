// Title: Synergy
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=COeTbR5vul4
// Source: https://app.crackingthecryptic.com/sudoku/jq7Mq6qFTN

// Normal sudoku rules apply (standard box regions, implicit row/column/box
// all-different). In cages, digits sum to the small top-left clue and cannot
// repeat within the cage. Each main diagonal cannot contain a repeated
// digit. Cells separated by a white dot hold consecutive digits; not all
// possible white dots are given, so unmarked adjacent pairs are not
// constrained (no exhaustiveness clause to encode).

// Cages, transcribed from the source's drawn cage data.
const cages = [
  new Cage(26, 'R2C4', 'R2C5', 'R2C6', 'R3C4'),
  new Cage(27, 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7'),
  new Cage(20, 'R4C8', 'R5C8', 'R6C7', 'R6C8'),
  new Cage(9, 'R7C6', 'R8C6'),
  new Cage(20, 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5'),
  new Cage(7, 'R4C2', 'R4C3'),
  new Cage(8, 'R5C2', 'R6C2'),
  new Cage(7, 'R8C4', 'R8C5'),
];

// Two drawn diagonals, each a plain non-repeat diagonal. direction=-1 is
// top-left/bottom-right ('\'), direction=1 is top-right/bottom-left ('/').
// A third drawn entry shares the colour but has no coordinates and renders
// nothing -- not a drawn clue, omitted.
const diagonals = [
  new Diagonal(-1),
  new Diagonal(1),
];

// White (consecutive) dots, transcribed from the source's drawn overlay
// data -- every entry is an edge-centred, white-filled, black-bordered
// rounded mark.
const whiteDots = [
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R1C1', 'R2C1'),
  new WhiteDot('R2C1', 'R3C1'),
  new WhiteDot('R7C1', 'R8C1'),
  new WhiteDot('R8C1', 'R9C1'),
  new WhiteDot('R9C1', 'R9C2'),
  new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R9C7', 'R9C8'),
  new WhiteDot('R9C8', 'R9C9'),
  new WhiteDot('R8C9', 'R9C9'),
  new WhiteDot('R7C9', 'R8C9'),
  new WhiteDot('R1C9', 'R2C9'),
  new WhiteDot('R2C9', 'R3C9'),
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R1C7', 'R1C8'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...diagonals,
  ...whiteDots,
];
