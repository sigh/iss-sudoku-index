// Title: Yin Yang Dominoes
// Author: PuzzleTank
// Video: https://www.youtube.com/watch?v=gqmEL10uFok
// Source: https://sudokupad.app/zh83rmuwoq

// Full encoding. The VS overlay records the two shades. Each two-cell cage's
// shade/order rule also enforces the killer no-repeat rule: one digit is
// strictly larger than the other.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const cages = [
  { total: 7, cells: ['R1C1', 'R2C1'] },
  { cells: ['R1C3', 'R2C3'] },
  { total: 8, cells: ['R3C2', 'R3C3'] },
  { total: 6, cells: ['R2C4', 'R3C4'] },
  { total: 11, cells: ['R2C5', 'R3C5'] },
  { cells: ['R2C8', 'R2C9'] },
  { total: 3, cells: ['R3C7', 'R3C8'] },
  { total: 9, cells: ['R3C9', 'R4C9'] },
  { total: 14, cells: ['R4C7', 'R5C7'] },
  { cells: ['R6C8', 'R7C8'] },
  { cells: ['R8C7', 'R9C7'] },
  { total: 12, cells: ['R6C6', 'R6C7'] },
  { total: 13, cells: ['R6C5', 'R7C5'] },
  { cells: ['R5C4', 'R6C4'] },
  { cells: ['R7C3', 'R7C4'] },
  { total: 16, cells: ['R8C4', 'R9C4'] },
  { total: 3, cells: ['R5C3', 'R6C3'] },
  { total: 14, cells: ['R4C2', 'R4C3'] },
  { total: 5, cells: ['R4C5', 'R4C6'] },
  { total: 14, cells: ['R6C1', 'R6C2'] },
  { cells: ['R7C2', 'R8C2'] },
];

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may have only one shade.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// The larger cage digit is shaded and the smaller one is unshaded. Since each
// cage has two cells, these two branches also give it one cell of each shade.
function cageShadeRule([a, b]) {
  return new Or([
    new And([
      new Given(shade.at(a), SHADED),
      new Given(shade.at(b), UNSHADED),
      new GreaterThan(a, b),
    ]),
    new And([
      new Given(shade.at(a), UNSHADED),
      new Given(shade.at(b), SHADED),
      new GreaterThan(b, a),
    ]),
  ]);
}

const cageRules = cages.flatMap(({ total, cells }) => [
  ...(total === undefined ? [] : [new Cage(total, ...cells)]),
  cageShadeRule(cells),
]);

const givenCells = ['R2C2', 'R7C6', 'R7C9'];

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new Given('R2C2', 4),
  new Given('R7C6', 1),
  new Given('R7C9', 9),
  // Each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...cageRules,
  // The three given digits have one common shade.
  new SameValues(givenCells.length, ...shade.at(givenCells)),
  new BlackDot('R8C8', 'R9C8'),
];
