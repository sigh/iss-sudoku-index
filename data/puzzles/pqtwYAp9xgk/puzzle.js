// Title: Poseidon
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=pqtwYAp9xgk
// Source: https://sudokupad.app/roa3ic53te

// Full encoding. Pure Yin-Yang: no rows/columns/boxes at all, so the main
// grid is Raw. The shading is the YinYang constraint's own YY cell group
// (one lowest value SHADED, the next UNSHADED). The 13 arrow cells hold
// digits 1-9 on the main grid; every other main-grid cell has no digit, so it
// is pinned to a spare BLANK value that no rule ever reads.
//
// Value range 1-10: 1-9 are playable digits, 10 is the BLANK sentinel.
const SHADED = 1;
const UNSHADED = 2;
const BLANK = 10;

const shape = new Shape('10x10', 10, 'Raw');
const graph = cellGraph(shape);
const shade = graph.makeOverlay('YY');

// Arrow clues: host cell (row, col) and the diagonal direction the drawn
// arrow glyph points, transcribed from the 13 small corner arrows. Each
// arrow's own cell is the first cell of its ray.
const arrows = [
  { row: 1, col: 1, dr: 1, dc: 1 },     // down-right
  { row: 1, col: 3, dr: 1, dc: -1 },    // down-left
  { row: 1, col: 10, dr: 1, dc: -1 },   // down-left
  { row: 3, col: 1, dr: -1, dc: 1 },    // up-right
  { row: 3, col: 3, dr: -1, dc: -1 },   // up-left
  { row: 6, col: 4, dr: 1, dc: 1 },     // down-right
  { row: 6, col: 5, dr: 1, dc: -1 },    // down-left
  { row: 6, col: 9, dr: -1, dc: -1 },   // up-left
  { row: 7, col: 5, dr: -1, dc: -1 },   // up-left
  { row: 8, col: 10, dr: 1, dc: -1 },   // down-left
  { row: 10, col: 1, dr: -1, dc: 1 },   // up-right
  { row: 10, col: 8, dr: -1, dc: 1 },   // up-right
  { row: 10, col: 10, dr: -1, dc: -1 }, // up-left
].map(a => ({ ...a, cell: makeCellId(a.row, a.col) }));

const arrowCells = new Set(arrows.map(a => a.cell));
const blankCells = graph.cells().filter(cell => !arrowCells.has(cell));

// Every arrow cell holds a real digit; every other cell is forced to the
// unused BLANK value so it carries no digit and contributes no freedom.
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const digitGivens = arrows.map(a => new Given(a.cell, ...DIGITS));
// makeReplicate() always shifts relative to the graph's own first cell
// (R1C1), so the template must reference that cell even though R1C1 itself
// (an arrow cell) is never one of the blank targets below.
const blankGivens = [
  graph.makeReplicate(new Given(makeCellId(1, 1), BLANK), blankCells),
];

// Each arrow's digit equals the count of shaded cells on its own diagonal
// ray (its own cell included). Writing the ray's shade values as
// SHADED/UNSHADED (not 0/1), a ray of length L with S shaded cells sums to
// S*SHADED + (L-S)*UNSHADED = L*UNSHADED - S. Solving for S = digit gives
// digit + sum(ray shades) = L*UNSHADED, a plain linear Sum with every
// coefficient equal to 1.
const sightlineSums = arrows.map(({ cell, row, col, dr, dc }) => {
  const ray = graph.ray(cell, dr, dc);
  return new Sum(ray.length * UNSHADED, cell, ...shade.at(ray));
});

// No two shaded arrow cells share a digit, and no two unshaded arrow cells
// share a digit (the same digit may appear once in each shade). For every
// pair of arrow cells: either their shades differ, or their digits differ.
const neqKey = Pair.fnToKey((a, b) => a !== b, shape);
const noRepeatPerShade = [];
for (let i = 0; i < arrows.length; i++) {
  for (let j = i + 1; j < arrows.length; j++) {
    const a = arrows[i], b = arrows[j];
    noRepeatPerShade.push(new Or([
      new Pair(neqKey, 'different shade', shade.at(a.cell), shade.at(b.cell)),
      new Pair(neqKey, 'different digit', a.cell, b.cell),
    ]));
  }
}

return [
  shape,
  new YinYang(),
  ...digitGivens,
  ...blankGivens,
  ...sightlineSums,
  ...noRepeatPerShade,
];
