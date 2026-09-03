// Title: Kropki Cages
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=gXJ2MfLmftk
// Source: https://app.crackingthecryptic.com/sudoku/n7PPHLg8pT

// Rules encoded, one clause per sentence of the puzzle's rules text:
//  - Normal sudoku rules apply: the default 9x9 Shape's rows, columns and
//    boxes.
//  - Digits do not repeat in cages: one totalless Cage per drawn cage. The
//    grid has no given digits and no cage carries a printed total, so every
//    cage total is a quantity the solver has to work out.
//  - Adjacent cages share at least one edge: this defines which cage pairs the
//    dot rules speak about. Two cages are adjacent iff some cell of one is
//    orthogonally adjacent to a cell of the other, so cages meeting only at a
//    corner, or separated by a cell in no cage, are not adjacent. The 33
//    adjacent pairs are derived below from the drawn cages, not listed by hand.
//  - White dot between two adjacent cages: their totals are consecutive.
//  - Black dot between two adjacent cages: their totals are in a 1:2 ratio.
//  - Both dot rules are stated as "if the totals are <related> there IS a dot",
//    so they are exhaustive: an adjacent cage pair with no dot drawn between
//    it has totals that are neither consecutive nor in a 1:2 ratio. That
//    negative half is encoded for all 14 dotless adjacent pairs.
//
// Nothing is omitted. One entailment is used to keep the encoding small: under
// the exhaustive reading a white-dotted pair must also fail the 1:2 test and a
// black-dotted pair must also fail the consecutive test. Both relations hold at
// once only for totals 1 and 2, which needs a one-cell cage holding 1 next to a
// cage totalling 2; the only one-cell cages are R4C5 and R4C8, and every cage
// adjacent to either has at least two cells, so with the no-repeat rule its
// total is at least 3. Those cross-checks therefore follow from the constraints
// below and are not restated.

const graph = cellGraph('9x9');

// The 22 drawn cages, transcribed from the source's cage outlines; letters are
// the labels used in the description. Two of them are single cells (J, P):
// real cages for the dot rules, but no Cage constraint is emitted for them
// since "digits do not repeat" says nothing about a lone cell.
const cages = [
  ['R1C1', 'R1C2', 'R2C1'],                    // A
  ['R2C2', 'R3C2'],                            // B
  ['R3C1', 'R4C1', 'R4C2', 'R5C2', 'R5C3'],    // C
  ['R1C3', 'R2C3', 'R3C3'],                    // D
  ['R1C4', 'R1C5'],                            // E
  ['R2C5', 'R3C4', 'R3C5'],                    // F
  ['R3C6', 'R4C6', 'R4C7'],                    // G
  ['R3C7', 'R3C8'],                            // H
  ['R1C8', 'R2C8', 'R2C9'],                    // I
  ['R4C8'],                                    // J
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],            // K
  ['R6C7', 'R7C7', 'R8C7'],                    // L
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],            // M
  ['R7C6', 'R8C6'],                            // N
  ['R5C5', 'R5C6', 'R6C4', 'R6C5'],            // O
  ['R4C5'],                                    // P
  ['R6C1', 'R6C2'],                            // Q
  ['R7C2', 'R8C1', 'R8C2'],                    // R
  ['R7C3', 'R8C3'],                            // S
  ['R7C4', 'R7C5', 'R8C4'],                    // T
  ['R9C4', 'R9C5'],                            // U
  ['R9C1', 'R9C2', 'R9C3'],                    // V
];

// The 19 drawn dots, each transcribed as its colour and the cell edge it
// straddles. A dot constrains the two cage totals, not the two digits it sits
// between, so only the pair of cages it separates matters below.
const dots = [
  ['white', 'R1C3', 'R1C4'],
  ['white', 'R2C1', 'R3C1'],
  ['white', 'R3C1', 'R3C2'],
  ['white', 'R4C5', 'R5C5'],
  ['white', 'R4C5', 'R4C6'],
  ['white', 'R3C8', 'R4C8'],
  ['white', 'R6C4', 'R7C4'],
  ['white', 'R7C3', 'R7C4'],
  ['white', 'R7C2', 'R7C3'],
  ['white', 'R6C2', 'R7C2'],
  ['white', 'R5C2', 'R6C2'],
  ['white', 'R8C2', 'R9C2'],
  ['white', 'R9C5', 'R9C6'],
  ['white', 'R8C6', 'R9C6'],
  ['black', 'R7C6', 'R7C7'],
  ['black', 'R6C7', 'R6C8'],
  ['black', 'R4C8', 'R5C8'],
  ['black', 'R3C5', 'R3C6'],
  ['black', 'R1C5', 'R2C5'],
];

