// Title: A Knight's Christmas Tree
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=gRBjc5YJMvM
// Source: https://app.crackingthecryptic.com/sudoku/3dNFBmgmBp

// Normal sudoku, plus:
// - Identical digits cannot be a chess knight's move apart (AntiKnight).
// - R2C5 is shaded grey: it holds an even digit.
// - The tree shape is tiled by 15 cages, none with a printed total; a killer
//   cage with no total is all-different only, no sum.
// - Two cages sharing an edge, whose (unknown) totals differ by 1, have a
//   white dot on that edge; two whose totals are in a 2:1 ratio have a black
//   dot; every other touching pair of cages is a stated negative -- neither
//   condition holds for their totals. Each such relation is one small NFA
//   that reads cage A's cells then cage B's cells (a SEGMENT_BREAK between
//   the two arrays), carrying cage A's finished sum across the break, and
//   accepts on the final state, once both cage sums are known, iff the
//   predicate holds between them.

// Cage cells, provenance: the drawn (unlabelled) cage outlines tiling the
// tree silhouette. Letters A-O label them for the dot lists below.
const cages = [
  ['R3C4', 'R3C5', 'R3C6'], // A
  ['R4C5', 'R5C5', 'R6C5'], // B
  ['R5C4', 'R6C4'],         // C
  ['R5C6', 'R6C6'],         // D
  ['R6C7', 'R7C7'],         // E
  ['R6C3', 'R7C3'],         // F
  ['R7C4', 'R7C5', 'R7C6'], // G
  ['R7C2', 'R8C2', 'R8C1'], // H
  ['R7C8', 'R8C8', 'R8C9'], // I
  ['R9C1', 'R9C2'],         // J
  ['R9C8', 'R9C9'],         // K
  ['R8C3', 'R9C3'],         // L
  ['R8C7', 'R9C7'],         // M
  ['R9C4', 'R8C4', 'R8C5'], // N
  ['R8C6', 'R9C6', 'R9C5'], // O
];

// Cage-index pairs (0-based, matching `cages` above) that share a grid edge,
// from the drawn dots cross-referenced against cage adjacency (every
// cage-adjacent edge in the tree, whether dotted or not). Pairs sharing more
// than one edge get exactly one drawn dot for the pair, since the relation
// is between cage totals, not individual edges.
const dottedPairs = [
  [0, 1, 'black'], [1, 3, 'white'], [3, 6, 'white'], [4, 6, 'white'],
  [5, 11, 'white'], [6, 13, 'white'], [7, 9, 'white'], [8, 10, 'white'],
  [9, 11, 'black'], [10, 12, 'white'], [11, 13, 'white'], [12, 14, 'white'],
  [13, 14, 'white'],
];
const undottedPairs = [
  [1, 2], [1, 6], [2, 5], [2, 6], [3, 4], [4, 8],
  [4, 12], [5, 6], [5, 7], [6, 14], [7, 11], [8, 12],
];

const diffByOne = (a, b) => Math.abs(a - b) === 1;
const ratioTwoToOne = (a, b) => a === 2 * b || b === 2 * a;
const neitherRelation = (a, b) => !diffByOne(a, b) && !ratioTwoToOne(a, b);

// Builds the NFA for one cage-pair relation: scan cage A, break, scan cage
// B, then test `predicate(sumA, sumB)` on the combined final state.
function cageTotalsRelation(name, cellsA, cellsB, predicate) {
  const spec = NFA.encodeSpec({
    startState: { sumA: 0, sumB: 0, inB: false },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { sumA: state.sumA, sumB: 0, inB: true };
      }
      return state.inB
        ? { sumA: state.sumA, sumB: state.sumB + value, inB: true }
        : { sumA: state.sumA + value, sumB: 0, inB: false };
    },
    accept: ({ sumA, sumB }) => predicate(sumA, sumB),
    // Cells of both cages plus the one SEGMENT_BREAK between them; without
    // this the running sums are treated as unbounded during compilation.
    maxDepth: cellsA.length + cellsB.length + 1,
  }, 9, { multiSegment: true });
  return new NFA(spec, name, cellsA, cellsB);
}

const cageConstraints = cages.map(cells => new AllDifferent(...cells));

const dotConstraints = dottedPairs.map(([i, j, colour]) => cageTotalsRelation(
  colour === 'white' ? 'white dot (totals differ by 1)' : 'black dot (totals 2:1)',
  cages[i], cages[j], colour === 'white' ? diffByOne : ratioTwoToOne));

const negativeConstraints = undottedPairs.map(([i, j]) => cageTotalsRelation(
  'no dot (neither relation holds)', cages[i], cages[j], neitherRelation));

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Given('R2C5', 2, 4, 6, 8),
  ...cageConstraints,
  ...dotConstraints,
  ...negativeConstraints,
];
