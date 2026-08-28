// Title: Rainbow Rising
// Author: deedoeDaydoh
// Video: https://www.youtube.com/watch?v=ox8_JxXYFwM
// Source: https://tinyurl.com/mr2yw8pm

// Standard Sudoku plus three sum-arrows and seven coloured lines, each
// carrying one named rule: Red=Entropic, Orange=Dutch Whisper (diff>=4),
// Yellow=Palindrome, Green=German Whisper (diff>=5), Blue=Region Sum Line,
// Indigo=Bounded (endpoints are the line's min and max), Violet=Renban.
// The rules give the colour order left-to-right; each line's starting
// column on row 9 (C1..C7, in that order) is what pairs colour to path.
const givens = [
  new Given('R1C1', 5),
  new Given('R2C3', 7),
  new Given('R2C5', 6),
  new Given('R3C2', 1),
  new Given('R3C4', 7),
  new Given('R5C4', 3),
  new Given('R6C3', 3),
  new Given('R8C6', 4),
  new Given('R9C7', 4),
];

// Arrows: first cell is the circle, remaining cells are the arm that sums
// to it.
const arrows = [
  new Arrow('R6C1', 'R6C2', 'R7C2'),
  new Arrow('R1C1', 'R2C1', 'R2C2'),
  new Arrow('R5C1', 'R4C1', 'R3C2', 'R4C3', 'R4C2'),
];

const red = new Entropic(
  'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R2C9');
const orange = new Whisper(
  4, 'R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R3C9');
const yellow = new Palindrome(
  'R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R4C9');
const green = new Whisper(
  5, 'R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R5C9');
const blue = new RegionSumLine(
  'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R6C9');
// Indigo = "Bounded": R9C6 and R7C9 hold the line's overall min and max, in
// whichever order. The rules' own worked example ("1,1,2,3") shows a middle
// cell may repeat an extreme, so the bound is <=/>=, not ISS's strict
// `Between` (which would forbid a mid cell equal to an end). Encoded as: for
// each ordering of which end is the max, both mids sit weakly inside it.
const indigoEnds = ['R9C6', 'R7C9'];
const indigoMids = ['R8C7', 'R7C8'];
const leqKey = Pair.fnToKey((a, b) => a <= b, 9);
const indigo = new Or([
  new And(indigoMids.flatMap(m => [
    new Pair(leqKey, 'bounded-lo', indigoEnds[1], m),
    new Pair(leqKey, 'bounded-hi', m, indigoEnds[0]),
  ])),
  new And(indigoMids.flatMap(m => [
    new Pair(leqKey, 'bounded-lo', indigoEnds[0], m),
    new Pair(leqKey, 'bounded-hi', m, indigoEnds[1]),
  ])),
]);
const violet = new Renban('R9C7', 'R8C8', 'R8C9');

return [
  new Shape('9x9'),
  ...givens,
  ...arrows,
  red,
  orange,
  yellow,
  green,
  blue,
  indigo,
  violet,
];
