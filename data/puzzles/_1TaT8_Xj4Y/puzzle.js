// Title: BIGITs
// Author: sunnyjum
// Video: https://www.youtube.com/watch?v=_1TaT8_Xj4Y
// Source: https://sudokupad.app/9ign5knige

// Each upright seven-segment digit occupies vertices of a 3x2 cell block.
// Candidate BIGITs are derived from the 17 drawn seed edges. The exact-cover
// search below selects non-overlapping candidates that cover every seed and
// include every depicted digit 1-9 at least once.

const digitSegments = {
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
};

const seeds = [
  ['yellow', 'R1C4', 'R2C4'],
  ['yellow', 'R2C3', 'R3C3'],
  ['yellow', 'R2C4', 'R3C4'],
  ['yellow', 'R4C5', 'R5C5'],
  ['purple', 'R1C5', 'R2C5'],
  ['purple', 'R4C6', 'R5C6'],
  ['purple', 'R5C3', 'R6C3'],
  ['purple', 'R6C3', 'R6C4'],
  ['purple', 'R7C7', 'R8C7'],
  ['red', 'R1C8', 'R2C8'],
  ['red', 'R6C5', 'R6C6'],
  ['red', 'R6C8', 'R7C8'],
  ['red', 'R7C3', 'R8C3'],
  ['red', 'R9C4', 'R9C5'],
  ['green', 'R3C7', 'R3C8'],
  ['green', 'R7C1', 'R7C2'],
  ['blue', 'R2C1', 'R2C2'],
].map(([color, a, b], index) => ({color, a, b, index}));

const edgeKey = (a, b) => [a, b].sort().join('-');
const seedByEdge = new Map(seeds.map(seed => [edgeKey(seed.a, seed.b), seed]));

const makeCandidate = (digit, row, col) => {
  const tl = makeCellId(row, col);
  const tr = makeCellId(row, col + 1);
  const ml = makeCellId(row + 1, col);
  const mr = makeCellId(row + 1, col + 1);
  const bl = makeCellId(row + 2, col);
  const br = makeCellId(row + 2, col + 1);
  const allEdges = {
    a: [tl, tr], b: [tr, mr], c: [mr, br], d: [bl, br],
    e: [ml, bl], f: [tl, ml], g: [ml, mr],
  };
  const edges = [...digitSegments[digit]].map(name => allEdges[name]);
  const covered = edges
    .map(([a, b]) => seedByEdge.get(edgeKey(a, b)))
    .filter(Boolean);
  if (!covered.length || covered.some(seed => seed.color !== covered[0].color)) {
    return null;
  }
  return {
    digit,
    color: covered[0].color,
    edges,
    cells: [...new Set(edges.flat())],
    covered: covered.map(seed => seed.index),
  };
};

const candidates = [];
for (let digit = 1; digit <= 9; digit++) {
  for (let row = 1; row <= 7; row++) {
    for (let col = 1; col <= 8; col++) {
      const candidate = makeCandidate(digit, row, col);
      if (candidate) candidates.push(candidate);
    }
  }
}

const bySeed = seeds.map(seed =>
  candidates.filter(candidate => candidate.covered.includes(seed.index)));
const layouts = [];

const findLayouts = (coveredMask, usedCells, digitMask, selected) => {
  if (coveredMask === (1 << seeds.length) - 1) {
    if (digitMask === (1 << 9) - 1) layouts.push([...selected]);
    return;
  }
  const uncovered = seeds.find(seed => !(coveredMask & (1 << seed.index)));
  for (const candidate of bySeed[uncovered.index]) {
    if (candidate.covered.some(index => coveredMask & (1 << index))) continue;
    if (candidate.cells.some(cell => usedCells.has(cell))) continue;
    const nextCells = new Set(usedCells);
    candidate.cells.forEach(cell => nextCells.add(cell));
    const nextCovered = candidate.covered.reduce(
      (mask, index) => mask | (1 << index), coveredMask);
    findLayouts(
      nextCovered,
      nextCells,
      digitMask | (1 << (candidate.digit - 1)),
      [...selected, candidate],
    );
  }
};

findLayouts(0, new Set(), 0, []);
if (!layouts.length) throw new Error('No BIGIT layouts satisfy the drawn seeds.');

const parityKey = Pair.fnToKey((a, b) => (a + b) % 2 === 1, 9);
const exactDifferenceKeys = Array.from(
  {length: 9},
  (_, difference) => Pair.fnToKey(
    (a, b) => Math.abs(a - b) === difference,
    9,
  ),
);

const candidateConstraints = candidate => {
  const containsDigit = new ContainAtLeast(String(candidate.digit), ...candidate.cells);
  if (candidate.color === 'purple') {
    return [containsDigit, new Renban(...candidate.cells)];
  }
  if (candidate.color === 'red') {
    return [
      containsDigit,
      ...candidate.edges.map(([a, b]) => new Pair(parityKey, 'red parity', a, b)),
    ];
  }
  if (candidate.color === 'green' || candidate.color === 'blue') {
    const minimum = candidate.color === 'green' ? 5 : 4;
    return [
      containsDigit,
      ...candidate.edges.map(([a, b]) => new Whisper(minimum, a, b)),
    ];
  }
  // Orthogonally adjacent Sudoku cells cannot be equal, so the common yellow
  // difference ranges from 1 through 8.
  const differenceChoices = Array.from({length: 8}, (_, index) => {
    const difference = index + 1;
    return new And(candidate.edges.map(([a, b]) => difference === 1
      ? new WhiteDot(a, b)
      : new Pair(
        exactDifferenceKeys[difference],
        `yellow difference ${difference}`,
        a,
        b,
      )));
  });
  return [containsDigit, new Or(differenceChoices)];
};

const layoutChoices = layouts.map(layout =>
  new And(layout.flatMap(candidateConstraints)));

return [
  new Shape('9x9'),
  new Or(layoutChoices),
];
