// Title: Simon's Bowtie
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=0qBQ1EVtOJg
// Source: https://sudokupad.app/3t36tlmwxe

// Normal Sudoku applies. Orthogonally adjacent cells must not sum to 5 or 10.
// Each listed killer cage has distinct digits summing to its drawn total.
// The grey thermometer branches from R6C6 and increases towards both tips.
// The drawn green bowtie's 11 digits have product 600000.
const graph = cellGraph();
const antiFiveOrTen = Pair.fnToKey((a, b) => a + b != 5 && a + b != 10, 9);
const horizontalOrigins = graph.cells().filter(cell => graph.block(cell, 1, 2));
const verticalOrigins = graph.cells().filter(cell => graph.block(cell, 2, 1));

// Product state records the factor accumulated from the green bowtie so far.
// A transition that cannot still divide 600000 is rejected immediately.
const bowtieProduct = NFA.encodeSpec({
  startState: { product: 1 },
  transition: ({ product }, value) => {
    const next = product * value;
    return 600000 % next === 0 ? { product: next } : undefined;
  },
  accept: ({ product }) => product === 600000,
}, 9);

return [
  new Shape('9x9'),
  // Replicate the two-cell anti-sum rule over every horizontal and vertical edge.
  graph.makeReplicate(
    new Pair(antiFiveOrTen, 'anti-5-or-10', 'R1C1', 'R1C2'), horizontalOrigins),
  graph.makeReplicate(
    new Pair(antiFiveOrTen, 'anti-5-or-10', 'R1C1', 'R2C1'), verticalOrigins),
  new Cage(36, 'R3C4', 'R3C5', 'R3C6', 'R4C3', 'R4C4', 'R5C3', 'R6C3'),
  new Cage(27, 'R5C7', 'R6C6', 'R6C7', 'R7C5', 'R7C6'),
  new Cage(38, 'R2C3', 'R2C4', 'R2C5', 'R3C2', 'R3C3', 'R4C2', 'R5C2'),
  new Cage(6, 'R1C9', 'R2C9', 'R3C9'),
  new Thermo('R6C6', 'R5C7', 'R6C7'),
  new Thermo('R6C6', 'R7C5'),
  new NFA(bowtieProduct, 'green bowtie',
    'R6C2', 'R6C3', 'R7C3', 'R5C3', 'R5C4', 'R4C4', 'R4C5', 'R3C5',
    'R3C6', 'R2C6', 'R3C7'),
];
