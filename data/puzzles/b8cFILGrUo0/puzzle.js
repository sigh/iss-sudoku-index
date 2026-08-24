// Title: Archer's Prison
// Author: Wesley Murphy; Nityant Agarwal
// Video: https://www.youtube.com/watch?v=b8cFILGrUo0
// Source: https://app.crackingthecryptic.com/sudoku/F8Mgm93btR
//
// Normal sudoku rules apply. Cages: digits sum to the small clue in the
// cage's top-left corner and cannot repeat within the cage (Cage). Arrows:
// digits along the path sum to the digit in the circle, repeats allowed
// along the path (Arrow) -- the rules text's "digits can repeat along
// arrows" is the plain Arrow semantics, so no extra all-different is added
// over the path cells beyond ordinary row/column/box sudoku.

const shape = new Shape('9x9');

// Cages: [sum, ...cells], each row transcribed from the drawn cages
// (top-left small clue is the cage sum).
const cageSpecs = [
  [15, 'R1C1', 'R1C2', 'R1C3'],
  [18, 'R4C2', 'R4C1', 'R5C1'],
  [8, 'R8C1', 'R8C2', 'R9C2'],
  [23, 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4'],
  [19, 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7'],
  [17, 'R1C5', 'R1C6', 'R2C6'],
  [19, 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9'],
];
const cages = cageSpecs.map(([sum, ...cells]) => new Cage(sum, ...cells));

// Arrows: bulb cell first, then the path cells, transcribed from the drawn
// arrow polylines (traced through the cells each line crosses).
const arrowSpecs = [
  ['R3C3', 'R4C3', 'R5C3', 'R5C4', 'R5C5'],
  ['R6C9', 'R5C9', 'R4C9'],
  ['R6C5', 'R7C5', 'R8C5', 'R8C6', 'R8C7'],
  ['R6C3', 'R7C4'],
];
const arrows = arrowSpecs.map(cells => new Arrow(...cells));

return [
  shape,
  ...cages,
  ...arrows,
];
