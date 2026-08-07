// Title: Imperfect Flower
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=ZumfvSBRmIg
// Source: https://app.crackingthecryptic.com/sudoku/F39tr4Rm97

// Normal sudoku rules apply (standard boxes, default 9x9 shape).
// Every window of 5 consecutive cells along the closed purple loop must
// form a non-repeating consecutive set of digits (a size-5 Renban applied
// to every rotation of the cycle).
// Each 3-cell purple line (petal) must comprise a set of consecutive
// digits in any order (a size-3 Renban).
// Black dots: 1:2 ratio. White dots: consecutive.

// Closed purple loop, 20 distinct cells, in the order the line is drawn.
const loop = [
  'R4C3', 'R3C2', 'R2C3', 'R3C4', 'R3C5', 'R3C6', 'R2C7', 'R3C8', 'R4C7',
  'R5C7', 'R6C7', 'R7C8', 'R8C7', 'R7C6', 'R7C5', 'R7C4', 'R8C3', 'R7C2',
  'R6C3', 'R5C3',
];

// One Renban(5) per rotation of the closed loop -- "every string of 5
// consecutive cells" means every window, wrapping around the loop.
const loopWindows = loop.map((_, i) =>
  new Renban(...Array.from({ length: 5 }, (_, k) => loop[(i + k) % loop.length]))
);

// The four 3-cell "petal" lines drawn poking out of the loop. A fifth,
// undrawn purple line of the same colour/thickness carries no cells and
// is not encoded (see notes).
const petals = [
  new Renban('R4C2', 'R5C1', 'R6C2'), // left
  new Renban('R2C4', 'R1C5', 'R2C6'), // top
  new Renban('R8C4', 'R9C5', 'R9C6'), // bottom (the "imperfect" one)
  new Renban('R4C8', 'R5C9', 'R6C8'), // right
];

// Black dots (1:2 ratio).
const blackDots = [
  new BlackDot('R5C3', 'R5C4'),
  new BlackDot('R5C6', 'R5C7'),
  new BlackDot('R8C9', 'R9C9'),
];

// White dots (consecutive).
const whiteDots = [
  new WhiteDot('R3C5', 'R4C5'),
  new WhiteDot('R6C5', 'R7C5'),
  new WhiteDot('R9C1', 'R9C2'),
  new WhiteDot('R7C2', 'R7C3'),
  new WhiteDot('R1C8', 'R1C9'),
];

return [
  new Shape('9x9'),
  ...loopWindows,
  ...petals,
  ...blackDots,
  ...whiteDots,
];
