// Title: Another Mathematical Phenomenon
// Author: Xenonetix
// Video: https://www.youtube.com/watch?v=JVwFPcZl1Ck
// Source: https://sudokupad.app/r3zdvtp9st

// The 9x9 Sudoku is the main grid. Each surrounding clue is represented by
// decimal tens and ones Vars because a sandwich sum can exceed one ISS value.
const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const cornerVar = new Var('O', 'corner clue: tens, ones', 2);
const topTensVar = new Var('TT', 'top clue tens', 9);
const topOnesVar = new Var('TO', 'top clue ones', 9);
const leftTensVar = new Var('LT', 'left clue tens', 9);
const leftOnesVar = new Var('LO', 'left clue ones', 9);
const [cornerTens, cornerOnes] = cornerVar.cells();
const topTens = topTensVar.cells();
const topOnes = topOnesVar.cells();
const leftTens = leftTensVar.cells();
const leftOnes = leftOnesVar.cells();
const corner = {tens: cornerTens, ones: cornerOnes};
const top = topTens.map((tens, i) => ({tens, ones: topOnes[i]}));
const left = leftTens.map((tens, i) => ({tens, ones: leftOnes[i]}));
const clues = [corner, ...top, ...left];

const gridDigitDomain = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Ordinary top/left sandwich sums are 0-35. The corner is at most 70 because
// its black dot makes it equal to half or twice the 0-35 left-row-1 clue.
const ordinaryTensDomain = [0, 1, 2, 3];
const decimalOnesDomain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const cornerTensDomain = [0, 1, 2, 3, 4, 5, 6, 7];
const atMost35Key = Pair.fnToKey((tens, ones) =>
  tens < 3 || (tens === 3 && ones <= 5), shape);
const atMost70Key = Pair.fnToKey((tens, ones) =>
  tens < 7 || (tens === 7 && ones === 0), shape);

const clueDomains = [
  ...topTens.map(cell => new Given(cell, ...ordinaryTensDomain)),
  ...leftTens.map(cell => new Given(cell, ...ordinaryTensDomain)),
  ...topOnes.map(cell => new Given(cell, ...decimalOnesDomain)),
  ...leftOnes.map(cell => new Given(cell, ...decimalOnesDomain)),
  new Given(cornerTens, ...cornerTensDomain),
  new Given(cornerOnes, ...decimalOnesDomain),
  ...top.map((clue, i) => new Pair(
    atMost35Key, `top clue ${i + 1} is at most 35`, clue.tens, clue.ones)),
  ...left.map((clue, i) => new Pair(
    atMost35Key, `left clue ${i + 1} is at most 35`, clue.tens, clue.ones)),
  new Pair(atMost70Key, 'corner clue is at most 70', cornerTens, cornerOnes),
];

// Scan [clue tens, clue ones, nine Sudoku digits]. After seeing either crust
// (1 or 9), sum digits until the other crust and match the two-digit clue.
const sandwichNFA = NFA.encodeSpec({
  startState: {stage: 0, target: 0, phase: 0, sum: 0, first: 0},
  transition: (state, value) => {
    if (state.stage === 0) {
      if (value < 0 || value > 3) return undefined;
      return {stage: 1, target: 10 * value, phase: 0, sum: 0, first: 0};
    }
    if (state.stage === 1) {
      if (value < 0 || value > 9 || state.target + value > 35) return undefined;
      return {stage: 2, target: state.target + value, phase: 0, sum: 0, first: 0};
    }
    if (value < 1 || value > 9) return undefined;
    if (state.phase === 0) {
      if (value === 1 || value === 9) {
        return {...state, phase: 1, first: value};
      }
      return state;
    }
    if (state.phase === 1) {
      if ((state.first === 1 && value === 9) ||
          (state.first === 9 && value === 1)) {
        return {...state, phase: 2};
      }
      const sum = state.sum + value;
      if (sum > state.target) return undefined;
      return {...state, sum};
    }
    return state;
  },
  accept: state => state.stage === 2 && state.phase === 2 &&
    state.sum === state.target,
  maxDepth: 11,
}, shape);

const rowSandwiches = left.map((clue, r) =>
  new NFA(sandwichNFA, `row ${r + 1} sandwich`,
    [clue.tens, clue.ones, ...graph.row(r + 1)]));
const columnSandwiches = top.map((clue, c) =>
  new NFA(sandwichNFA, `column ${c + 1} sandwich`,
    [clue.tens, clue.ones, ...graph.column(c + 1)]));

function comparisonNFA(test) {
  return NFA.encodeSpec({
    startState: {stage: 0, aTens: 0, aOnes: 0, relation: 0},
    transition: (state, value) => {
      if (state.stage === 0) {
        if (value < 0 || value > 7) return undefined;
        return {...state, stage: 1, aTens: value};
      }
      if (state.stage === 1) {
        if (value < 0 || value > 9) return undefined;
        return {...state, stage: 2, aOnes: value};
      }
      if (state.stage === 2) {
        if (value < 0 || value > 7) return undefined;
        return {...state, stage: 3,
          relation: Math.sign(10 * state.aTens + state.aOnes - 10 * value)};
      }
      if (value < 0 || value > 9) return undefined;
      const relation = state.relation || Math.sign(state.aOnes - value);
      return test(relation) ? {stage: 4, aTens: 0, aOnes: 0, relation: 0} : undefined;
    },
    accept: state => state.stage === 4,
    maxDepth: 4,
  }, shape);
}

