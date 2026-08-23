// Title: Pining for the Fjords
// Author: trufflebear
// Video: https://www.youtube.com/watch?v=lpNjWkqywHU
// Source: https://sudokupad.app/6i91d5krhm

// Normal Sudoku. Every cell is LAND or WATER, encoded by the native YinYang
// constraint (terrain = its 'YY' group, LAND/WATER = the grid's two lowest
// values). Exactly one side has a contiguous non-empty mainland connection;
// the other three sides are entirely water.
//
// A cage total is the sum of its land digits minus the sum of its water
// digits, with ordinary digit distinctness inside each cage. Thermometers
// strictly increase from their drawn bulbs; a terrain crossing raises the
// minimum increase from 1 to 2.

const LAND = 1;
const WATER = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const terrain = graph.makeOverlay('YY');

// A mainland side is water* land+ water*. The other three sides are forced
// water in that branch, including the two corners of the mainland side.
const mainlandMachine = NFA.encodeSpec({
  startState: { phase: 'water-before' },
  transition: ({ phase }, flag) => {
    if (phase === 'water-before') {
      return flag === WATER ? { phase } : flag === LAND ? { phase: 'land' } : undefined;
    }
    if (phase === 'land') {
      return flag === LAND ? { phase } : flag === WATER ? { phase: 'water-after' } : undefined;
    }
    return flag === WATER ? { phase } : undefined;
  },
  accept: ({ phase }) => phase === 'land' || phase === 'water-after',
}, geometry.numValues);
const sides = [
  graph.row('R1C1'), graph.column('R1C9'),
  graph.row('R9C1'), graph.column('R1C1'),
];
const mainland = new Or(sides.map((side, chosen) => {
  const otherSides = sides.filter((_, index) => index !== chosen).flat();
  return new And([
    new NFA(mainlandMachine, 'mainland', ...terrain.at(side)),
    ...terrain.at(otherSides).map(cell => new Given(cell, WATER)),
  ]);
}));

// Hand-transcribed from the dotted cages and their printed totals.
const cages = [
  { total: 5, cells: ['R8C1', 'R9C1', 'R9C2'] },
  { total: -8, cells: ['R2C8', 'R3C7', 'R3C8'] },
  { total: 14, cells: ['R2C5', 'R2C6', 'R2C7'] },
  { total: -20, cells: ['R8C4', 'R8C5', 'R9C4', 'R9C5'] },
  { total: -23, cells: ['R8C7', 'R8C8', 'R9C7', 'R9C8'] },
  { total: -20, cells: ['R4C6', 'R4C7', 'R5C6', 'R5C7'] },
  { total: -2, cells: ['R6C4', 'R7C3', 'R7C4'] },
  { total: -2, cells: ['R6C7', 'R7C7'] },
  { total: 18, cells: ['R2C4', 'R3C2', 'R3C3', 'R3C4'] },
  { total: -13, cells: ['R4C2', 'R4C3', 'R5C2', 'R5C3'] },
  { total: 2, cells: ['R5C4', 'R5C5'] },
];
function signedCage({ total, cells }) {
  // The NFA alternates a cage digit with its terrain flag and carries only the
  // signed running total, so LAND adds that digit and WATER subtracts it.
  const machine = NFA.encodeSpec({
    startState: { sum: 0, digit: null },
    transition: ({ sum, digit }, value) => {
      if (digit === null) return { sum, digit: value };
      if (value !== LAND && value !== WATER) return undefined;
      return {
        sum: sum + (value === LAND ? digit : -digit),
        digit: null,
      };
    },
    accept: ({ sum, digit }) => digit === null && sum === total,
    maxDepth: cells.length * 2,
  }, geometry.numValues);
  return [
    new AllDifferent(...cells),
    new NFA(machine, `signed cage ${total}`,
      ...cells.flatMap(cell => [cell, terrain.at(cell)])),
  ];
}
const cageRules = cages.flatMap(signedCage);

// Hand-transcribed pale-blue thermometer paths, bulb first.
const thermometers = [
  ['R2C5', 'R1C5', 'R1C6', 'R2C7', 'R2C6', 'R3C5'],
  ['R9C1', 'R8C2', 'R7C2', 'R6C2', 'R5C1'],
  ['R4C8', 'R4C7', 'R4C6', 'R5C7', 'R5C6'],
  ['R7C6', 'R6C5', 'R5C5', 'R4C4'],
  ['R9C6', 'R8C5', 'R7C5'],
];
const crossingMachine = NFA.encodeSpec({
  // This four-symbol NFA reads terrain, digit, terrain, digit for one thermo
  // edge; its final comparison applies the stated larger crossing increase.
  startState: { step: 0 },
  transition: (state, value) => {
    if (state.step === 0) return { step: 1, firstTerrain: value };
    if (state.step === 1) return { ...state, step: 2, firstDigit: value };
    if (state.step === 2) return { ...state, step: 3, secondTerrain: value };
    const minimum = state.firstTerrain === state.secondTerrain ? 1 : 2;
    return value - state.firstDigit >= minimum ? { step: 4 } : undefined;
  },
  accept: ({ step }) => step === 4,
}, geometry.numValues);
const crossingRules = thermometers.flatMap(cells => cells.slice(1).map((cell, i) =>
  new NFA(crossingMachine, 'thermo-crossing',
    terrain.at(cells[i]), cells[i], terrain.at(cell), cell)));

return [
  new Shape('9x9'),
  new YinYang(),
  mainland,
  ...cageRules,
  ...thermometers.map(cells => new Thermo(...cells)),
  ...crossingRules,
];
