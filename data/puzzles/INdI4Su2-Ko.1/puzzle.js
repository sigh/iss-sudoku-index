// Title: Jul 1, 2022: Zones Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=INdI4Su2-Ko
// Source: http://tinyurl.com/5n89wcns

// Normal Sudoku rules apply. Each outlined cage's printed digit string lists
// digits that must appear somewhere in the cage; a digit repeated n times in
// the string must appear at least n times among the cage's cells. The string
// is a floor, not a total or an exhaustive list: an unlisted digit, or a
// listed digit beyond its printed count, may still occupy a cage cell.
// The table below is transcribed from the source payload's cage `cells` and
// `value` (digit-string) fields.
const zones = [
  ['2_2_2', 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5'],
  ['1_1_1', 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7'],
  ['5_6_7_8_9', 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  ['1_2_9', 'R1C8', 'R1C9', 'R2C9'],
  ['2_5_9', 'R8C1', 'R9C1', 'R9C2'],
  ['4_4_4', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R4C2'],
  ['3_3_3', 'R6C8', 'R7C7', 'R7C8', 'R8C6', 'R8C7'],
  ['1_3_8_8', 'R8C3', 'R9C3', 'R9C4', 'R9C5'],
  ['4_7_7_8', 'R5C1', 'R6C1', 'R7C1', 'R7C2'],
  ['3_6_6_8', 'R3C8', 'R3C9', 'R4C9', 'R5C9'],
  ['2_4_5_5', 'R1C5', 'R1C6', 'R1C7', 'R2C7'],
  ['1_3_8', 'R1C1', 'R1C2', 'R2C1'],
  ['1_2_4', 'R8C9', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...zones.map(([digits, ...cells]) => new ContainAtLeast(digits, ...cells)),
];
