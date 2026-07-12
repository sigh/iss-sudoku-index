// Title: N is for Naomi
// Author: Fool on Hill
// Video: https://www.youtube.com/watch?v=1HuNjcLWlPE
// Source: https://sudokupad.app/pz0wrs1heo

// Normal sudoku rules apply. On each orange Dutch Whisper line, adjacent
// digits differ by at least 4. Two whisper shapes are each drawn as a closed
// loop plus a separate path connecting the same two hub cells (a "ring"
// theme, per the prequel "Dancing In A Ring"): each drawn segment, including
// the loop-closing edge, is its own array below so every adjacent-on-line
// pair from the raw geometry is covered.
const dutchWhispers = [
  ['R3C7', 'R4C6', 'R5C6', 'R4C7', 'R3C7'], // closed loop
  ['R3C7', 'R3C6', 'R3C5', 'R3C4', 'R4C5', 'R5C6'], // connecting path
  ['R5C4', 'R6C4', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R6C5', 'R5C4'], // closed loop
  ['R5C4', 'R6C3', 'R7C3'], // connecting path
];

// Pink Renban lines: the digits on the line form a consecutive set with no
// repeats. Three are drawn as closed 2x2 loops in a box corner; Renban is a
// set constraint (order-independent), so the loop-closing repeated cell is
// dropped rather than cited twice.
const renbanLines = [
  ['R5C3', 'R4C3', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R6C7', 'R5C7'],
  ['R8C1', 'R8C2', 'R9C2', 'R9C1'],
  ['R8C8', 'R8C9', 'R9C9', 'R9C8'],
  ['R1C8', 'R1C9', 'R2C9', 'R2C8'],
];

// White dots: the two digits are consecutive.
const whiteDots = [
  ['R6C9', 'R7C9'],
  ['R9C6', 'R9C7'],
  ['R2C4', 'R2C5'],
];

// Black dots: one digit is double the other. Not all possible dots are
// necessarily given, so no negative constraint is implied for undotted pairs.
const blackDots = [
  ['R1C2', 'R1C3'],
  ['R2C1', 'R3C1'],
  ['R2C5', 'R3C5'],
];

return [
  new Shape('9x9'),
  ...dutchWhispers.map(cells => new Whisper(4, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
