// Title: Ain't
// Author: SST
// Video: https://www.youtube.com/watch?v=lRoIHses5nM
// Source: https://sudokupad.app/3epc5l6pyv

// Chaos Construction: the solver deduces six connected 6-cell regions, each
// containing 1-6 once. ChaosConstruction's default region size equals the
// grid's value count (6), so no explicit RegionSize is needed; NoBoxes turns
// off the default 6x6 box regions that would otherwise also apply.
//
// No region may contain a 2x2 block of cells: for every 2x2 block of grid
// cells, their region labels must not all be equal. One small NFA rejects
// "all four equal" over the up-to-6-value chaos region domain, replicated
// onto every block origin.
//
// Spotlight cells ("S" badge): a spotlight cell's digit equals how many of
// its orthogonal neighbours share its own region. ChaosCount's control cell
// is the spotlight cell itself, with the spotlight cell also given as the
// first (reference) region cell; offset 1 excludes that reference's trivial
// self-match from the displayed count, leaving just the matching neighbours.
//
// Kropki dots: only the drawn pairs are constrained; the rules do not state a
// negative constraint for unmarked pairs, so WhiteDot/BlackDot (not the
// Strict variants) are used. Dot cells and colours were confirmed against the
// known solution (e.g. R1C3=2, R2C3=4 for the black dot; R3C1=3, R3C2=4 for
// the white dot).
//
// Row Diversity: the "2" beside a row means exactly 2 distinct regions touch
// that row. The raw overlay centre is [1.5, -0.167] (0-indexed, row-first):
// row 1.5 is the vertical centre of the row-index-1 band, i.e. R2 -- the same
// [row, col] reading independently confirmed by all six Kropki dots against
// the known solution. So the clue sits beside R2, not the top row. An aux
// Var holds the constant 2 and CountDistinct ties it to R2's row of
// chaos-region cells.

const graph = cellGraph('6x6');
const cc = graph.makeOverlay('CC');

const S_CELLS = ['R2C2', 'R1C3', 'R3C1', 'R6C3', 'R3C6', 'R6C6'];
const spotlights = S_CELLS.map(cell => new ChaosCount(
  cell, 1, cc.at(cell), ...graph.neighbours(cell).map(n => cc.at(n))));

const WHITE_DOTS = [['R3C1', 'R3C2'], ['R3C5', 'R3C6'], ['R3C2', 'R4C2']];
const BLACK_DOTS = [['R1C3', 'R2C3'], ['R5C3', 'R6C3'], ['R2C3', 'R2C4']];
const dots = [
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];

// "Not all four equal" over the chaos-region domain (values 1-6), replicated
// onto every 2x2 block origin.
const notAllEqualSpec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 6);
const originCell = graph.cells()[0];
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noMonoRegion2x2 = cc.makeReplicate(
  [new NFA(notAllEqualSpec, 'no-region-2x2',
    ...graph.block(originCell, 2, 2).map(c => cc.at(c)))],
  blockOrigins.map(c => cc.at(c)));

// Row Diversity: the constant "2" beside R2.
const rowDiversity = new Var('RD', 'row 2 region diversity', 1);
const rowDiversityRules = [
  rowDiversity,
  new Given(rowDiversity.cell(1), 2),
  new CountDistinct(rowDiversity.cell(1), ...cc.row(cc.at('R2C1'))),
];

return [
  new Shape('6x6'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...spotlights,
  ...dots,
  noMonoRegion2x2,
  ...rowDiversityRules,
];
