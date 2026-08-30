// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=QGITpNKexqg
// Source: https://cracking-the-cryptic.web.app/sudoku/q7Q4MgBQ4t

// Stitches. Ten irregular regions tile a 10x10 grid; there are no digits and
// no sudoku rules, so the board is a Raw grid whose values are cell states.
//
// Rules encoded:
//  - Every pair of regions that share at least one edge is joined by exactly
//    one stitch: a horizontal or vertical domino with one cell in each of the
//    two regions. Each of the domino's two cells holds one hole.
//  - A cell holds at most one hole.
//  - The number printed below a column, or to the right of a row, is the
//    number of holes in that column or row.
//
// "Exactly one stitch per neighbouring pair" is fixed by the printed numbers,
// not chosen: the ten column clues total 40 and the ten row clues total 40, so
// the grid holds 40 holes and therefore 20 stitches, and the ten regions have
// exactly 20 neighbouring pairs (counted from the region map below). Two
// stitches per pair would need 80 holes.

// Cell states. A hole names the neighbour it is stitched to, which is what
// makes a stitch a single domino rather than two independent holes.
const EMPTY = 1;
const UP = 2, DOWN = 3, LEFT = 4, RIGHT = 5;

const shape = new Shape('10x10', '1-5', 'Raw');
const at = (r, c) => makeCellId(r, c);

// The ten drawn regions, one letter per cell, R1 at the top and C1 at the
// left. Transcribed from the region outlines; the letters are labels only.
const REGION_MAP = [
  'ABBCCCDDDD',
  'ABBBBCCDDD',
  'AEEEBBFFFD',
  'AEGHHBFDDD',
  'AEGGHBFDDI',
  'AEJHHHFIDI',
  'AEJJJHFIII',
  'AEEEJHFFFI',
  'JJJJJHHHHI',
  'JJJJHHIIII',
];

// Printed outside numbers: one below each column C1..C10, one to the right of
// each row R1..R10.
const COL_CLUES = [4, 6, 5, 5, 4, 3, 6, 5, 1, 1];
const ROW_CLUES = [6, 2, 7, 5, 4, 6, 2, 2, 3, 3];

const N = 10;
const seq = Array.from({ length: N }, (_, i) => i + 1);
const region = (r, c) => REGION_MAP[r - 1][c - 1];
const inGrid = (r, c) => r >= 1 && r <= N && c >= 1 && c <= N;

// The four possible holes in a cell, with the neighbour each one reaches.
const STEPS = [
  { code: UP, dr: -1, dc: 0 },
  { code: DOWN, dr: 1, dc: 0 },
  { code: LEFT, dr: 0, dc: -1 },
  { code: RIGHT, dr: 0, dc: 1 },
];

// A hole may only point at an orthogonal neighbour in a different region, so
// each cell's candidates are EMPTY plus its own cross-region directions.
const stepsFrom = (r, c) => STEPS.filter(
  ({ dr, dc }) => inGrid(r + dr, c + dc) && region(r + dr, c + dc) !== region(r, c));
const candidates = (r, c) => [EMPTY, ...stepsFrom(r, c).map(s => s.code)];
const domains = seq.flatMap(r => seq.map(c => new Given(at(r, c), ...candidates(r, c))));

// Every cross-region edge, listed once from its upper/left cell.
const edges = seq.flatMap(r => seq.flatMap(c =>
  stepsFrom(r, c)
    .filter(({ code }) => code === DOWN || code === RIGHT)
    .map(({ code, dr, dc }) => ({
      r, c, code, other: at(r + dr, c + dc),
      pair: [region(r, c), region(r + dr, c + dc)].sort().join(''),
    }))));

// A stitch is one domino, so the two cells agree about it: the left/upper cell
// points right/down exactly when the other cell points back.
const acrossKey = Pair.fnToKey((a, b) => (a === RIGHT) === (b === LEFT), shape);
const downKey = Pair.fnToKey((a, b) => (a === DOWN) === (b === UP), shape);
const agreement = edges.map(e => new Pair(
  e.code === RIGHT ? acrossKey : downKey, 'stitch domino', at(e.r, e.c), e.other));

// One stitch per neighbouring pair: an alternative per candidate edge, which
// pins that edge's upper/left cell to the hole pointing across and removes the
// matching hole from the other candidate edges of the same pair.
const byPair = new Map();
for (const e of edges) {
  if (!byPair.has(e.pair)) byPair.set(e.pair, []);
  byPair.get(e.pair).push(e);
}
const oneStitchPerPair = [...byPair.values()].map(group => new Or(
  group.map(chosen => {
    const doms = new Map(group.map(e => [at(e.r, e.c), new Set(candidates(e.r, e.c))]));
    for (const e of group) {
      if (e !== chosen) doms.get(at(e.r, e.c)).delete(e.code);
    }
    doms.set(at(chosen.r, chosen.c), new Set([chosen.code]));
    return new And([...doms].map(
      ([cell, values]) => new Given(cell, ...[...values].sort((a, b) => a - b))));
  })));

// A clue counts holes, so it fixes how many cells of its line are EMPTY.
const holeCount = (cells, clue) =>
  new ContainExact(Array(N - clue).fill(EMPTY).join('_'), ...cells);
const counts = [
  ...ROW_CLUES.map((clue, i) => holeCount(seq.map(c => at(i + 1, c)), clue)),
  ...COL_CLUES.map((clue, i) => holeCount(seq.map(r => at(r, i + 1)), clue)),
];

return [shape, ...domains, ...agreement, ...oneStitchPerPair, ...counts];
