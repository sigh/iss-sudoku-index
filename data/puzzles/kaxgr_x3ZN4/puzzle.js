// Title: Flux Capacitor
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=kaxgr_x3ZN4
// Source: https://sudokupad.app/6oz1ae7e1l

// Red and blue are branching networks: each endpoint on one side connects to
// both endpoints on the opposite side through the shared three-cell trunk.
const redTop = ['R3C4', 'R3C6'];
const redBottom = ['R7C4', 'R7C6'];
const redTrunk = ['R4C5', 'R5C5', 'R6C5'];
const redLines = redTop.flatMap(top =>
  redBottom.map(bottom => new Between(top, ...redTrunk, bottom)));

const blueLeft = ['R4C3', 'R6C3'];
const blueRight = ['R4C7', 'R6C7'];
const blueTrunk = ['R5C4', 'R5C5', 'R5C6'];
const blueLines = blueLeft.flatMap(left =>
  blueRight.map(right => new Between(left, ...blueTrunk, right)));

return [
  new Shape('9x9'),
  new Given('R2C7', 8),
  new Given('R3C8', 5),

  new Cage(15, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(17, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(17, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(8, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(16, 'R6C3', 'R7C3', 'R7C4'),
  new Cage(17, 'R6C7', 'R7C6', 'R7C7'),
  new Cage(19, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(17, 'R8C9', 'R9C8', 'R9C9'),

  // Curved grey ring; corner-grazing cells are not on the line.
  new Between('R3C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7'),
  new Between('R3C7', 'R4C8', 'R5C8', 'R6C8', 'R7C7'),
  new Between('R7C7', 'R8C6', 'R8C5', 'R8C4', 'R7C3'),
  new Between('R7C3', 'R6C2', 'R5C2', 'R4C2', 'R3C3'),

  ...redLines,
  ...blueLines,
];
