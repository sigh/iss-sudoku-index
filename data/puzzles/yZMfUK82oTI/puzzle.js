// Title: Rings Around The Rosie
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=yZMfUK82oTI
// Source: https://cracking-the-cryptic.web.app/sudoku/Jb4tLNM7HN

// Rules (video description), all encoded:
//  * Normal sudoku rules apply.
//  * The sum of the numbers in each ring will appear in the bolded
//    rectangles: each coloured ring holds one bold 1x2 rectangle, read as a
//    two-digit number (tens digit left, units digit right). The rectangle
//    cells are ring cells and count in the ring's sum.
//  * These sums are 5 unique prime numbers.
//  * The sum of all five ring totals is a palindrome that must appear
//    diagonally in the completed grid: five two-digit totals add to a
//    three-digit palindrome ABA, which must occupy three diagonally
//    consecutive cells somewhere in the grid (a palindrome reads the same
//    both ways, so orientation does not matter).
//  * Digits cannot repeat within cages.
//  * The cages within each coloured ring sum to the same total, but these
//    totals may differ from ring to ring.

const graph = cellGraph('9x9');

// A hollow rectangle of cells: the block minus its interior.
const ring = (topLeft, rows, cols) => {
  const { row, col } = parseCellId(topLeft);
  const inner = new Set(
    graph.block(makeCellId(row + 1, col + 1), rows - 2, cols - 2));
  return graph.block(topLeft, rows, cols).filter(c => !inner.has(c));
};

// Rings from the coloured cell underlays; rectangles from the bold black
// outlines; cages from the dashed cages, each wholly inside one ring.
const RINGS = [
  {
    name: 'red', cells: ring('R1C1', 3, 6), tens: 'R1C5', units: 'R1C6',
    cages: [
      ['R1C1', 'R1C2', 'R1C3'],
      ['R2C1', 'R3C1', 'R3C2', 'R3C3'],
      ['R1C4', 'R1C5', 'R1C6'],
      ['R2C6', 'R3C6', 'R3C5'],
    ],
  },
  {
    name: 'blue', cells: ring('R1C7', 6, 3), tens: 'R1C8', units: 'R1C9',
    cages: [
      ['R3C7', 'R2C7', 'R1C7', 'R1C8', 'R1C9'],
      ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
      ['R4C7', 'R5C7', 'R6C7'],
    ],
  },
  {
    name: 'purple', cells: ring('R4C4', 3, 3), tens: 'R4C4', units: 'R4C5',
    cages: [
      ['R4C6', 'R5C6', 'R6C6'],
      ['R5C4', 'R6C4'],
    ],
  },
  {
    name: 'grey', cells: ring('R4C1', 6, 3), tens: 'R4C1', units: 'R4C2',
    cages: [
      ['R4C2', 'R4C3'],
      ['R6C3', 'R7C3', 'R8C3', 'R9C3'],
      ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
    ],
  },
  {
    name: 'green', cells: ring('R7C4', 3, 6), tens: 'R9C4', units: 'R9C5',
    cages: [
      ['R9C7', 'R9C6', 'R9C5'],
      ['R9C4', 'R8C4', 'R7C4', 'R7C5'],
      ['R7C6', 'R7C7', 'R7C8', 'R7C9'],
    ],
  },
];

const isPrime = n => n >= 2 && ![...Array(n).keys()].some(
  d => d >= 2 && d * d <= n && n % d === 0);
// (tens, units) keyed: the two-digit number they spell is prime.
const PRIME_KEY = Pair.fnToKey((t, u) => isPrime(10 * t + u), 9);
const EQUAL_KEY = Pair.fnToKey((a, b) => a === b, 9);
const DIFFER_KEY = Pair.fnToKey((a, b) => a !== b, 9);

// Two two-digit totals differ when their tens or their units digits differ.
const distinctTotals = [];
for (let i = 0; i < RINGS.length; i++) {
  for (let j = i + 1; j < RINGS.length; j++) {
    distinctTotals.push(new Or([
      new Pair(DIFFER_KEY, 'tens differ', RINGS[i].tens, RINGS[j].tens),
      new Pair(DIFFER_KEY, 'units differ', RINGS[i].units, RINGS[j].units),
    ]));
  }
}

// Palindrome ABA: VP1 = A (hundreds and units), VP2 = B (tens).
const palindrome = new Var('P', 'Palindrome ABA digits', 2);
const [A, B] = palindrome.cells();

// Every run of three diagonally consecutive cells, one orientation each.
const diagonalTriples = [];
for (let r = 1; r <= 7; r++) {
  for (let c = 1; c <= 7; c++) {
    diagonalTriples.push(
      [makeCellId(r, c), makeCellId(r + 1, c + 1), makeCellId(r + 2, c + 2)]);
    diagonalTriples.push(
      [makeCellId(r, c + 2), makeCellId(r + 1, c + 1), makeCellId(r + 2, c)]);
  }
}

return [
  new Shape('9x9'),
  palindrome,
  // Ring sum = 10 * tens + units (the tens/units cells also lie in the ring).
  ...RINGS.map(({ cells, tens, units }) =>
    new Sum(0, ...cells, [tens, -10], [units, -1])),
  ...RINGS.map(({ name, tens, units }) =>
    new Pair(PRIME_KEY, `${name} total is prime`, tens, units)),
  ...distinctTotals,
  // 100A + 10B + A = sum of the five ring totals.
  new Sum(0, [A, 100], [A, 1], [B, 10],
    ...RINGS.flatMap(({ tens, units }) => [[tens, -10], [units, -1]])),
  // ABA appears on some diagonal triple.
  new Or(diagonalTriples.map(([x, y, z]) => new And([
    new Pair(EQUAL_KEY, 'palindrome outer', A, x, z),
    new Pair(EQUAL_KEY, 'palindrome middle', B, y),
  ]))),
  ...RINGS.flatMap(({ cages }) => cages.map(cage => new AllDifferent(...cage))),
  ...RINGS.map(({ cages }) => new EqualSum(...cages)),
];
