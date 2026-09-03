// Title: Chock-a-Block
// Author: Marty Sears and Justin Vitanza
// Video: https://www.youtube.com/watch?v=eREMbxX_5TY
// Source: https://sudokupad.app/1j53hl97cx

// Normal sudoku rules apply.
//
// Unique N-lines: every line in the grid is an N-line. An N-line splits into
// one or more non-overlapping runs of adjacent cells, each run summing to N.
// Every line has a different N value.
//
// Coloured lines carry one extra rule each:
//   pink      Renban -- the digits form a non-repeating consecutive set.
//   blue      Even sum -- all the digits on the line sum to an even number.
//   purple    Prime -- adjacent digits sum to a prime number.
//   red       Anti-Kropki -- no two digits anywhere on the line are
//             consecutive or in a 1:2 ratio (they may repeat).
//   turquoise Same difference -- every adjacent pair on the line has the same
//             difference; the line does not say which.
//   grey      no extra rule.
//
// The grey ring drawn around the grid is a note-taking margin, not board cells,
// so it carries no rules. There are no given digits.

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// The N-value overlay needs one value outside the digit set as a marker, so the
// alphabet is widened to 10 and the playable cells are restricted back to 1-9.
const MARKER = 10;
const shape = new Shape('9x9', MARKER);
const graph = cellGraph(shape);

// Line cell lists, in drawn order, transcribed from the stroke waypoints of the
// 27 coloured/grey lines. Each line covers exactly three cells and the 27 lines
// tile the 9x9 grid.
const PINK = [
  ['R1C2', 'R1C1', 'R2C2'],
  ['R9C1', 'R9C2', 'R8C3'],
  ['R8C8', 'R8C7', 'R9C8'],
  ['R9C9', 'R8C9', 'R7C9'],
];
const BLUE = [
  ['R5C1', 'R6C1', 'R7C2'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R2C1', 'R3C2', 'R3C3'],
];
const PURPLE = [
  ['R4C3', 'R5C2', 'R6C3'],
  ['R4C4', 'R5C3', 'R6C4'],
  ['R2C6', 'R3C7', 'R4C8'],
];
const RED = [
  ['R4C1', 'R3C1', 'R4C2'],
  ['R3C4', 'R4C5', 'R5C6'],
  ['R8C1', 'R7C1', 'R8C2'],
  ['R8C5', 'R9C6', 'R9C7'],
  ['R7C5', 'R6C6', 'R5C5'],
  ['R7C4', 'R6C5', 'R5C4'],
  ['R7C8', 'R6C9', 'R5C9'],
  ['R2C7', 'R1C8', 'R1C7'],
];
const TURQUOISE = [
  ['R2C5', 'R3C5', 'R4C6'],
  ['R3C6', 'R4C7', 'R5C7'],
  ['R8C6', 'R7C7', 'R6C8'],
];
const GREY = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R3C8', 'R4C9', 'R3C9'],
  ['R1C9', 'R2C8', 'R2C9'],
  ['R2C3', 'R1C3', 'R2C4'],
  ['R7C6', 'R6C7', 'R5C8'],
  ['R9C5', 'R9C4', 'R9C3'],
];
const LINES = [...PINK, ...BLUE, ...PURPLE, ...RED, ...TURQUOISE, ...GREY];

// N-value overlay. A run sums to at least 1 and a whole line to at most 9+9+9,
// so every line's N lies in 1..27. A single Var cell holds at most 16 values, so
// N is carried as a block index VQ (1..3) and an offset VR (1..9), reading
// N = 9*(VQ - 1) + VR.
const BLOCKS = 3;
const blockOf = new Var('Q', 'N block', LINES.length);
const offsetOf = new Var('R', 'N offset', LINES.length);
// One mask layer per block: mask h of a line repeats that line's VR when the
// line sits in block h, and holds MARKER otherwise. Requiring each mask layer to
// hold every offset 1..9 exactly once (and MARKER for the other 18 lines) says
// that the 27 (block, offset) pairs -- so the 27 N values -- are all different.
// It is an equivalent statement, not a stronger one: 27 lines drawing from the
// 27 available N values can only be all-different by using each value once,
// which puts exactly nine lines in each block with distinct offsets.
const masks = ['A', 'B', 'C'].map(
  (p, i) => new Var(p, `N offsets in block ${i + 1}`, LINES.length));

