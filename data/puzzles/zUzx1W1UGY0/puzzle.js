// Title: Seven
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=zUzx1W1UGY0
// Source: https://app.crackingthecryptic.com/sudoku/hHRtRmf448

// Rules: normal 6x6 sudoku (rows, columns, regions 1-6 once each), where the
// regions are not given but discovered: each is a set of six orthogonally
// connected cells, and two orthogonally adjacent cells lie in different
// regions if and only if their digits sum to 7. Two thermometers (digits
// strictly increase from the bulb) are drawn on the grid.

const graph = cellGraph('6x6');
const cc = graph.makeOverlay('CC');

// Thermometers, read off the two drawn lines; the other two "lines" entries
// carry no waypoints and render nothing.
const THERMOS = [
  ['R2C4', 'R2C3'],
  ['R3C4', 'R4C4', 'R5C3'],
];

// Region-boundary edge rule, run over every orthogonally adjacent grid-cell
// pair. Reads the interleaved stream [regionA, digitA, regionB, digitB] and
// accepts only when "same region" and "digits sum to 7" are opposite truth
// values, i.e. different region <=> sum-to-7.
const edgeSpec = {
  startState: { stage: 'regionA' },
  transition: ({ stage, ccA, digitA, ccB }, value) => {
    if (stage === 'regionA') return { stage: 'digitA', ccA: value };
    if (stage === 'digitA') return { stage: 'regionB', ccA, digitA: value };
    if (stage === 'regionB') return { stage: 'digitB', ccA, digitA, ccB: value };
    // stage 'digitB': `value` is the second cell's digit.
    const sameRegion = ccA === ccB;
    const sumsToSeven = (digitA + value) === 7;
    if (sameRegion === sumsToSeven) return undefined;  // must be exactly one
    return { stage: 'done' };
  },
  accept: ({ stage }) => stage === 'done',
};
const edgeNFA = NFA.encodeSpec(edgeSpec, 6);

// Every orthogonal grid edge, taken once (right- and down-neighbour only).
const edges = graph.cells().flatMap((cell) => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const pairs = [];
  if (right) pairs.push([cell, right]);
  if (down) pairs.push([cell, down]);
  return pairs;
});

const boundaryEdges = edges.map(([a, b]) =>
  new NFA(edgeNFA, 'regionBoundary', cc.at(a), a, cc.at(b), b));

return [
  new Shape('6x6'),
  new ChaosConstruction(),
  new NoBoxes(),

  ...THERMOS.map((cells) => new Thermo(...cells)),

  ...boundaryEdges,
];
