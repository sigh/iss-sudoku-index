// Title: My Zipper is Broken
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=mdUwtplIyoY
// Source: https://sudokupad.app/zfvmhmn8ev

// Rules encoded:
//   * Normal sudoku rules apply (9x9, standard boxes, no givens).
//   * Broken zippers: on each purple line, take the pairs of cells that are the
//     same distance from the line's central spot (the plum circle drawn on it).
//     No two such pairs have the same sum, and no such sum equals the digit in
//     the central spot.
//   * Digits separated by a white dot are consecutive.
//   * Digits separated by a black dot are in a 1:2 ratio.
// The grey border of the drawing canvas is a note-taking margin outside the
// 9x9 board, so it holds no cells and contributes no constraint.

const shape = new Shape('9x9');

// Purple lines in drawn order, each with the plum circle marking its central
// spot. Every line's circle sits exactly at its midpoint, so both arms have the
// same length.
const zippers = [
  {
    cells: [
      'R7C1', 'R8C2', 'R8C3', 'R8C4', 'R7C3', 'R7C2', 'R6C1', 'R5C1', 'R4C2',
      'R5C2', 'R4C3', 'R5C3', 'R4C4', 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R5C5',
      'R5C4', 'R6C4', 'R6C5', 'R7C6', 'R6C6', 'R5C7', 'R4C7', 'R5C8', 'R4C8',
      'R5C9', 'R6C9', 'R7C8', 'R7C7', 'R8C6', 'R8C7', 'R8C8', 'R9C9',
    ],
    centre: 'R5C5',
  },
  {
    cells: ['R3C1', 'R2C1', 'R1C1', 'R2C2', 'R1C3', 'R2C3', 'R3C3'],
    centre: 'R2C2',
  },
  {
    cells: ['R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5'],
    centre: 'R1C7',
  },
];

// The cell pairs the rule talks about: one per distance from the central spot,
// walking outwards along the two arms together.
const armPairs = ({ cells, centre }) => {
  const k = cells.indexOf(centre);
  const reach = Math.min(k, cells.length - 1 - k);
  return Array.from(
    { length: reach }, (_, i) => [cells[k - 1 - i], cells[k + 1 + i]]);
};

// Applied to one 4-cell segment [a, b, c, d]: rejects a + b == c + d.
// State {n, v}: n is how many cells of the segment have been read; v holds a,
// then a + b, then a + b - c. On the fourth cell the branch dies if the running
// value has come back to 0, otherwise the state resets for the next segment.
// Segments never interact, so one machine covers every pair of pairs.
const sumsDiffer = NFA.encodeSpec({
  startState: { n: 0, v: 0 },
  transition: ({ n, v }, value) => {
    if (value === SEGMENT_BREAK) return { n: 0, v: 0 };
    if (n === 0) return { n: 1, v: value };
    if (n === 1) return { n: 2, v: v + value };
    if (n === 2) return { n: 3, v: v - value };
    return (v - value === 0) ? undefined : { n: 0, v: 0 };
  },
  accept: ({ n }) => n === 0,
}, shape, { multiSegment: true });

// The same idea over a 3-cell segment [a, b, centre]: rejects a + b == centre.
const sumIsNotCentre = NFA.encodeSpec({
  startState: { n: 0, v: 0 },
  transition: ({ n, v }, value) => {
    if (value === SEGMENT_BREAK) return { n: 0, v: 0 };
    if (n === 0) return { n: 1, v: value };
    if (n === 1) return { n: 2, v: v + value };
    return (v - value === 0) ? undefined : { n: 0, v: 0 };
  },
  accept: ({ n }) => n === 0,
}, shape, { multiSegment: true });

// A direct AllDifferent over the pair sums is not available: the sums run 2-18
// and ISS cells hold at most 16 distinct values, so the sums cannot live in a
// Var layer. The pairwise segments above state the same condition.
const brokenZipper = (zipper) => {
  const pairs = armPairs(zipper);
  const pairsOfPairs = pairs.flatMap(
    (p, i) => pairs.slice(i + 1).map((q) => [...p, ...q]));
  return [
    new NFA(sumsDiffer, 'no-repeated-sum', ...pairsOfPairs),
    new NFA(sumIsNotCentre, 'no-sum-at-centre',
      ...pairs.map((p) => [...p, zipper.centre])),
  ];
};

// Kropki dots, read off the edge circles drawn on the board.
const whiteDots = [
  ['R6C1', 'R6C2'], ['R7C4', 'R8C4'], ['R7C7', 'R7C8'], ['R7C8', 'R7C9'],
  ['R6C7', 'R6C8'], ['R8C2', 'R8C3'], ['R8C8', 'R8C9'], ['R8C8', 'R9C8'],
];
const blackDots = [
  ['R3C6', 'R3C7'], ['R3C8', 'R3C9'], ['R4C9', 'R5C9'], ['R5C2', 'R5C3'],
  ['R6C2', 'R6C3'], ['R6C4', 'R7C4'], ['R8C4', 'R8C5'],
];

return [
  shape,
  ...zippers.flatMap(brokenZipper),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
];
