// Title: Difference Of Opinion
// Author: Alchemist
// Video: https://www.youtube.com/watch?v=n0u4ShNakCI
// Source: https://sudokupad.app/jgpch3g0b5

// Difference-meters (purple lines): the *unsigned differences* between
// consecutive directly-connected digits must strictly increase from bulb to
// tip. Digits may repeat on the line (no separate all-different rule for the
// line itself). Cell order below starts at the bulb (marked with a filled
// circle in the drawing) and runs to the tip.
const differenceMeters = [
  ['R2C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R8C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R6C9', 'R5C8', 'R5C7', 'R5C6'],
  ['R9C4', 'R9C3', 'R9C2', 'R8C2', 'R7C1', 'R6C2', 'R6C3'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C8', 'R3C9', 'R4C8', 'R4C7'],
  ['R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'],
];

// NFA: track the last digit and the last consecutive-pair difference seen.
// Accept a new digit only if its (unsigned) difference from the previous
// digit is strictly greater than the previous difference. lastDiff starts at
// -1 so the first difference (>= 0) is always accepted.
const diffMeterSpec = {
  startState: { lastVal: null, lastDiff: -1 },
  transition: ({ lastVal, lastDiff }, value) => {
    if (lastVal === null) return { lastVal: value, lastDiff };
    const diff = Math.abs(value - lastVal);
    if (diff > lastDiff) return { lastVal: value, lastDiff: diff };
  },
  accept: () => true,
};
const diffMeterNFA = NFA.encodeSpec(diffMeterSpec, /* numValues= */ 9);

// Inequalities (given directly by the drawn arrows, pointing to the smaller
// digit): R2C1 > R3C1 and R7C9 > R8C9.
const greaterThanPairs = [
  ['R2C1', 'R3C1'],
  ['R7C9', 'R8C9'],
];

return [
  new Shape('9x9'),

  ...differenceMeters.map(cells => new NFA(diffMeterNFA, 'DifferenceMeter', ...cells)),

  ...greaterThanPairs.map(cells => new GreaterThan(...cells)),
];
