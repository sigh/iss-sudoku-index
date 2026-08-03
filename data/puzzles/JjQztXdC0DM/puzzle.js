// Title: Phog of War
// Author: apiyo
// Video: https://www.youtube.com/watch?v=JjQztXdC0DM
// Source: https://app.crackingthecryptic.com/sudoku/Hq7FFftdtJ

// Rules encoded: normal sudoku; no orthogonally adjacent cell pair sums to 3;
// the 32 perimeter cells (row 1, row 9, column 1, column 9, corners counted
// once) sum to 172; five thermometers increase from the bulb; seven lines
// require adjacent digits to differ by at least 5; six white dots join
// consecutive digits; two black dots join digits in a 1:2 ratio. Fog is a
// solving-progress overlay, not a rule on the finished grid, and is omitted.

const graph = cellGraph('9x9');

// Thermometers, bulb cell first (drawn as a grey circle at the low end of
// each grey line; source cages/lines/underlays give no total or other value).
const thermos = [
  new Thermo('R7C4', 'R7C3', 'R6C3', 'R5C3'),
  new Thermo('R3C6', 'R3C7', 'R4C7', 'R5C7'),
  new Thermo('R7C5', 'R7C6', 'R7C7', 'R6C7'),
  new Thermo('R3C5', 'R3C4', 'R3C3', 'R4C3'),
  new Thermo('R5C9', 'R5C8'),
];

// Green lines ("adjacent digits differ by at least 5"), one per drawn line
// entry. Two pairs of lines touch at a shared end cell (R1C2 and R4C3) but
// each entry is encoded as drawn, which does not change the set of adjacent
// pairs the rule applies to.
const whispers = [
  new Whisper(5, 'R1C2', 'R1C1', 'R2C1'),
  new Whisper(5, 'R8C9', 'R9C9', 'R9C8'),
  new Whisper(5, 'R8C1', 'R9C1', 'R9C2'),
  new Whisper(5, 'R1C8', 'R1C9', 'R2C9'),
  new Whisper(5, 'R2C2', 'R1C2'),
  new Whisper(5, 'R4C4', 'R4C3'),
  new Whisper(5, 'R5C5', 'R5C4'),
];

// White dots (consecutive digits).
const whiteDots = [
  new WhiteDot('R4C3', 'R5C3'),
  new WhiteDot('R5C7', 'R6C7'),
  new WhiteDot('R2C5', 'R3C5'),
  new WhiteDot('R1C7', 'R2C7'),
  new WhiteDot('R9C5', 'R9C6'),
  new WhiteDot('R8C6', 'R9C6'),
];

// Black dots (1:2 ratio).
const blackDots = [
  new BlackDot('R8C3', 'R9C3'),
  new BlackDot('R5C1', 'R5C2'),
];

// Perimeter sum: the 32 boundary cells (row 1, row 9, column 1, column 9,
// corners deduplicated) sum to 172.
const perimeter = [...new Set([
  ...graph.row(1), ...graph.row(9),
  ...graph.column(1), ...graph.column(9),
])];

// No domino sums to 3: the only two distinct 1-9 digits summing to 3 are 1
// and 2, so no orthogonally adjacent cell pair may hold {1, 2} in either
// order. Every horizontal and vertical edge is the same shifted copy of one
// template Pair, so each direction is one Replicate over the cells that have
// a neighbour that way, rather than 144 hand-generated Pair constraints.
const noSumThreeKey = Pair.fnToKey((a, b) => a + b !== 3, 9);
const horizStarts = graph.cells().filter(cell => graph.block(cell, 1, 2));
const vertStarts = graph.cells().filter(cell => graph.block(cell, 2, 1));
const noSumThree = [
  graph.makeReplicate(
    new Pair(noSumThreeKey, 'no sum to 3', 'R1C1', 'R1C2'), horizStarts),
  graph.makeReplicate(
    new Pair(noSumThreeKey, 'no sum to 3', 'R1C1', 'R2C1'), vertStarts),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...whispers,
  ...whiteDots,
  ...blackDots,
  new Sum(172, ...perimeter),
  ...noSumThree,
];
