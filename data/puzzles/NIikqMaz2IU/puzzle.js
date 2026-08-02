// Title: Welcome to Elementary School
// Author: Flipsen
// Video: https://www.youtube.com/watch?v=NIikqMaz2IU
// Source: https://app.crackingthecryptic.com/sudoku/DGjdPjDn9P

// Normal Sudoku rules apply. The locally stored board does not identify the paths of
// its fog-revealed Fibonacci lines, so those are omitted. Black and white dots are
// respectively 1:2-ratio and consecutive pairs. Each arrow
// arm sums to its circle, while the two-cell pill is read left-to-right as a number.
return [
  new Shape('9x9'),
  new BlackDot('R6C1', 'R7C1'),
  new BlackDot('R3C4', 'R4C4'),
  new BlackDot('R5C8', 'R5C9'),
  new WhiteDot('R5C3', 'R6C3'),
  new WhiteDot('R9C3', 'R9C4'),
  new Arrow('R4C6', 'R5C5', 'R6C4'),
  new PillArrow(2, 'R3C1', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2', 'R8C3'),
  new Arrow('R8C5', 'R8C6', 'R9C5'),
];
