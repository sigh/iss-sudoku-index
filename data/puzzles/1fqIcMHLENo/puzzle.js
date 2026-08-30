// Title: Can You Place One Digit In This Puzzle?
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=1fqIcMHLENo
// Source: https://cracking-the-cryptic.web.app/sudoku/pGd4fnH6hR

// Rules encoded:
//  - Normal sudoku: 1-9 once per row, column and 3x3 box. The drawn regions
//    are the nine ordinary boxes, so the default 9x9 Shape covers this.
//  - Killer cages: digits inside a cage do not repeat, and where a total is
//    printed the cage's digits sum to it.
//  - Four cages are drawn with no printed total (all-different only) and are
//    shaded grey; a printed outside clue reads "Sum Of Grey cages = 93" --
//    the digits across all four grey cages together sum to 93.
// The source publishes no rules text; the above is read entirely from the
// drawn cage geometry, the standard killer-cage convention, and the printed
// "Sum Of Grey cages = 93" clue text.
//
// Omitted: two deepskyblue lines are drawn corner-to-corner across both main
// diagonals (R1C1-R9C9 and R1C9-R9C1). No bulb, label or legend anywhere in
// the payload states what they mean, so no rule is encoded for them.

// Cages with a printed total, from the board (total, then cells).
const totalledCages = [
  [20, 'R1C1', 'R1C2', 'R2C1'],
  [21, 'R1C8', 'R1C9', 'R2C9'],
  [21, 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C2'],
  [20, 'R3C3', 'R3C4', 'R3C5', 'R3C6'],
  [23, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  [12, 'R4C7', 'R4C8'],
  [12, 'R6C2', 'R6C3'],
  [18, 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  [19, 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
  [19, 'R8C9', 'R9C8', 'R9C9'],
  [17, 'R8C1', 'R9C1', 'R9C2'],
];

// The four grey, no-total cages -- exact cell-for-cell match with the
// payload's grey (#cfcfcf) underlays.
const greyCages = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...totalledCages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...greyCages.map((cells) => new AllDifferent(...cells)),
  new Sum(93, ...greyCages.flat()),
];
