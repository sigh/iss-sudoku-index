// Title: DAD
// Author: PrimeWeasel
// Video: https://www.youtube.com/watch?v=dkh1S2jtf7Y
// Source: https://app.crackingthecryptic.com/sudoku/NF3LdbT6h6

// Normal sudoku rules apply.
//
// Every black-outlined cage (all 24, drawn with no printed total -- provenance
// below) has all-different digits, and its sum is one of 41, 14, 4 or 1 (the
// rule does not say which cage gets which total).
//
// The grid also carries three grey shapes, unrelated to the black cages
// (cells can and do belong to both a black cage and a grey shape): two
// 9-cell "4"-shaped regions, each all-different and summing to 45, and one
// 5-cell "1"-shaped region (a single grid column, so all-different already
// follows from the column rule) summing to 18.
//
// "Whenever two neighbouring cells in a cage have a difference of 1 or 4,
// there is a white dot between them" is a universal claim about every
// within-cage adjacent pair, so its contrapositive holds too: a within-cage
// adjacent pair with no dot must NOT differ by 1 or 4. Both directions are
// encoded below, scoped to pairs that share a black cage (the rule says "in
// a cage"); adjacent pairs that cross a cage boundary are unconstrained by
// this rule.

// Cage cell lists transcribed from the payload's cage geometry (24 real
// cages; three other entries are metadata stubs for author/title/rules and
// are not cages).
const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R1C9'],
  ['R2C1', 'R2C2', 'R3C2'],
  ['R3C1', 'R4C1'],
  ['R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R4C2', 'R5C2', 'R5C1'],
  ['R3C4', 'R2C4', 'R2C5'],
  ['R2C6'],
  ['R3C5', 'R3C6', 'R3C7'],
  ['R2C7', 'R2C8'],
  ['R2C9', 'R3C9', 'R4C9', 'R4C8', 'R5C8', 'R6C8', 'R6C9', 'R5C9'],
  ['R4C7', 'R5C7', 'R5C6'],
  ['R4C6'],
  ['R4C4', 'R4C5'],
  ['R5C5', 'R5C4', 'R6C4'],
  ['R6C6', 'R6C7'],
  ['R6C5', 'R7C4', 'R7C5', 'R7C6', 'R8C6', 'R7C7', 'R7C8', 'R7C9'],
  ['R7C3'],
  ['R7C2', 'R8C2', 'R8C3'],
  ['R6C2', 'R6C1', 'R7C1', 'R8C1'],
  ['R9C2', 'R9C1'],
  ['R9C3', 'R9C4', 'R8C4'],
  ['R8C5', 'R9C5', 'R9C6', 'R8C7', 'R9C7', 'R9C8', 'R8C9', 'R9C9'],
  ['R8C8'],
  ['R3C8'],
];
const cageTotals = [41, 14, 4, 1];
const cageConstraints = cages.flatMap(cells => [
  ...(cells.length > 1 ? [new AllDifferent(...cells)] : []),
  new Or(cageTotals.map(total => new Sum(total, ...cells))),
]);

// Grey shapes transcribed from the payload's grey-fill overlay geometry (23
// grey cells, split into three orthogonally-connected components: two
// identical 9-cell "4" pixel shapes and one 5-cell vertical "1" shape).
const greyFourA = ['R3C1', 'R3C3', 'R4C1', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C3', 'R7C3'];
const greyFourB = ['R3C7', 'R3C9', 'R4C7', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C9', 'R7C9'];
const greyOne = ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'];
const greyConstraints = [
  new Cage(45, ...greyFourA),
  new Cage(45, ...greyFourB),
  new Sum(18, ...greyOne),
];

// Dotted / undotted within-cage adjacent pairs, both transcribed against the
// cage cell lists above: the payload's dot-mark overlay geometry gives the
// 21 dotted pairs; every other orthogonally-adjacent pair sharing a cage is
// undotted.
const dottedPairs = [
  ['R1C4', 'R1C5'], ['R1C6', 'R1C7'], ['R2C1', 'R2C2'], ['R2C2', 'R3C2'],
  ['R3C1', 'R4C1'], ['R2C3', 'R3C3'], ['R2C4', 'R3C4'], ['R3C5', 'R3C6'],
  ['R3C9', 'R4C9'], ['R4C8', 'R4C9'], ['R5C8', 'R6C8'], ['R5C6', 'R5C7'],
  ['R6C6', 'R6C7'], ['R6C5', 'R7C5'], ['R7C4', 'R7C5'], ['R7C5', 'R7C6'],
  ['R7C6', 'R8C6'], ['R7C7', 'R7C8'], ['R7C8', 'R7C9'], ['R9C5', 'R9C6'],
  ['R9C7', 'R9C8'],
];
const undottedPairs = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C3', 'R1C4'], ['R1C5', 'R1C6'],
  ['R1C7', 'R1C8'], ['R3C3', 'R4C3'], ['R4C3', 'R5C3'], ['R5C3', 'R6C3'],
  ['R4C2', 'R4C3'], ['R4C2', 'R5C2'], ['R5C2', 'R5C3'], ['R5C1', 'R5C2'],
  ['R2C4', 'R2C5'], ['R3C6', 'R3C7'], ['R2C7', 'R2C8'], ['R2C9', 'R3C9'],
  ['R4C9', 'R5C9'], ['R4C8', 'R5C8'], ['R5C8', 'R5C9'], ['R6C8', 'R6C9'],
  ['R5C9', 'R6C9'], ['R4C7', 'R5C7'], ['R4C4', 'R4C5'], ['R5C4', 'R5C5'],
  ['R5C4', 'R6C4'], ['R7C6', 'R7C7'], ['R7C2', 'R8C2'], ['R8C2', 'R8C3'],
  ['R6C1', 'R6C2'], ['R6C1', 'R7C1'], ['R7C1', 'R8C1'], ['R9C1', 'R9C2'],
  ['R9C3', 'R9C4'], ['R8C4', 'R9C4'], ['R8C5', 'R9C5'], ['R9C6', 'R9C7'],
  ['R8C7', 'R9C7'], ['R9C8', 'R9C9'], ['R8C9', 'R9C9'],
];

const dotKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1 || Math.abs(a - b) === 4, 9);
const noDotKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1 && Math.abs(a - b) !== 4, 9);
const dotConstraints = [
  ...dottedPairs.map(([a, b]) => new Pair(dotKey, 'white dot', a, b)),
  ...undottedPairs.map(([a, b]) => new Pair(noDotKey, 'no dot', a, b)),
];

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...greyConstraints,
  ...dotConstraints,
];
