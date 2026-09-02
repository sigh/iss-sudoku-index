// Title: Ominoes
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=biGJlAfI0DE
// Source: https://app.crackingthecryptic.com/sudoku/JGPFmGQqMT

// Rules encoded, in full:
//  - Normal sudoku.
//  - Every cell belongs to an omino. The ominoes are all 12 pentominoes, all 5
//    tetrominoes and the monomino, each used exactly once and not overlapping;
//    12*5 + 5*4 + 1 = 81, so they tile the grid. "All 12 different" /
//    "all 5 different" is the free-polyomino catalogue: rotations and
//    reflections of a shape are the same piece.
//  - Digits do not repeat within an omino.
//  - Each omino's digit sum is divisible by its number of cells.
//  - Each 1-cell cage clue sits on the leftmost cell of the top row of an
//    omino and gives that omino's sum.
//  - The digits on a grey line are consecutive digits in any order.
//  - No grey line is split between two ominoes.
// Nothing is omitted.

const graph = cellGraph('9x9');

// --- Drawn geometry ------------------------------------------------------

// The 11 single-cell cage clues, [row, col, total], from the payload's cages.
const CLUES = [
  [1, 7, 30], [1, 8, 25], [3, 5, 25], [4, 2, 20], [4, 6, 12], [5, 8, 30],
  [5, 9, 25], [6, 4, 20], [7, 1, 20], [7, 6, 30], [9, 2, 20],
];

// The 12 drawn grey lines, in waypoint order. Both line rules read a line as a
// set, so the order and the diagonal steps between waypoints carry no meaning.
const LINES = [
  [[1, 1], [1, 2]],
  [[1, 3], [2, 2], [2, 3], [3, 3], [3, 4]],
  [[2, 4], [1, 5], [1, 6]],
  [[2, 8], [3, 7]],
  [[3, 8], [4, 7], [5, 7]],
  [[3, 5], [4, 4], [5, 4]],
  [[5, 2], [5, 3]],
  [[4, 1], [5, 1]],
  [[7, 1], [8, 1]],
  [[6, 5], [7, 5], [8, 5], [8, 6], [9, 6]],
  [[9, 4], [9, 5]],
  [[3, 1], [3, 2]],
];

const cellIds = (rowCols) => rowCols.map(([row, col]) => makeCellId(row, col));
const lineCells = LINES.map(cellIds);
const clueTotals = new Map(
  CLUES.map(([row, col, total]) => [makeCellId(row, col), total]));

// --- The polyomino catalogue ---------------------------------------------

// The rules name the catalogue rather than drawing it, so it is generated:
// every free polyomino of n cells. Offsets are [row, col].
const normalize = (cells) => {
  const minRow = Math.min(...cells.map(([row]) => row));
  const minCol = Math.min(...cells.map(([, col]) => col));
  return cells.map(([row, col]) => [row - minRow, col - minCol])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};
const shapeKey = (cells) => JSON.stringify(normalize(cells));

// The (up to 8) rotations and reflections of a shape. Two shapes are the same
// free polyomino exactly when these sets coincide.
const orientations = (cells) => {
  const found = new Map();
  for (const flipped of [cells, cells.map(([row, col]) => [row, -col])]) {
    let turned = flipped;
    for (let quarter = 0; quarter < 4; quarter++) {
      turned = turned.map(([row, col]) => [col, -row]);
      found.set(shapeKey(turned), normalize(turned));
    }
  }
  return [...found.values()];
};

// Grow the fixed polyominoes one cell at a time, then collapse them into free
// ones by canonical orientation. n = 5 yields the 12 pentominoes, n = 4 the 5
// tetrominoes, n = 1 the monomino.
const freePolyominoes = (n) => {
  let fixed = new Map([[shapeKey([[0, 0]]), [[0, 0]]]]);
  for (let size = 1; size < n; size++) {
    const grown = new Map();
    for (const cells of fixed.values()) {
      for (const [row, col] of cells) {
        for (const [dRow, dCol] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const next = [row + dRow, col + dCol];
          if (cells.some(([r, c]) => r === next[0] && c === next[1])) continue;
          const bigger = [...cells, next];
          grown.set(shapeKey(bigger), normalize(bigger));
        }
      }
    }
    fixed = grown;
  }
  const free = new Map();
  for (const cells of fixed.values()) {
    const canonical = orientations(cells).map(shapeKey).sort()[0];
    if (!free.has(canonical)) free.set(canonical, orientations(cells));
  }
  return [...free.values()];
};

// --- Candidate placements ------------------------------------------------

// Every way one piece can sit on the grid, as a sorted list of cell ids.
const placementsOf = (piece) => {
  const found = new Map();
  for (const form of piece) {
    for (let dRow = 1; dRow <= 9; dRow++) {
      for (let dCol = 1; dCol <= 9; dCol++) {
        const rowCols = form.map(([row, col]) => [row + dRow, col + dCol]);
        if (rowCols.some(([row, col]) => row > 9 || col > 9)) continue;
        const cells = cellIds(rowCols).sort();
        found.set(cells.join('_'), cells);
      }
    }
  }
  return [...found.values()];
};

// A line lies inside one omino, so an omino covers a whole line or none of it.
const splitsALine = (cells) => lineCells.some((line) => {
  const covered = line.filter((cell) => cells.includes(cell)).length;
  return covered > 0 && covered < line.length;
});

