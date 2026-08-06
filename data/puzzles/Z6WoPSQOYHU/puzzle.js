// Title: Bookends
// Author: mnasti2
// Video: https://www.youtube.com/watch?v=Z6WoPSQOYHU
// Source: https://sudokupad.app/e0yukfm7p9

// Normal 6x6 Sudoku uses 2x3 boxes. Every row, column, and box has one
// doubler; every digit occurs in one doubler. Cage totals use digit * flag,
// where flag 1 is ordinary and flag 2 is doubled. Cages have no repeated
// digit, distinct totals, and the two printed ranks identify the lowest and
// highest totals.

const graph = cellGraph('6x6~1-12');
const digitGeometry = cellGeometry('6x6');
const flags = graph.makeOverlay('VD');
const effective = graph.makeOverlay('VE');
const flag = cell => flags.at(cell);

// Cage cells and the two rank labels are transcribed from the drawn cages.
const cages = [
  ['R2C2', 'R3C1', 'R3C2', 'R4C2'],
  ['R2C4', 'R2C5'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C5'],
  ['R5C2', 'R6C2'],
  ['R1C1'], // Rank 6.
  ['R6C5'], // Rank 1.
];

// The state stores one digit until its paired doubler flag is read; the bit
// mask records which digits have been doubled while scanning the whole grid.
const doubledDigits = NFA.encodeSpec({
  startState: { digit: null, mask: 0 },
  transition: ({ digit, mask }, value) => {
    if (digit === null) return { digit: value, mask };
    if (value === 1) return { digit: null, mask };
    const bit = 1 << (digit - 1);
    return mask & bit ? undefined : { digit: null, mask: mask | bit };
  },
  accept: ({ digit, mask }) => digit === null && mask === 63,
}, digitGeometry);

// Each effective-value Var is its grid digit times its doubler flag. The three
// input positions are digit, flag, then the derived effective value.
const effectiveValue = NFA.encodeSpec({
  startState: { phase: 0, digit: null, multiplier: null },
  transition: ({ phase, digit, multiplier }, value) => {
    if (phase === 0) return { phase: 1, digit: value, multiplier: null };
    if (phase === 1) return { phase: 2, digit, multiplier: value };
    return value === digit * multiplier
      ? { phase: 0, digit: null, multiplier: null }
      : undefined;
  },
  accept: ({ phase }) => phase === 0,
}, 12);

// A cage total is represented by two Vars: total = 10 * tens + ones - 11.
// The offset lets both decimal digits stay in ISS's positive 1--12 domain.
const totalTens = new Var('T', 'cage total tens', 6);
const totalOnes = new Var('O', 'cage total ones', 6);
const totalCells = index => [totalTens.cell(index + 1), totalOnes.cell(index + 1)];

// Each two-segment machine compares the decimal total Vars lexicographically.
// The domains below are tens 1--5 and ones 1--10, so this small machine exactly
// compares total values from 0 through 49 without a large running-sum state.
const totalComparison = relation => NFA.encodeSpec({
  startState: { segment: 0, leftTens: null, leftOnes: null, rightTens: null },
  transition: ({ segment, leftTens, leftOnes, rightTens }, value) => {
    if (value === SEGMENT_BREAK) {
      return segment === 0 && leftTens !== null && leftOnes !== null
        ? { segment: 1, leftTens, leftOnes, rightTens: null }
        : undefined;
    }
    if (value < 1 || value > (leftTens === null || (segment === 1 && rightTens === null) ? 5 : 10)) {
      return undefined;
    }
    if (segment === 0 && leftTens === null) return { segment, leftTens: value, leftOnes, rightTens };
    if (segment === 0) return { segment, leftTens, leftOnes: value, rightTens };
    if (rightTens === null) return { segment, leftTens, leftOnes, rightTens: value };
    return relation(10 * leftTens + leftOnes, 10 * rightTens + value)
      ? { segment: 2, leftTens, leftOnes, rightTens }
      : undefined;
  },
  accept: ({ segment }) => segment === 2,
  maxDepth: 5,
}, 12, { multiSegment: true });

const unequalTotals = totalComparison((left, right) => left !== right);
const increasingTotals = totalComparison((left, right) => left < right);
const pairwiseTotalRules = cages.flatMap((left, index) =>
  cages.slice(index + 1).map((right, relativeIndex) =>
    new NFA(unequalTotals, 'different-cage-totals',
      totalCells(index), totalCells(index + relativeIndex + 1))));
const lowestCageRules = cages.slice(0, -1).map((cage, index) =>
  new NFA(increasingTotals, 'rank-1-is-lowest', totalCells(5), totalCells(index)));
const highestCageRules = cages.flatMap((cage, index) => index === 4 ? [] :
  [new NFA(increasingTotals, 'rank-6-is-highest', totalCells(index), totalCells(4))]);

return [
  new Shape('6x6', '1-12'),
  ...graph.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6)),
  flags.toVar('doubler flags'),
  effective.toVar('effective cage values'),
  totalTens,
  totalOnes,
  ...flags.cells().map(cell => new Given(cell, 1, 2)),
  ...totalTens.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5)),
  ...totalOnes.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)),
  ...flags.rows().map(cells => new Sum(7, ...cells)),
  ...flags.columns().map(cells => new Sum(7, ...cells)),
  ...flags.boxes().map(cells => new Sum(7, ...cells)),
  new NFA(doubledDigits, 'each-digit-doubled-once', graph.cells().flatMap(cell => [cell, flag(cell)])),
  ...graph.cells().map(cell =>
    new NFA(effectiveValue, 'effective-value', [cell, flag(cell), effective.at(cell)])),
  ...cages.filter(cells => cells.length > 1).map(cells => new AllDifferent(...cells)),
  ...cages.map((cells, index) =>
    new Sum(-11, ...effective.at(cells), [totalTens.cell(index + 1), -10], [totalOnes.cell(index + 1), -1])),
  ...pairwiseTotalRules,
  ...lowestCageRules,
  ...highestCageRules,
];
