// Title: March 1, 2023: XV Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=gkwd_Hr3uvc
// Source: https://tinyurl.com/3cv8nwdd

// Normal sudoku rules apply. Digits in a cage do not repeat and must sum to
// the indicated total. Digits separated by a V sum to 5, and digits
// separated by an X sum to 10. Not all possible Xes and Vs are necessarily
// given, so absence of a mark between two cells is not a negative
// constraint: only the marked pairs below are constrained (StrictXV is not
// used).

// Killer cages, transcribed from the drawn cage geometry.
const cages = [
  new Cage(11, 'R1C3', 'R1C4', 'R2C3'),
  new Cage(12, 'R3C1', 'R3C2', 'R4C1'),
  new Cage(14, 'R6C1', 'R7C1', 'R7C2'),
  new Cage(13, 'R8C3', 'R9C3', 'R9C4'),
  new Cage(12, 'R1C6', 'R1C7', 'R2C7'),
  new Cage(14, 'R3C8', 'R3C9', 'R4C9'),
  new Cage(13, 'R6C9', 'R7C8', 'R7C9'),
  new Cage(14, 'R8C7', 'R9C6', 'R9C7'),
  new Cage(16, 'R3C3', 'R3C4', 'R4C3', 'R4C4'),
  new Cage(25, 'R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(21, 'R6C6', 'R6C7', 'R7C6', 'R7C7'),
  new Cage(21, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
];

// V marks (sum to 5), transcribed from the drawn dot geometry.
const vMarks = [
  new V('R1C3', 'R1C4'),
  new V('R3C1', 'R3C2'),
  new V('R6C1', 'R7C1'),
  new V('R8C3', 'R9C3'),
  new V('R8C7', 'R9C7'),
  new V('R6C9', 'R7C9'),
  new V('R1C6', 'R1C7'),
  new V('R3C8', 'R3C9'),
];

// X marks (sum to 10), transcribed from the drawn dot geometry.
const xMarks = [
  new X('R1C3', 'R2C3'),
  new X('R3C1', 'R4C1'),
  new X('R7C1', 'R7C2'),
  new X('R9C3', 'R9C4'),
  new X('R1C7', 'R2C7'),
  new X('R3C9', 'R4C9'),
  new X('R7C8', 'R7C9'),
  new X('R9C6', 'R9C7'),
  new X('R3C4', 'R4C4'),
  new X('R6C3', 'R6C4'),
  new X('R4C6', 'R4C7'),
  new X('R6C6', 'R7C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...vMarks,
  ...xMarks,
];
