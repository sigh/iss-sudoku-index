// Title: Tango
// Author: Bartok_the_Magnificent
// Video: https://www.youtube.com/watch?v=cZjpWVk2dhU
// Source: https://sudokupad.app/nuoopvuie9

// Yellow/shaded cells have shade value 1; blue/unshaded cells have value 2.
// NFAs enforce the colour balance/run rules and the signed cage arithmetic.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('6x6');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// Every six-cell row or column has three cells of each colour, with no run of
// three equal colours.
const balancedLineMachine = NFA.encodeSpec({
  startState: { shaded: 0, previous: null, run: 0 },
  transition: ({ shaded, previous, run }, value) => {
    if (value !== SHADED && value !== UNSHADED) return undefined;
    const nextRun = value === previous ? run + 1 : 1;
    if (nextRun > 2) return undefined;
    return {
      shaded: shaded + (value === SHADED ? 1 : 0),
      previous: value,
      run: nextRun,
    };
  },
  accept: ({ shaded }) => shaded === 3,
  maxDepth: 6,
}, 6);

const shadeLines = [
  ...Array.from({ length: 6 }, (_, i) => graph.row(gridCells[i * 6])),
  ...Array.from({ length: 6 }, (_, i) => graph.column(gridCells[i])),
].map(cells => new NFA(
  balancedLineMachine, 'three of each, no three consecutive',
  ...shade.at(cells)));

const blackDots = [
  ['R1C2', 'R2C2'],
  ['R1C6', 'R2C6'],
  ['R6C3', 'R6C4'],
];
const whiteDots = [
  ['R3C2', 'R3C3'],
  ['R5C1', 'R6C1'],
];

const blackDotRules = blackDots.flatMap(([a, b]) => [
  new BlackDot(a, b),
  new AllDifferent(...shade.at([a, b])),
]);
const whiteDotRules = whiteDots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new SameValues(2, ...shade.at([a, b])),
]);

const cages = [
  { total: -6, cells: ['R1C4', 'R2C4'] },
  { total: 6, cells: ['R4C2', 'R4C3', 'R5C3'] },
  { total: 10, cells: ['R4C5', 'R4C6'] },
  { total: 9, cells: ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3'] },
  { total: 1, cells: ['R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'] },
  { total: -5, cells: ['R2C5', 'R2C6'] },
];

function signedCage({ total, cells }) {
  const machine = NFA.encodeSpec({
    startState: { sum: 0, digit: null },
    transition: ({ sum, digit }, value) => {
      if (digit === null) return { sum, digit: value };
      if (value !== SHADED && value !== UNSHADED) return undefined;
      return {
        sum: sum + (value === SHADED ? -digit : digit),
        digit: null,
      };
    },
    accept: ({ sum, digit }) => digit === null && sum === total,
    maxDepth: cells.length * 2,
  }, 6);
  const digitShadeStream = cells.flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(machine, `signed cage ${total}`, ...digitShadeStream);
}

return [
  new Shape('6x6'),
  shade.toVar('shade'),
  shadeDomain,
  ...shadeLines,
  ...blackDotRules,
  ...whiteDotRules,
  ...cages.map(signedCage),
];
