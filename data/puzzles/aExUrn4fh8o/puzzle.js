// Title: Thripple The Fun
// Author: Flinty
// Video: https://www.youtube.com/watch?v=aExUrn4fh8o
// Source: https://sudokupad.app/20vtk6jbbz

// Normal Sudoku rules apply. At each equal distance on a purple three-legged
// Thripper, the three leg digits sum to its bumped centre digit.

const THRIPPERS = [
  ['R4C1', [['R3C1', 'R2C1', 'R1C1'], ['R3C2', 'R3C3', 'R2C3'], ['R5C1', 'R6C1', 'R7C1']]],
  ['R4C4', [['R4C3', 'R4C2'], ['R3C4', 'R2C5'], ['R5C4', 'R6C5']]],
  ['R9C3', [['R9C2', 'R9C1'], ['R8C3', 'R7C3'], ['R9C4', 'R9C5']]],
  ['R1C8', [['R1C7', 'R1C6'], ['R1C9', 'R2C9'], ['R2C8', 'R3C8']]],
  ['R4C8', [['R4C7'], ['R4C9'], ['R5C8']]],
  ['R7C7', [['R7C8', 'R8C8'], ['R8C6', 'R8C5'], ['R6C7', 'R6C6']]],
];

// The arrays transcribe the drawn purple lines centre-outward. Each same-index
// triple is one equal-distance layer of its Thripper.
const thripperSums = THRIPPERS.flatMap(([centre, legs]) =>
  legs[0].map((_, distance) => new EqualSum(
    [legs[0][distance], legs[1][distance], legs[2][distance]], [centre])));

return [
  new Shape('9x9'),
  ...thripperSums,
];
