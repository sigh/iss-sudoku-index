// Title: Holy wars
// Author: Disasterinprogress
// Video: https://www.youtube.com/watch?v=eWyue59aW1c
// Source: https://app.crackingthecryptic.com/sudoku/mpntqD3QfM

// Normal sudoku rules apply (standard 9 boxes).
//
// "All sevens and sixes located throughout the grid MUST connect with at
// least one other of the same digit via a knight's move. No other digits
// have any knight's move constraint." An existential match, per cell and
// per digit: encoded below as two Or(...) per grid cell (one for 6, one for
// 7), each a "cell is not this digit" branch plus one "this knight
// neighbour is this digit" branch per knight neighbour. Digits other than
// 6/7 get no knight-move constraint at all, positive or negative.
//
// "Cages must add up to a number divisible by seven." No cage carries a
// printed total, so the only fixed fact is the divisibility. Encoded as
// Or(Cage(v, cells)) over every multiple of 7 the cage's cell count can
// actually reach (using the digit alphabet with 6 removed, see below) -- a
// faithful enumeration of an open correspondence, not an approximation.
// Cage's own semantics (distinct + sum) match "cage" as drawn here.
//
// "6's cannot appear in thermometers or cages": a top-level Given excluding
// 6 from the candidate list of every cell in the cage/thermometer tables
// below.
//
// "Along a thermometer, digits increase from the bulb end." Thermo(...)
// per line, bulb cell first (matches the drawn circle overlay at that
// cell). Thermo already forces the cells distinct.
//
// "The total sum of all numbers on the thermometer must be divisible by
// 7." Same open-total pattern as the cages: Or(Sum(v, cells)) over every
// reachable multiple of 7.

const givens = [
  ['R2C2', 6], ['R3C3', 7], ['R5C5', 3], ['R8C5', 6],
];

// Cages: the 5 drawn dashed-outline cages (metadata-only entries for
// author/title/rules text are not cages).
const cages = [
  ['R1C9', 'R1C8', 'R2C8', 'R3C8', 'R2C9'],
  ['R8C8', 'R9C8', 'R9C7'],
  ['R5C6', 'R4C6', 'R4C5', 'R4C4', 'R5C4', 'R6C4'],
  ['R5C2', 'R5C3', 'R6C3'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C3'],
];

// Thermometers: the 9 drawn grey lines, each walked in the drawn order with
// straight multi-cell segments interpolated (e.g. thermo 4's R4C8-R4C6
// segment passes through R4C7). Bulb = first cell in each list; matches a
// drawn circle centred on that same cell for every one of the 9 lines.
const thermos = [
  ['R2C3', 'R3C4', 'R3C3', 'R4C3'],
  ['R3C2', 'R2C1'],
  ['R3C8', 'R2C9', 'R1C8', 'R1C9'],
  ['R4C8', 'R4C7', 'R4C6'],
  ['R5C4', 'R4C5', 'R5C6'],
  ['R6C1', 'R5C1', 'R5C2'],
  ['R7C3', 'R8C3', 'R7C2'],
  ['R8C6', 'R7C7', 'R7C8', 'R6C8', 'R6C7', 'R5C7'],
  ['R9C7', 'R9C8', 'R8C7', 'R8C8'],
];

// Every multiple of 7 that n cells drawn from {1,2,3,4,5,7,8,9} (9 minus the
// excluded 6) can sum to, using the standard min/max-subset-sum bounds for n
// distinct values from that alphabet.
const NO_SIX_ALPHABET = [1, 2, 3, 4, 5, 7, 8, 9];
function reachableMultiplesOf7(cellCount) {
  const sorted = [...NO_SIX_ALPHABET].sort((a, b) => a - b);
  const min = sorted.slice(0, cellCount).reduce((a, b) => a + b, 0);
  const max = sorted.slice(-cellCount).reduce((a, b) => a + b, 0);
  const out = [];
  for (let v = 7; v <= max; v += 7) if (v >= min) out.push(v);
  return out;
}

const cageConstraints = cages.map(
  cells => new Or(reachableMultiplesOf7(cells.length).map(v => new Cage(v, ...cells))));

const thermoConstraints = thermos.flatMap(cells => [
  new Thermo(...cells),
  new Or(reachableMultiplesOf7(cells.length).map(v => new Sum(v, ...cells))),
]);

const noSixCells = [...new Set([...cages.flat(), ...thermos.flat()])];
const noSixGivens = noSixCells.map(cell => new Given(cell, ...NO_SIX_ALPHABET));

// Knight-move connection for 6s and 7s.
const KNIGHT_STEPS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];
const graph = cellGraph('9x9');
const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const withoutDigit = d => ALL.filter(v => v !== d);

const knightConnections = graph.cells().flatMap(cell => {
  const neighbours = KNIGHT_STEPS
    .map(([dr, dc]) => graph.step(cell, dr, dc))
    .filter(n => n != null);
  return [6, 7].map(digit => new Or([
    new Given(cell, ...withoutDigit(digit)),
    ...neighbours.map(n => new Given(n, digit)),
  ]));
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...noSixGivens,
  ...cageConstraints,
  ...thermoConstraints,
  ...knightConnections,
];
