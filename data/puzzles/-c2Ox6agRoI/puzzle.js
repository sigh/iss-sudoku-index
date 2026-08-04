// Title: Walk in the Mist
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=-c2Ox6agRoI
// Source: https://app.crackingthecryptic.com/sudoku/RmTRjp4dDb

// Normal sudoku rules apply (standard 3x3 boxes, no jigsaw). Fog is a
// solving-UI overlay only and is not encoded (it names no final-grid rule).
// Arrow's circle sits on the arrow's first path cell (the bulb/total cell);
// Arrow(...) takes that cell first, followed by the arm. Thermo(...) takes
// the bulb cell first. White/black dots are drawn between exactly the
// listed adjacent pairs; the rules state that undrawn pairs carry no
// information, so no negative (Strict Kropki) constraint is added.

const arrows = [
  ['R3C1', 'R3C2', 'R3C3'],
  ['R2C1', 'R2C2', 'R1C3', 'R2C3', 'R2C4'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R5C1', 'R4C2', 'R4C3'],
  ['R7C6', 'R7C7', 'R6C8'],
].map((cells) => new Arrow(...cells));

const thermos = [
  ['R1C4', 'R1C3'],
  ['R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6'],
  ['R9C8', 'R9C9'],
].map((cells) => new Thermo(...cells));

const whiteDots = [
  ['R3C1', 'R4C1'],
  ['R1C6', 'R2C6'],
  ['R2C7', 'R2C8'],
  ['R7C3', 'R8C3'],
  ['R6C9', 'R7C9'],
  ['R8C8', 'R8C9'],
].map((cells) => new WhiteDot(...cells));

const blackDots = [
  ['R7C2', 'R7C3'],
  ['R8C5', 'R8C6'],
  ['R8C9', 'R9C9'],
].map((cells) => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...arrows,
  ...thermos,
  ...whiteDots,
  ...blackDots,
];
