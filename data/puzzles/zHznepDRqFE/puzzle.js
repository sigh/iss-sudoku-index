// Title: Aim High! (YY)
// Author: SennyK
// Video: https://www.youtube.com/watch?v=zHznepDRqFE
// Source: https://sudokupad.app/5kmcos4nhu

// Normal sudoku rules apply.
//
// Yin-Yang: shade some cells so shaded cells are orthogonally connected,
// unshaded cells are orthogonally connected, and no 2x2 block is entirely
// shaded or entirely unshaded. Encoded as a shade Var overlay plus
// ConnectedValues per shade and a no-mono-2x2 NFA (same pattern as
// xin_yang_v2.js).
//
// Values: an unshaded cell's value equals its own digit; a shaded cell's
// value equals the highest digit among its (up to 4) orthogonal neighbours.
// Encoded as a second Var overlay ("value"), linked to the shade/digit
// layers per cell by an Or of the two cases. The shaded case is checked by a
// small NFA that reads the neighbour digits, tracks their running max, then
// reads the value cell and accepts only if it equals that max.
//
// Killer: cages sum VALUES (not digits) to the given total. The rules text
// states only a sum ("Values in a cage sum to the total given"), with no
// distinctness clause, so cage cells are not constrained to distinct values
// -- a stronger reading would over-constrain the stated rule.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const shade = graph.makeOverlay('VS');
const shadeCell = cell => shade.at(cell);
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(new Given(firstShade, SHADED, UNSHADED));

const value = graph.makeOverlay('VV');
const valueCell = cell => value.at(cell);

// No 2x2 block of the shading may be monochrome.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, v) => {
    if (done === true) return { done: true };
    const next = [...seen, v];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(x => x === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...graph.block(gridCells[0], 2, 2).map(shadeCell)),
  blockOrigins.map(shadeCell));

// A shaded cell's value must equal the max digit among its orthogonal
// neighbours: every neighbour digit <= value, and at least one equals it.
// Reads the K neighbour digits then the value cell; one machine per K
// (corners: 2 neighbours, edges: 3, interior: 4).
const maxScanMachine = k => NFA.encodeSpec({
  startState: { count: 0, max: null, match: false },
  transition: ({ count, max, match }, v) => {
    if (count < k) {
      return { count: count + 1, max: max === null ? v : Math.max(max, v), match };
    }
    if (count === k) {
      return { count: k + 1, max, match: v === max };
    }
    // Saturate: only k+1 symbols are ever actually fed (k neighbours, then
    // the value cell), but the compiler must bound the state for arbitrary
    // input length, so further symbols land on this same sink state.
    return { count: k + 1, max, match };
  },
  accept: ({ count, match }) => count === k + 1 && match === true,
}, geometry.numValues);
const maxMachines = new Map([2, 3, 4].map(k => [k, maxScanMachine(k)]));

// Link each cell's value overlay cell to its digit/shade/neighbours: an
// unshaded cell's value equals its own digit; a shaded cell's value is the
// max of its neighbours' digits.
const valueLinks = gridCells.map(cell => {
  const neighbours = graph.neighbours(cell);
  return new Or([
    new And([
      new Given(shadeCell(cell), UNSHADED),
      new SameValues(2, cell, valueCell(cell)),
    ]),
    new And([
      new Given(shadeCell(cell), SHADED),
      new NFA(maxMachines.get(neighbours.length), 'shaded-value-is-max',
        ...neighbours, valueCell(cell)),
    ]),
  ]);
});

// Killer cages, given as 1-indexed [row, col] pairs and read against the
// value overlay.
const cages = [
  [[[4, 4], [4, 5], [4, 6], [5, 4], [5, 6], [6, 4], [6, 5], [6, 6]], 71],
  [[[5, 3], [6, 3]], 17],
  [[[5, 7], [6, 7]], 18],
  [[[3, 4], [3, 5], [3, 6]], 6],
  [[[7, 4], [7, 5], [7, 6]], 6],
  [[[1, 1], [1, 2], [2, 1], [2, 2]], 35],
  [[[1, 8], [1, 9], [2, 8], [2, 9]], 31],
  [[[8, 8], [8, 9], [9, 8], [9, 9]], 35],
  [[[8, 1], [8, 2], [9, 1], [9, 2]], 31],
  [[[1, 5]], 8],
  [[[9, 5]], 6],
  [[[5, 1]], 3],
  [[[5, 9]], 4],
  [[[5, 2], [6, 1], [6, 2]], 11],
  [[[1, 4], [2, 4]], 15],
  [[[8, 4], [9, 4]], 15],
  [[[9, 6]], 6],
  [[[7, 2]], 7],
  [[[3, 8]], 7],
];
const cageConstraints = cages.map(([cells, total]) => {
  const valueCells = cells.map(([row, col]) => valueCell(makeCellId(row, col)));
  return valueCells.length === 1
    ? new Given(valueCells[0], total)
    : new Sum(total, ...valueCells);
});

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  value.toVar('value'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...valueLinks,
  ...cageConstraints,
];
