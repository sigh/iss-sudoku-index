// Title: ...What?
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=_tm99RRNwh0
// Source: https://sudokupad.app/yiaonocy5d

// Standard 6x6 sudoku (rows/columns/boxes all-different).
// Cage R5C1-R5C4 carries no drawn total, so only the no-repeat half of the
// cage rule applies here.
// Two thin grey strokes are palindrome lines; the thicker #cccf stroke shares
// the second line's exact waypoints and is an outline/highlight layer, not a
// third line.
// One X clue is drawn between R4C3 and R4C4 as two crossed diagonal underlay
// bars (this source's rendering of the "X" mark, not the literal letter).
// The rules state not every possible X is marked, so no other adjacent pair
// is constrained.
// The circle-count rule and several other drawn marks are not encoded here.
const palindromes = [
  ['R6C5', 'R5C5', 'R4C4', 'R4C3', 'R3C2', 'R2C2', 'R1C2'],
  ['R4C5', 'R3C5', 'R2C6', 'R1C6'],
];

return [
  new Shape('6x6'),
  new AllDifferent('R5C1', 'R5C2', 'R5C3', 'R5C4'),
  ...palindromes.map(cells => new Palindrome(...cells)),
  new X('R4C3', 'R4C4'),
];
