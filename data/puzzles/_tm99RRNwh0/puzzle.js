// Title: ...What?
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=_tm99RRNwh0
// Source: https://sudokupad.app/yiaonocy5d

// Standard 6x6 Sudoku. The no-repeat cage and the two thin grey palindrome
// lines are encoded. The overlapping circle/edge cluster cannot be partitioned
// into the circle-count instances or X clues from the local source alone.
const palindromes = [
  ['R6C5', 'R5C5', 'R4C4', 'R4C3', 'R3C2', 'R2C2', 'R1C2'],
  ['R4C5', 'R3C5', 'R2C6', 'R1C6'],
];

return [
  new Shape('6x6'),
  new AllDifferent('R5C1', 'R5C2', 'R5C3', 'R5C4'),
  ...palindromes.map(cells => new Palindrome(...cells)),
];
