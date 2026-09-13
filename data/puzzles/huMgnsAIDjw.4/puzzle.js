// Title: Akari (Light Up)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=huMgnsAIDjw
// Source: http://pzv.jp/p.html?akari/18/10/w6cvbibjbi1.hbcxclcx.hb1.kbj.kcv7bu

// Akari (Light Up) rules: place light bulbs in some of the grid's white
// cells; the black (wall) cells below are fixed and given.
// - A bulb illuminates every white cell in its row and its column, out to
//   the grid edge or the nearest wall in that direction, whichever comes
//   first.
// - No bulb may illuminate another bulb.
// - Every white cell must be illuminated by at least one bulb (a bulb cell
//   illuminates itself).
// - A numbered wall's number gives the exact count of bulbs among its
//   orthogonally adjacent cells; an unnumbered wall carries no such
//   constraint.
//
// ISS caps a single grid or 2D Var group at 16 in either dimension
// (CellGeometry.MAX_SIZE), and this board is 18 columns wide, so it cannot
// be one ISS grid. The whole board is instead one Var group ('VF') declared
// as 160 rows x 1 column -- only the column count is checked against the
// cap, so this stays legal at any row count -- addressed by row index alone
// rather than by (row, col). The main grid is a pinned 1x1 placeholder; the
// answer lives entirely in 'VF', named in the result's solution_group. Both
// flag and "lit" values below live in {1, 2}; since the puzzle's own Shape
// sets numValues to 2, every declared cell -- grid and Var alike -- already
// ranges over exactly {1, 2} with no extra domain restriction needed.

const ROWS = 10, COLS = 18;

// Wall (black) cells, transcribed from the source payload's clue list: value
// is the wall's bulb-count clue (0-4), or null for an unnumbered wall.
const WALLS = new Map([
  [[1, 18], 1], [[2, 2], 2], [[3, 3], 1], [[3, 9], 1], [[3, 16], 1],
  [[4, 4], 1], [[4, 5], null], [[4, 8], 1], [[4, 11], 2], [[5, 14], 2],
  [[6, 5], 2], [[7, 8], null], [[7, 11], 1], [[7, 14], 1], [[7, 15], null],
  [[8, 3], 1], [[8, 10], null], [[8, 16], 2], [[9, 17], 2], [[10, 1], 1],
].map(([[r, c], v]) => [`${r},${c}`, v]));
const isWall = (r, c) => WALLS.has(`${r},${c}`);

// Every non-wall cell is white and gets a bulb flag: 1 = empty, 2 = bulb.
const whiteCells = [];
for (let r = 1; r <= ROWS; r++) {
  for (let c = 1; c <= COLS; c++) {
    if (!isWall(r, c)) whiteCells.push([r, c]);
  }
}

const flagVar = new Var('F', 'bulb flag', `${whiteCells.length}x1`);
const flagIndex = new Map(whiteCells.map(([r, c], i) => [`${r},${c}`, i + 1]));
const flagAt = (r, c) => flagVar.cell(flagIndex.get(`${r},${c}`));

// Split every row and column into its maximal runs of white cells
// ("segments"), cut apart wherever a wall blocks the light.
function segmentsOf(line) {
  const segs = [];
  let run = [];
  for (const [r, c] of line) {
    if (!isWall(r, c)) {
      run.push([r, c]);
    } else if (run.length) {
      segs.push(run);
      run = [];
    }
  }
  if (run.length) segs.push(run);
  return segs;
}

const rowSegments = [];
for (let r = 1; r <= ROWS; r++) {
  rowSegments.push(...segmentsOf(Array.from({ length: COLS }, (_, i) => [r, i + 1])));
}
const colSegments = [];
for (let c = 1; c <= COLS; c++) {
  colSegments.push(...segmentsOf(Array.from({ length: ROWS }, (_, i) => [i + 1, c])));
}
const segments = [...rowSegments, ...colSegments];

// One "lit" flag per segment: 1 = no bulb in it, 2 = exactly one bulb. A
// segment's own flags sum to its length (no bulb) or length + 1 (one bulb),
// and never higher, so the single equation `sum(flags) - lit = length - 1`
// both defines `lit` from the segment's own flags *and* forbids two bulbs
// sharing a segment (a second bulb would force lit = 3, outside its {1, 2}
// domain) -- exactly "no bulb illuminates another bulb", since two bulbs in
// one unbroken run always light each other. A length-1 segment reduces to
// plain equality (lit = its one flag), so that case uses SameValues instead
// of a trivial two-cell coefficient Sum.
const litVar = new Var('S', 'segment lit', segments.length);
const litOf = new Map(); // "r,c" -> [row-segment lit cell, column-segment lit cell]
const segmentTies = segments.map((seg, i) => {
  const lit = litVar.cell(i + 1);
  for (const [r, c] of seg) {
    const key = `${r},${c}`;
    const pair = litOf.get(key) || [];
    pair.push(lit);
    litOf.set(key, pair);
  }
  const flags = seg.map(([r, c]) => flagAt(r, c));
  return flags.length === 1
    ? new SameValues(2, flags[0], lit)
    : new Sum(seg.length - 1, ...flags, [lit, -1]);
});

// Every white cell must be illuminated: its row segment or its column
// segment (or both) holds a bulb. A bulb cell always satisfies this through
// its own segment(s), so no separate "a bulb illuminates itself" case is
// needed.
const illumination = whiteCells.map(([r, c]) => {
  const [rowLit, colLit] = litOf.get(`${r},${c}`);
  return new Or([new Given(rowLit, 2), new Given(colLit, 2)]);
});

// Wall clue counts: the number gives the exact count of bulbs among the
// wall's orthogonal white neighbours. A flag contributes 1 (empty) or 2
// (bulb), so summing `neighbourCount` flags to `neighbourCount + clue`
// pins the bulb count among them to `clue`.
// (Neighbours are computed by hand rather than via cellGraph().neighbours():
// this 18-column board has no real cellGraph, since CellGeometry caps a
// dimension at 16 -- see the header comment.)
const wallClues = [];
for (const [key, clue] of WALLS) {
  if (clue === null) continue;
  const [r, c] = key.split(',').map(Number);
  // lint-ok: custom-neighbour-helper
  const neighbours = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
    .filter(([nr, nc]) => nr >= 1 && nr <= ROWS && nc >= 1 && nc <= COLS && !isWall(nr, nc));
  const flags = neighbours.map(([nr, nc]) => flagAt(nr, nc));
  wallClues.push(new Sum(flags.length + clue, ...flags));
}

return [
  new Shape('1x1', 2),
  new Given('R1C1', 1),
  flagVar,
  litVar,
  ...segmentTies,
  ...illumination,
  ...wallClues,
];