const lessEqualNFA = comparisonNFA(relation => relation <= 0);
const greaterEqualNFA = comparisonNFA(relation => relation >= 0);

function compare(encodedNFA, name, a, b) {
  return new NFA(encodedNFA, name, [a.tens, a.ones, b.tens, b.ones]);
}

// The corner is a generalized sandwich over each nine-clue sequence. The Or
// enumerates ordered crust positions, preserving the intended choice among
// repeated zeroes without introducing symmetric selector Vars.
function generalizedSandwich(target, cells, label) {
  const alternatives = [];
  for (let low = 0; low < cells.length; low++) {
    for (let high = 0; high < cells.length; high++) {
      if (low === high) continue;
      const start = Math.min(low, high) + 1;
      const end = Math.max(low, high);
      const between = cells.slice(start, end);
      alternatives.push(new And([
        ...cells.map((cell, i) => i === low ? null : compare(
          lessEqualNFA, `${label} minimum`, cells[low], cell)).filter(Boolean),
        ...cells.map((cell, i) => i === high ? null : compare(
          greaterEqualNFA, `${label} maximum`, cells[high], cell)).filter(Boolean),
        new Sum(0,
          ...between.flatMap(cell => [[cell.tens, 10], cell.ones]),
          [target.tens, -10], [target.ones, -1]),
      ]));
    }
  }
  return new Or(alternatives);
}

// One shared four-cell NFA enforces pairwise uniqueness of the two-digit clue
// values while allowing either member of a pair to be zero.
const nonzeroDifferentNFA = NFA.encodeSpec({
  startState: {stage: 0, aTens: 0, aOnes: 0, bTens: 0},
  transition: (state, value) => {
    if (state.stage === 0) return value <= 7 ?
      {...state, stage: 1, aTens: value} : undefined;
    if (state.stage === 1) return value <= 9 ?
      {...state, stage: 2, aOnes: value} : undefined;
    if (state.stage === 2) return value <= 7 ?
      {...state, stage: 3, bTens: value} : undefined;
    if (value > 9) return undefined;
    const aIsZero = state.aTens === 0 && state.aOnes === 0;
    const bIsZero = state.bTens === 0 && value === 0;
    const differs = state.aTens !== state.bTens || state.aOnes !== value;
    return (aIsZero || bIsZero || differs) ?
      {stage: 4, aTens: 0, aOnes: 0, bTens: 0} : undefined;
  },
  accept: state => state.stage === 4,
  maxDepth: 4,
}, shape);

const clueUniqueness = [];
for (let i = 0; i < clues.length; i++) {
  for (let j = i + 1; j < clues.length; j++) {
    clueUniqueness.push(new NFA(nonzeroDifferentNFA, 'nonzero clues differ', [
      clues[i].tens, clues[i].ones, clues[j].tens, clues[j].ones,
    ]));
  }
}

const cellValue = cell => ({tens: null, ones: cell});
// Coefficient helpers omit a null tens component for a main-grid digit.
function valueTerms(value, coefficient) {
  return [
    ...(value.tens ? [[value.tens, 10 * coefficient]] : []),
    [value.ones, coefficient],
  ];
}
function valueRelation(a, b, multiplier, total) {
  return new Sum(total,
    ...valueTerms(a, 1), ...valueTerms(b, -multiplier));
}
function consecutiveValues(a, b) {
  return new Or([valueRelation(a, b, 1, 1), valueRelation(a, b, 1, -1)]);
}
function doubleValues(a, b) {
  return new Or([valueRelation(a, b, 2, 0), valueRelation(b, a, 2, 0)]);
}

const blackDots = [
  [corner, left[0]], [left[0], left[1]], [left[1], left[2]],
  [left[2], left[3]], [left[3], left[4]], [left[6], left[7]],
  [top[1], top[2]], [top[2], top[3]], [top[3], top[4]],
  [left[6], cellValue('R7C1')],
];
const whiteDots = [
  [left[5], left[6]], [left[3], cellValue('R4C1')],
  [left[8], cellValue('R9C1')],
];

return [
  shape,
  cornerVar,
  topTensVar,
  topOnesVar,
  leftTensVar,
  leftOnesVar,
  gridDigitDomain,
  ...clueDomains,
  ...rowSandwiches,
  ...columnSandwiches,
  generalizedSandwich(corner, top, 'top frame'),
  generalizedSandwich(corner, left, 'left frame'),
  ...clueUniqueness,
  ...blackDots.map(([a, b]) => doubleValues(a, b)),
  ...whiteDots.map(([a, b]) => consecutiveValues(a, b)),
];
