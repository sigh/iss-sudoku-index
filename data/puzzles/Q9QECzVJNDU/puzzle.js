// Title: Outside Whisper
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=Q9QECzVJNDU
// Source: https://app.crackingthecryptic.com/sudoku/rL2QBLRhRd

// Normal sudoku rules apply.
//
// Outside clue: a digit shown outside the grid must be placed in one of the
// first three cells of the row or column as seen from that direction. Some
// lanes show two digits concatenated into one two-digit badge (e.g. "46").
// Read as a two-digit sum this would need >= 46 from three distinct 1-9
// digits, whose maximum possible sum is 9+8+7=24 -- unsatisfiable -- so each
// badge is two independent single-digit placement clues, matching the rule's
// singular "a digit". Each is encoded as: that digit must appear somewhere
// among the row/column's first three cells (from the badge's side), via
// ContainAtLeast over exactly those three cells.
//
// Green line: neighbouring digits along it must differ by at least 5
// (Whisper(5)).

const outsideClues = [
  // left, row 1: R1C1,R1C2,R1C3
  ['4_6', 'R1C1', 'R1C2', 'R1C3'],
  // left, row 3: R3C1,R3C2,R3C3
  ['2_5', 'R3C1', 'R3C2', 'R3C3'],
  // left, row 5: R5C1,R5C2,R5C3
  ['1_6', 'R5C1', 'R5C2', 'R5C3'],
  // right, row 5: R5C9,R5C8,R5C7
  ['4_9', 'R5C9', 'R5C8', 'R5C7'],
  // right, row 7: R7C9,R7C8,R7C7
  ['2_7', 'R7C9', 'R7C8', 'R7C7'],
  // right, row 9: R9C9,R9C8,R9C7
  ['4_6', 'R9C9', 'R9C8', 'R9C7'],
  // top, column 1: R1C1,R2C1,R3C1
  ['3_5', 'R1C1', 'R2C1', 'R3C1'],
  // top, column 4: R1C4,R2C4,R3C4
  ['1', 'R1C4', 'R2C4', 'R3C4'],
  // top, column 9: R1C9,R2C9,R3C9
  ['4_6', 'R1C9', 'R2C9', 'R3C9'],
  // bottom, column 1: R9C1,R8C1,R7C1
  ['4_6', 'R9C1', 'R8C1', 'R7C1'],
  // bottom, column 4: R9C4,R8C4,R7C4
  ['5', 'R9C4', 'R8C4', 'R7C4'],
  // bottom, column 9: R9C9,R8C9,R7C9
  ['2_8', 'R9C9', 'R8C9', 'R7C9'],
];

const whisperLines = [
  ['R1C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7'],
  ['R4C3', 'R5C4', 'R5C5', 'R5C6', 'R6C7'],
  ['R7C3', 'R8C4', 'R8C5', 'R8C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...outsideClues.map(([values, ...cells]) => new ContainAtLeast(values, ...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
];