const cageOfCell = new Map(
  cages.flatMap((cells, i) => cells.map(cell => [cell, i])));
const pairKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

// Cage adjacency, read off the drawn cages: every orthogonal cell edge whose
// two sides lie in different cages makes those cages adjacent.
const adjacentCagePairs = new Map();
for (const cell of graph.cells()) {
  const a = cageOfCell.get(cell);
  if (a === undefined) continue;
  for (const neighbour of graph.neighbours(cell)) {
    const b = cageOfCell.get(neighbour);
    if (b === undefined || b === a) continue;
    adjacentCagePairs.set(pairKey(a, b), [Math.min(a, b), Math.max(a, b)]);
  }
}

const dotColourOfPair = new Map(dots.map(
  ([colour, cellA, cellB]) =>
    [pairKey(cageOfCell.get(cellA), cageOfCell.get(cellB)), colour]));

// sum(cellsA) - sum(cellsB) == difference, as a coefficient Sum.
const totalDifference = (cellsA, cellsB, difference) =>
  new Sum(difference, ...cellsA, ...cellsB.map(cell => [cell, -1]));

// coeffA * sum(cellsA) + coeffB * sum(cellsB) == 0, as a coefficient Sum.
const totalCombinationIsZero = (cellsA, cellsB, coeffA, coeffB) =>
  new Sum(0, ...cellsA.map(cell => [cell, coeffA]),
    ...cellsB.map(cell => [cell, coeffB]));

// "coeffA * sum(cellsA) + coeffB * sum(cellsB) is none of `forbidden`", which
// no sum-style class states directly (Sum fixes a total, it cannot exclude
// one). The machine reads cage A's cells as its first segment and cage B's as
// its second, and carries only the running value of the combination -- not the
// two totals separately -- so its state count stays linear in the range that
// combination can reach. `maxDepth` bounds state creation: a running total is
// unbounded over inputs of unrestricted length, and the bound counts the one
// SEGMENT_BREAK alongside the cells.
const forbidTotalCombination = (name, cellsA, cellsB, coeffA, coeffB, forbidden) =>
  new NFA(
    NFA.encodeSpec({
      startState: { phase: 'A', value: 0 },
      transition: (state, value) => {
        if (value === SEGMENT_BREAK) return { phase: 'B', value: state.value };
        const coeff = state.phase === 'A' ? coeffA : coeffB;
        return { phase: state.phase, value: state.value + coeff * value };
      },
      accept: (state) =>
        state.phase === 'B' && !forbidden.includes(state.value),
      maxDepth: cellsA.length + cellsB.length + 1,
    }, 9, { multiSegment: true }),
    name, cellsA, cellsB);

const dotConstraints = [...adjacentCagePairs.values()].flatMap(([a, b]) => {
  const cellsA = cages[a];
  const cellsB = cages[b];
  switch (dotColourOfPair.get(pairKey(a, b))) {
    case 'white':
      return [new Or([
        totalDifference(cellsA, cellsB, 1),
        totalDifference(cellsA, cellsB, -1),
      ])];
    case 'black':
      return [new Or([
        totalCombinationIsZero(cellsA, cellsB, 1, -2),
        totalCombinationIsZero(cellsA, cellsB, 2, -1),
      ])];
    default:
      // No dot: the totals are neither consecutive nor in a 1:2 ratio.
      return [
        forbidTotalCombination(
          `not-consecutive-${a}-${b}`, cellsA, cellsB, 1, -1, [1, -1]),
        forbidTotalCombination(
          `not-double-${a}-${b}`, cellsA, cellsB, 1, -2, [0]),
        forbidTotalCombination(
          `not-half-${a}-${b}`, cellsA, cellsB, 2, -1, [0]),
      ];
  }
});

return [
  new Shape('9x9'),
  ...cages.filter(cells => cells.length > 1).map(cells => new Cage(0, ...cells)),
  ...dotConstraints,
];
