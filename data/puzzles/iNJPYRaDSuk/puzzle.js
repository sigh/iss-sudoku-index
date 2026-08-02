// Title: Cryptic Rune
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=iNJPYRaDSuk
// Source: https://app.crackingthecryptic.com/sudoku/TfMt9NDLQ8

// Normal Sudoku rules apply. Each grey drawn path is a palindrome. Every white
// inequality sign points to its lower digit; GreaterThan receives higher, lower.
// The eight paths and fifteen signs below are transcribed from the drawn data.
const palindromes = [
  ['R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'],
  ['R2C4', 'R1C4', 'R2C3', 'R3C4', 'R4C5', 'R5C5'],
  ['R4C2', 'R4C1', 'R3C2', 'R4C3', 'R5C4', 'R5C5'],
  ['R8C6', 'R9C6', 'R8C7', 'R7C6', 'R6C5', 'R5C5'],
  ['R6C8', 'R6C9', 'R7C8', 'R6C7', 'R5C6', 'R5C5'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5'],
  ['R3C7', 'R2C7', 'R3C6', 'R4C7', 'R4C6', 'R5C5'],
  ['R7C3', 'R7C2', 'R6C3', 'R7C4', 'R7C5', 'R6C4', 'R5C5'],
];
const inequalities = [
  ['R8C2', 'R8C1'], ['R9C2', 'R9C1'], ['R9C6', 'R9C5'],
  ['R2C8', 'R2C9'], ['R8C4', 'R8C5'], ['R5C1', 'R5C2'],
  ['R5C9', 'R5C8'], ['R2C8', 'R1C8'], ['R5C9', 'R4C9'],
  ['R9C1', 'R8C1'], ['R8C6', 'R7C6'], ['R7C1', 'R8C1'],
  ['R5C1', 'R6C1'], ['R2C2', 'R3C2'], ['R2C8', 'R3C8'],
];

return [
  new Shape('9x9'),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...inequalities.map(cells => new GreaterThan(...cells)),
];