// The clued cell is "the leftmost cell of the top row", i.e. the omino's first
// cell in reading order -- which is where the sorted cell ids start.
const IMPOSSIBLE = 'impossible';
const clueOn = (cells) => {
  const clued = cells.filter((cell) => clueTotals.has(cell));
  if (clued.length === 0) return null;
  // Two clues in one omino would both have to be its first cell.
  if (clued.length > 1 || clued[0] !== cells[0]) return IMPOSSIBLE;
  return clueTotals.get(clued[0]);
};

// The clue is its omino's whole sum, so it must be divisible by the omino's
// size and reachable by that many distinct digits.
const smallestSum = (size) => size * (size + 1) / 2;
const largestSum = (size) => size * (19 - size) / 2;
const clueFits = (size, clue) => clue % size === 0
  && clue >= smallestSum(size) && clue <= largestSum(size);

// The placements a piece could actually take: one that covered part of a line,
// or a clue anywhere but its first cell, or a clue its digits could not make,
// would break a rule wherever the rest of the grid went.
const candidatesFor = (piece) => placementsOf(piece).flatMap((cells) => {
  if (splitsALine(cells)) return [];
  const clue = clueOn(cells);
  if (clue === IMPOSSIBLE) return [];
  if (clue !== null && !clueFits(cells.length, clue)) return [];
  return [{ cells, clue }];
});

// The 18 pieces, in catalogue order: 12 pentominoes, 5 tetrominoes, the
// monomino. Each keeps its own candidate list.
const pieces = [5, 4, 1].flatMap(
  (size) => freePolyominoes(size).map((piece) => ({ size, candidates: candidatesFor(piece) })));

// --- Which placements are used -------------------------------------------

// One flag cell per candidate placement: USED or UNUSED. Coding them as 2 and 1
// (rather than 1 and 0, which is not a grid value) lets a plain Sum count the
// used ones: n flags summing to n + k means exactly k of them are USED. Every
// placement covers at least one cell, so the coverage equations below give each
// flag its two-value domain -- n values of at least 1 totalling n + 1 leaves one
// of them at 2 and the rest at 1.
const UNUSED = 1;
const USED = 2;
const numCandidates = pieces.reduce((total, { candidates }) => total + candidates.length, 0);
const flags = new Var('P', 'placement used', numCandidates);

let nextFlag = 0;
for (const piece of pieces) {
  piece.flags = piece.candidates.map(() => flags.cell(++nextFlag));
}

// Every cell is part of exactly one omino: of the placements that could cover
// it, exactly one is used. This is the tiling clause -- coverage and
// non-overlap -- as one equation per cell.
const coveringFlags = new Map(graph.cells().map((cell) => [cell, []]));
for (const { candidates, flags: pieceFlags } of pieces) {
  candidates.forEach(({ cells }, i) => {
    for (const cell of cells) coveringFlags.get(cell).push(pieceFlags[i]);
  });
}
const coverage = graph.cells().map((cell) => {
  const covering = coveringFlags.get(cell);
  return new Sum(covering.length + 1, ...covering);
});

// Each catalogue piece is used exactly once.
const usedOnce = pieces.map(
  ({ flags: pieceFlags }) => new Sum(pieceFlags.length + 1, ...pieceFlags));

// --- The digits inside an omino ------------------------------------------

// One cell per omino that has a divisibility rule to obey, holding that omino's
// sum divided by its cell count (see the sum equation below), so that "the sum
// is divisible by the number of cells" is one linear equation rather than a
// list of the permitted totals. A monomino's digit is a multiple of 1 whatever
// it is, so the monomino has no such cell.
const divisible = pieces.filter(({ size }) => size > 1);
const multipliers = new Var('T', 'omino sum / cell count', divisible.length);
divisible.forEach((piece, i) => { piece.multiplier = multipliers.cell(i + 1); });

// A multiplier's range is fixed by its omino's size: the smallest and largest
// sums of that many distinct digits, divided by the size.
const multiplierValues = (size) => {
  const values = [];
  const highest = Math.floor(largestSum(size) / size);
  for (let value = Math.ceil(smallestSum(size) / size); value <= highest; value++) {
    values.push(value);
  }
  return values;
};
const multiplierDomains = divisible.map(
  ({ size, multiplier }) => new Given(multiplier, ...multiplierValues(size)));

// The rules an omino's own cells must obey, but only where it is actually
// placed: unless its flag is UNUSED, its digits are distinct, they sum to a
// multiple of its size, and where its first cell carries a clue that multiple
// is the clue.
const digitRules = divisible.flatMap(({ size, candidates, flags: pieceFlags, multiplier }) =>
  candidates.map(({ cells, clue }, i) => new Or([
    new Given(pieceFlags[i], UNUSED),
    new And([
      new AllDifferent(...cells),
      new Sum(0, ...cells, [multiplier, -size]),
      ...(clue === null ? [] : [new Given(multiplier, clue / size)]),
    ]),
  ])));

return [
  new Shape('9x9'),
  flags,
  multipliers,
  ...multiplierDomains,
  ...coverage,
  ...usedOnce,
  ...digitRules,
  ...lineCells.map((cells) => new Renban(...cells)),
];