const nValueTerms = (i) => [[blockOf.cell(i + 1), 9], [offsetOf.cell(i + 1), 1]];
// 9*VQ + VR - (sum of cells) = 9  <=>  sum of cells = 9*(VQ - 1) + VR = N.
const runSumsToN = (i, cells) =>
  new Sum(9, ...nValueTerms(i), ...cells.map(c => [c, -1]));
// The four ways to cut a three-cell line into runs that each total N.
const nLine = (i, [a, b, c]) => new Or([
  new And([runSumsToN(i, [a, b, c])]),
  new And([runSumsToN(i, [a]), runSumsToN(i, [b, c])]),
  new And([runSumsToN(i, [a, b]), runSumsToN(i, [c])]),
  new And([runSumsToN(i, [a]), runSumsToN(i, [b]), runSumsToN(i, [c])]),
]);
const maskLink = (i, h) => new Or([
  new And([
    new Given(blockOf.cell(i + 1), h),
    new SameValues(2, masks[h - 1].cell(i + 1), offsetOf.cell(i + 1))]),
  new And([
    new Given(blockOf.cell(i + 1),
      ...[1, 2, 3].filter(x => x !== h)),
    new Given(masks[h - 1].cell(i + 1), MARKER)]),
]);
const maskContents = new Array(LINES.length - DIGITS.length).fill(MARKER);

// Adjacent digits sum to a prime: the reachable two-digit sums are 2..18.
const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17]);
const primeKey = Pair.fnToKey((a, b) => PRIMES.has(a + b), shape);
// No two digits on a red line are consecutive or in a 1:2 ratio; equal digits
// satisfy both halves, which is what "they may repeat" allows.
const antiKropkiKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a, shape);
// One key per candidate common difference, 0..8, for the turquoise lines.
const sameDifferenceKey = (d) => Pair.fnToKey((a, b) => Math.abs(a - b) === d, shape);
const sameDifference = ([a, b, c]) => new Or(
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map(d => new And([
    new Pair(sameDifferenceKey(d), `difference ${d}`, a, b),
    new Pair(sameDifferenceKey(d), `difference ${d}`, b, c)])));
// A three-digit total is even exactly when an even number of the digits is odd.
const EVEN_SUM = '([2468][2468][2468]|[2468][13579][13579]'
  + '|[13579][2468][13579]|[13579][13579][2468])';

return [
  shape,
  blockOf, offsetOf, ...masks,
  graph.makeReplicate(new Given(graph.cells()[0], ...DIGITS)),
  ...LINES.map((_, i) => new Given(blockOf.cell(i + 1), 1, 2, BLOCKS)),
  ...LINES.map((_, i) => new Given(offsetOf.cell(i + 1), ...DIGITS)),
  ...LINES.map((cells, i) => nLine(i, cells)),
  ...LINES.flatMap((_, i) => [1, 2, BLOCKS].map(h => maskLink(i, h))),
  ...masks.map(mask => new ContainExact(
    [...DIGITS, ...maskContents].join('_'), ...mask.cells())),
  ...PINK.map(cells => new Renban(...cells)),
  ...BLUE.map(cells => new Regex(EVEN_SUM, ...cells)),
  ...PURPLE.map(cells => new Pair(primeKey, 'prime sum', ...cells)),
  ...RED.map(cells => new PairX(antiKropkiKey, 'anti-Kropki', ...cells)),
  ...TURQUOISE.map(cells => sameDifference(cells)),
];
