// Title: Outside Palindrome Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=SuzBgBqaztw
// Source: https://tinyurl.com/ytemevev

// Normal Sudoku rules apply. Each outside label's digits occur among its first
// three inward cells, and each drawn grey line is a palindrome. The tables
// transcribe the eight outside labels and four grey lines.
const outsideClues = [
  ['1_2_3', ['R1C4', 'R2C4', 'R3C4']],
  ['3_4_7', ['R1C8', 'R2C8', 'R3C8']],
  ['4_5_9', ['R1C9', 'R1C8', 'R1C7']],
  ['1_4_7', ['R4C9', 'R4C8', 'R4C7']],
  ['4_5_6', ['R9C6', 'R8C6', 'R7C6']],
  ['6_7_8', ['R9C2', 'R8C2', 'R7C2']],
  ['2_5_8', ['R6C1', 'R6C2', 'R6C3']],
  ['1_2_7', ['R9C1', 'R9C2', 'R9C3']],
];

const palindromes = [
  ['R2C4', 'R2C5', 'R2C6', 'R3C7', 'R4C7', 'R5C7'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C7', 'R7C6', 'R7C5'],
  ['R8C6', 'R8C5', 'R8C4', 'R7C3', 'R6C3', 'R5C3'],
  ['R6C2', 'R5C2', 'R4C2', 'R3C3', 'R3C4', 'R3C5'],
];

return [
  new Shape('9x9'),
  ...outsideClues.map(([digits, cells]) => new ContainAtLeast(digits, ...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
];
