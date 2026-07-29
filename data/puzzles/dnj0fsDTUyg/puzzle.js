// Title: Counting Calories
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=dnj0fsDTUyg
// Source: https://sudokupad.app/meq4crszcg

// Normal Sudoku rules apply. The three grey arrow cells equal the sums of the
// adjacent cells selected by their drawn arrowheads. The coloured-region rules
// are omitted because the source supplies no fixed region geometry.
return [
  new Shape('9x9'),
  new EqualSum(['R7C1'], ['R8C1', 'R8C2']),
  new EqualSum(['R8C4'], ['R7C3', 'R7C5', 'R8C3', 'R9C4']),
  new EqualSum(['R7C8'], ['R7C9', 'R8C7']),
];
