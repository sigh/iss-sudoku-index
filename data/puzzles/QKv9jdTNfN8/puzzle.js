// Title: Long Multiplication
// Author: basilicon
// Video: https://www.youtube.com/watch?v=QKv9jdTNfN8
// Source: https://sudokupad.app/1emqz1uqso

// Regions are nine connected nine-cell sets, with distinct digits in each.
// One multiplier lies in every row, column and region; their digits are distinct.
// Each cell uses its region multiplier, and thermometer products increase.
const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');
const multipliers = graph.makeOverlay('VM');
const rows = Array.from({length: 9}, (_, i) => i + 1);
const positionVars = new Var('VP', 'Multiplier columns by row', 9);
const positions = positionVars.cells();
const digitVars = new Var('VD', 'Multiplier digits by row', 9);
const digits = digitVars.cells();
const labelVars = new Var('VL', 'Multiplier regions by row', 9);
const labels = labelVars.cells();
// A multiplier is named by its row; its position, digit and region are tied together.
const placements = rows.map(r => new Or(rows.map(c => {
  const cell = makeCellId(r, c);
  return new And([new Given(positions[r-1], c),
    new SameValues(2, digits[r-1], cell),
    new SameValues(2, labels[r-1], cc.at(cell))]);
})));
const regionMultipliers = graph.cells().map(cell => new Or(rows.map(r =>
  new And([new SameValues(2, cc.at(cell), labels[r-1]),
    new SameValues(2, multipliers.at(cell), digits[r-1])])
)));
// Drawn grey thermometer, ordered from the filled bulb at R5C8.
const thermo = ["R5C8", "R4C9", "R5C9", "R6C8", "R7C9", "R8C8", "R7C8", "R7C7", "R6C7", "R5C7", "R4C8", "R3C7", "R4C6", "R5C6", "R5C5", "R5C4", "R6C5", "R7C4", "R8C3", "R8C4", "R9C3", "R8C2", "R9C1", "R8C1", "R7C1", "R6C2", "R5C2", "R5C3", "R4C3", "R3C4", "R2C4", "R3C5", "R2C6", "R1C7", "R1C8", "R2C9"];
// Four phases read digit, multiplier, next digit, next multiplier;
// the carried product is compared only when the second product is complete.
const increasingProduct = NFA.encodeSpec({
  startState: {phase: 0},
  transition(s, v) {
    if (s.phase === 0) return {phase: 1, digit: v};
    if (s.phase === 1) return {phase: 2, product: s.digit * v};
    if (s.phase === 2) return {phase: 3, product: s.product, digit: v};
    if (s.phase === 3 && s.product < s.digit * v) return {phase: 4};
    return undefined;
  },
  accept: s => s.phase === 4,
  maxDepth: 4,
}, shape);
const temperature = thermo.slice(1).map((b, i) => {
  const a = thermo[i];
  return new NFA(increasingProduct, 'Increasing products',
    a, multipliers.at(a), b, multipliers.at(b));
});
return [shape, new NoBoxes(), new ChaosConstruction(),
  positionVars, digitVars, labelVars,
  multipliers.toVar('Region multiplier digit'),
  new AllDifferent(...positions), new AllDifferent(...digits),
  new AllDifferent(...labels), ...placements, ...regionMultipliers,
  ...temperature];
