// Title: 10/15/22: Squeaky Sum Time
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=FpaGo21lbhM
// Source: https://tinyurl.com/3uk3z35n

// Normal 9x9 Sudoku, with the given digits below. Each drawn line has equal
// digit sums in every 3x3 box portion; each array is one such box portion.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C9', 2),
  new Given('R2C7', 6),
  new Given('R3C2', 4), new Given('R3C6', 9),
  new Given('R4C3', 5), new Given('R5C5', 9), new Given('R6C7', 7),
  new Given('R7C4', 9), new Given('R7C8', 5), new Given('R8C3', 3),
  new Given('R9C1', 8), new Given('R9C9', 7),

  // Drawn region-sum lines, transcribed as their successive 3x3-box portions.
  new EqualSum(['R1C2', 'R1C3'], ['R1C4', 'R1C5', 'R1C6'], ['R1C7', 'R1C8']),
  new EqualSum(['R9C2', 'R9C3'], ['R9C4', 'R9C5', 'R9C6'], ['R9C7', 'R9C8']),
  new EqualSum(['R8C9', 'R7C9'], ['R6C9', 'R5C9', 'R4C9'], ['R3C9', 'R2C9']),
  new EqualSum(['R2C1', 'R3C1'], ['R4C1', 'R5C1', 'R6C1'], ['R7C1', 'R8C1']),
  new EqualSum(['R8C2', 'R7C3'], ['R6C4']),
  new EqualSum(['R4C6'], ['R3C7', 'R2C8']),
  new EqualSum(['R2C2', 'R3C3'], ['R4C4']),
  new EqualSum(['R6C6'], ['R7C7', 'R8C8']),
];
