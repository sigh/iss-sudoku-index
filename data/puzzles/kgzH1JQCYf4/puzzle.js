// Title: MOM DAY
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=kgzH1JQCYf4
// Source: https://app.crackingthecryptic.com/3blhorinlx

// Normal Sudoku rules apply. The coloured paths and visible domino marks below
// encode every displayed clue; unmarked Xs, Vs, and dots are explicitly allowed.

// Arrow paths and circle positions transcribed from the two drawn arrows.
const arrows = [
  ['R3C2', 'R2C1', 'R3C1', 'R4C1'],
  ['R3C2', 'R2C3', 'R3C3', 'R4C3'],
];

// Coloured line paths transcribed from the drawn geometry. The red loop is split
// at its two circles so Between covers both routes between them.
const greenLine = ['R4C7', 'R3C7', 'R2C7', 'R3C8', 'R2C9', 'R3C9', 'R4C9'];
const pinkLine = ['R3C4', 'R4C4', 'R4C5', 'R4C6', 'R3C6', 'R2C6', 'R2C5', 'R2C4'];
const orangeLine = ['R5C1', 'R6C1', 'R7C1', 'R7C2', 'R6C3', 'R5C2'];
const redPaths = [
  ['R7C4', 'R6C4', 'R6C5', 'R7C6'],
  ['R7C4', 'R5C5', 'R6C6', 'R7C6'],
];

// The blue branching line has one segment in each box: R7C8 and R6C8/R5C7/R5C9.
const blueSegments = [
  ['R7C8'],
  ['R6C8', 'R5C7', 'R5C9'],
];

// Visible X, V, white-dot, and black-dot locations transcribed from the marks.
const xs = [['R8C2', 'R9C2'], ['R8C6', 'R8C7'], ['R9C3', 'R9C4']];
const vs = [['R8C8', 'R9C8'], ['R1C5', 'R2C5']];
const whiteDots = [['R2C1', 'R3C1'], ['R6C7', 'R7C7']];
const blackDots = [['R5C1', 'R5C2'], ['R6C5', 'R6C6']];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  new Renban(...pinkLine),
  new Whisper(5, ...greenLine),
  new Entropic(...orangeLine),
  ...redPaths.map(cells => new Between(...cells)),
  new EqualSum(...blueSegments),
  ...xs.map(cells => new X(...cells)),
  ...vs.map(cells => new V(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
