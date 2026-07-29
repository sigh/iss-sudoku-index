// Title: A puzzle of two halves
// Author: Arbitrary
// Video: https://www.youtube.com/watch?v=M0SOXBm5I6k
// Source: https://app.crackingthecryptic.com/f3hfvcu3xz

// Normal Sudoku rules apply. Pink lines are Renban lines. The arrow circle
// equals its shaft sum. In each labelled quad, every shown letter occurs in
// its surrounding 2x2; A-F stand for six different digits.

const letters = new Var('Q', 'quad letters A through F', 6);
const [A, B, C, D, E, F] = letters.cells();

// Each table entry is a drawn pink path; repeated closing cells are omitted
// because Renban is a set constraint.
const renbans = [
  ['R6C6', 'R7C5'],
  ['R7C7', 'R8C6'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R4C5', 'R4C6', 'R5C7'],
  ['R6C5', 'R7C4'],
  ['R8C8', 'R9C8', 'R9C9', 'R8C9'],
  ['R6C8', 'R7C8', 'R7C9', 'R6C9'],
  ['R6C1', 'R6C2', 'R7C2', 'R7C1'],
  ['R1C5', 'R2C5', 'R3C5', 'R2C4', 'R1C4'],
  ['R4C2', 'R5C3', 'R5C2', 'R5C1', 'R4C1'],
  ['R2C8', 'R3C8', 'R2C9', 'R1C9', 'R1C8'],
  ['R3C9', 'R4C9', 'R5C9', 'R5C8', 'R4C8'],
  ['R9C1', 'R9C2', 'R8C3', 'R8C2', 'R8C1'],
  ['R9C3', 'R9C4', 'R9C5', 'R8C5', 'R8C4'],
].map(cells => new Renban(...cells));

// A letter value must match at least one cell in its labelled 2x2 quad.
const letterQuad = (topLeft, ...values) => new And(values.map(value =>
  new Or(Quad.cells(topLeft).map(cell => new SameValues(2, value, cell)))));

// This table transcribes the black quad circles and their printed letters.
const quads = [
  letterQuad('R8C2', A, E), letterQuad('R8C8', A),
  letterQuad('R2C7', E), letterQuad('R3C7', A, F),
  letterQuad('R1C2', A), letterQuad('R6C1', B),
  letterQuad('R2C8', B), letterQuad('R7C5', D, E, F),
  letterQuad('R2C2', B, E), letterQuad('R5C3', F),
  letterQuad('R4C8', C), letterQuad('R1C8', C),
  letterQuad('R3C1', C), letterQuad('R5C6', D),
  letterQuad('R1C5', D),
];

return [
  new Shape('9x9'),
  letters,
  new AllDifferent(A, B, C, D, E, F),
  ...renbans,
  new Arrow('R3C3', 'R4C4', 'R5C5'),
  ...quads,
];
