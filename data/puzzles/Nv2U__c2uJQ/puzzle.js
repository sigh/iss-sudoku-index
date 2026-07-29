// Title: Dovetail
// Author: zetamath & friends
// Video: https://www.youtube.com/watch?v=Nv2U__c2uJQ
// Source: https://sudokupad.app/7fapjms0yv

// Normal Sudoku applies. Digits do not repeat on any drawn line. Grey lines
// partition into consecutive segments summing to 10; green lines are whispers;
// blue lines have equal box-segment sums; the circled grey line is a double
// arrow; teal lines are modulo 3; peach lines are entropic; red lines alternate
// parity.
const green = ['R1C2', 'R2C2', 'R2C1', 'R3C1', 'R4C1'];
const blueA = ['R5C2', 'R4C2', 'R3C2', 'R3C3', 'R2C3', 'R2C4', 'R2C5', 'R2C6'];
const blueB = ['R3C4', 'R3C5', 'R3C6', 'R4C6', 'R5C6', 'R5C5', 'R5C4'];
const peach = ['R6C6', 'R6C7', 'R5C7', 'R5C8', 'R5C9'];
const tealA = ['R5C3', 'R4C3', 'R4C4', 'R4C5'];
const tealB = ['R6C8', 'R7C9', 'R8C8', 'R9C9'];
const circledGrey = ['R7C6', 'R7C7', 'R8C7', 'R9C7', 'R9C6'];
const redA = ['R7C1', 'R6C1', 'R6C2'];
const redB = ['R9C3', 'R9C4', 'R8C4'];
const grey = ['R4C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9'];
const lines = [green, blueA, blueB, peach, tealA, tealB, circledGrey, redA, redB, grey];

// State 0 is between grey-line segments; each digit advances the current
// segment sum, and reaching 10 starts the next segment.
const sumTenSegments = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => sum + value <= 10 ? (sum + value) % 10 : undefined,
  accept: sum => sum === 0,
}, 9);

return [
  new Shape('9x9'),
  ...lines.map(line => new AllDifferent(...line)),
  new Whisper(5, ...green),
  new RegionSumLine(...blueA),
  new RegionSumLine(...blueB),
  new NFA(sumTenSegments, 'sum-10 segments', grey),
  new DoubleArrow(...circledGrey),
  new Modular(3, ...tealA),
  new Modular(3, ...tealB),
  new Entropic(...peach),
  new Modular(2, ...redA),
  new Modular(2, ...redB),
];
