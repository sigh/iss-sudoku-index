// Title: Some Balancing Product
// Author: MantaRay
// Video: https://www.youtube.com/watch?v=bVNnSwPxz-8
// Source: https://sudokupad.app/e7ssrztfgn

// Full encoding. The VB cells hold each cage's common sum/product value in
// base 9: value = 9 * (high - 1) + low. This keeps values up to 45 in the
// ordinary 1-9 Var domain while allowing pairwise distinctness.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

const cages = [
  { total: 11, cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'] },
  { total: 12, cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'] },
  { total: 15, cells: ['R8C8', 'R8C9', 'R9C8', 'R9C9'] },
  { total: 15, cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'] },
  { cells: ['R2C6', 'R2C7', 'R3C7', 'R4C6', 'R4C7', 'R4C8', 'R5C8', 'R6C8', 'R7C8'] },
  { cells: ['R6C4', 'R6C5', 'R6C6', 'R7C6', 'R8C5', 'R8C6', 'R9C4', 'R9C5'] },
  { cells: ['R6C2', 'R7C2', 'R7C3', 'R7C4'] },
  { cells: ['R4C3', 'R5C3', 'R6C3'] },
  { cells: ['R3C4', 'R3C5', 'R3C6'] },
  { cells: ['R3C2', 'R4C1', 'R4C2', 'R5C1', 'R5C2'] },
];

const balanceDigits = new Var('B', 'cage balance digits', `${cages.length}x2`);

// Each machine scans [high, low, digit, shade, digit, shade, ...]. Starting a
// remaining quantity at the represented balance lets unshaded digits subtract
// from the sum and shaded digits divide the product. Splitting the two
// independent accumulators keeps both compiled machines compact.
function makeSumMachine(cellCount) {
  const maxUnshadedSum = Array.from(
    { length: cellCount }, (_, i) => 9 - i).reduce((a, b) => a + b, 0);
  return NFA.encodeSpec({
    startState: { phase: 'high' },
    transition: (state, value) => {
      if (state.phase === 'high') {
        return { phase: 'low', high: value };
      }
      if (state.phase === 'low') {
        const balance = 9 * (state.high - 1) + value;
        if (balance > maxUnshadedSum) return undefined;
        return {
          phase: 'digit',
          remaining: balance,
          unshaded: false,
        };
      }
      if (state.phase === 'digit') {
        return { ...state, phase: 'shade', digit: value };
      }
      if (value === SHADED) {
        return {
          phase: 'digit',
          remaining: state.remaining,
          unshaded: state.unshaded,
        };
      }
      if (value === UNSHADED) {
        if (state.remaining < state.digit) return undefined;
        return {
          phase: 'digit',
          remaining: state.remaining - state.digit,
          unshaded: true,
        };
      }
      return undefined;
    },
    accept: state => (
      state.phase === 'digit' &&
      state.remaining === 0 && state.unshaded),
    maxDepth: 2 + 2 * cellCount,
  }, geometry.numValues);
}

function makeProductMachine(cellCount) {
  const maxUnshadedSum = Array.from(
    { length: cellCount }, (_, i) => 9 - i).reduce((a, b) => a + b, 0);
  return NFA.encodeSpec({
    startState: { phase: 'high' },
    transition: (state, value) => {
      if (state.phase === 'high') {
        return { phase: 'low', high: value };
      }
      if (state.phase === 'low') {
        const balance = 9 * (state.high - 1) + value;
        if (balance > maxUnshadedSum) return undefined;
        return { phase: 'digit', remaining: balance, shaded: false };
      }
      if (state.phase === 'digit') {
        return { ...state, phase: 'shade', digit: value };
      }
      if (value === SHADED) {
        if (state.remaining % state.digit !== 0) return undefined;
        return {
          phase: 'digit',
          remaining: state.remaining / state.digit,
          shaded: true,
        };
      }
      if (value === UNSHADED) {
        return {
          phase: 'digit',
          remaining: state.remaining,
          shaded: state.shaded,
        };
      }
      return undefined;
    },
    accept: state => (
      state.phase === 'digit' && state.remaining === 1 && state.shaded),
    maxDepth: 2 + 2 * cellCount,
  }, geometry.numValues);
}

const cageRules = cages.flatMap(({ total, cells }, i) => {
  const high = balanceDigits.cell(i + 1, 1);
  const low = balanceDigits.cell(i + 1, 2);
  const inputs = [high, low, ...cells.flatMap(cell => [cell, shade.at(cell)])];
  const digitRule = total === undefined
    ? new AllDifferent(...cells)
    : new Cage(total, ...cells);
  return [
    digitRule,
    new NFA(makeSumMachine(cells.length), 'unshaded cage sum', ...inputs),
    new NFA(makeProductMachine(cells.length), 'shaded cage product', ...inputs),
  ];
});

// Different base-9 pairs represent different balance values.
const distinctBalances = cages.flatMap((_, i) =>
  cages.slice(i + 1).map((__, offset) => {
    const j = i + offset + 1;
    return new Or([
      new AllDifferent(
        balanceDigits.cell(i + 1, 1), balanceDigits.cell(j + 1, 1)),
      new AllDifferent(
        balanceDigits.cell(i + 1, 2), balanceDigits.cell(j + 1, 2)),
    ]);
  }));

return [
  new Shape('9x9'),
  new YinYang(),
  balanceDigits,
  ...cageRules,
  ...distinctBalances,
];
