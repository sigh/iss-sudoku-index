// Title: Yin Yagn
// Author: Timotab
// Video: https://www.youtube.com/watch?v=MoFx3knrLro
// Source: https://sudokupad.app/de2dt3ohoq

// Yin Yang: the shading is the YinYang constraint's YY cell group (each
// shade one orthogonally-connected region, no 2x2 block monochrome).
//
// Every cage/dot/line/quadruple below is drawn once but obeys one of two
// opposite rules depending on its own shading: RIGHT (all its cells share one
// shade) obeys the clue type's normal rule; WROGN (its cells are a mix of
// shades) obeys the stated opposite rule. This is encoded per clue as
// Or(all-shaded AND right-rule, all-unshaded AND right-rule,
//    mixed-shaded AND wrong-rule).
//
// Rule pairs, from the puzzle's own text:
//  - Cage: RIGHT sums to the total; WROGN does not sum to the total.
//  - Kropki (black dot): RIGHT one digit double the other; WROGN neither is.
//    Not all dots are necessarily drawn (silent on undrawn pairs either way).
//  - Renban (pink line): RIGHT is a non-repeating consecutive run in any
//    order; WROGN is "no two digits consecutive anywhere on the line, no
//    repeats" -- i.e. a WROGN Renban obeys the RIGHT Nabner rule below.
//  - Nabner (gold line): RIGHT is "no two digits consecutive anywhere on the
//    line, no repeats"; WROGN is a non-repeating consecutive run in any order
//    -- i.e. a WROGN Nabner obeys the RIGHT Renban rule above.
//  - Quadruple circle: RIGHT means every listed digit appears at least once
//    among the four cells; WROGN means none of the listed digits appears in
//    any of the four cells.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Which physical region counts as "shaded" is a label the rules never fix:
// every clue above only ever compares cells to each other, never to an
// absolute shade name. Pin one arbitrary cell's shade as a representative
// to break that label symmetry -- this does not narrow which digit grids
// or region shapes are accepted, only which of the two mirror-image
// shadings of a given shape is reported.
const firstShade = shade.cells()[0];
const shadeRepresentative = new Given(firstShade, SHADED);

// Builds the RIGHT/WROGN Or for one clue: its own shading picks which rule
// set (thenConstraints for RIGHT, elseConstraints for WROGN) applies.
function conditional(cells, thenConstraints, elseConstraints) {
  const shadeCells = shade.at(cells);
  const thenList = Array.isArray(thenConstraints) ? thenConstraints : [thenConstraints];
  const elseList = Array.isArray(elseConstraints) ? elseConstraints : [elseConstraints];
  const allShaded = new And(shadeCells.map(c => new Given(c, SHADED)));
  const allUnshaded = new And(shadeCells.map(c => new Given(c, UNSHADED)));
  const mixed = new Or(
    shadeCells.slice(1).map(c => new AllDifferent(shadeCells[0], c)));
  return new Or([
    new And([allShaded, ...thenList]),
    new And([allUnshaded, ...thenList]),
    new And([mixed, ...elseList]),
  ]);
}

// Two-cell cages use a Pair; larger cages need running-sum state, tracked as
// (count, sum) with count capped at the cage size so the automaton's state
// space stays finite (a plain running sum never stops growing at compile
// time, since the builder does not know the cage is finite length).
function sumNotEqual(cells, total) {
  if (cells.length === 2) {
    const key = Pair.fnToKey((a, b) => a + b !== total, 9);
    return new Pair(key, `sum-not-${total}`, ...cells);
  }
  const machine = NFA.encodeSpec({
    startState: { sum: 0, count: 0 },
    transition: ({ sum, count }, value) => (count >= cells.length)
      ? { sum, count }
      : { sum: sum + value, count: count + 1 },
    accept: ({ sum, count }) => count === cells.length && sum !== total,
  }, geometry.numValues);
  return new NFA(machine, `sum-not-${total}`, ...cells);
}

// Cages: cells and totals as drawn. The R8C7,R8C8 cage is drawn with an
// extra all-different marking, but that is automatic since the two cells
// already share a row, so no separate constraint is added for it. No other
// cage is marked all-different, so repeats are allowed within a cage.
const cages = [
  { cells: ['R8C7', 'R8C8'], total: 9 },
  { cells: ['R9C4', 'R9C5'], total: 4 },
  { cells: ['R9C6', 'R9C7'], total: 3 },
  { cells: ['R1C2', 'R1C3'], total: 17 },
  { cells: ['R1C4', 'R1C5'], total: 16 },
  { cells: ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'], total: 15 },
  { cells: ['R2C7', 'R2C8'], total: 15 },
  { cells: ['R3C7', 'R3C8'], total: 15 },
  { cells: ['R7C3', 'R7C4'], total: 9 },
];
const cageConstraints = cages.map(({ cells, total }) => conditional(
  cells,
  new Sum(total, ...cells),
  sumNotEqual(cells, total)));

// Kropki black dots: cell pairs as drawn.
const dotPairs = [
  ['R5C1', 'R6C1'], ['R4C1', 'R5C1'], ['R5C1', 'R5C2'], ['R2C1', 'R3C1'],
  ['R9C8', 'R9C9'], ['R7C9', 'R8C9'], ['R7C3', 'R8C3'], ['R5C7', 'R5C8'],
];
const notRatio2Key = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const dotConstraints = dotPairs.map(([a, b]) => conditional(
  [a, b],
  new BlackDot(a, b),
  new Pair(notRatio2Key, 'not-ratio-2', a, b)));

// Shared building blocks for the Nabner/Renban rule pair: "no two digits
// consecutive anywhere on the line, no repeats" uses AllDifferent plus a
// PairX over every pair (not just adjacent cells), since the rule is
// explicitly "regardless of position".
const nonConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
function nonConsecutiveNoRepeat(cells) {
  return [new AllDifferent(...cells), new PairX(nonConsecutiveKey, 'non-consecutive', ...cells)];
}

// Nabner (gold, #efb315) lines as drawn.
const nabnerLines = [
  ['R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1'],
  ['R7C2', 'R8C2', 'R8C3'],
  ['R5C5', 'R5C6', 'R5C7'],
];
const nabnerConstraints = nabnerLines.map(cells => conditional(
  cells,
  nonConsecutiveNoRepeat(cells),
  new Renban(...cells)));

// Renban (pink, #e61fe0) lines as drawn.
const renbanLines = [
  ['R9C6', 'R8C6', 'R7C6', 'R7C5'],
  ['R9C4', 'R8C4', 'R7C4'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R6C9', 'R5C9', 'R4C9'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C8'],
  ['R4C8', 'R4C7', 'R4C6', 'R3C6'],
  ['R2C5', 'R3C5', 'R3C4'],
];
const renbanConstraints = renbanLines.map(cells => conditional(
  cells,
  new Renban(...cells),
  nonConsecutiveNoRepeat(cells)));

// Quadruple circles: 2x2 corner and digit list as drawn.
const quads = [
  { topLeft: 'R7C4', cells: ['R7C4', 'R7C5', 'R8C4', 'R8C5'], values: [1, 2, 3, 5] },
  { topLeft: 'R5C3', cells: ['R5C3', 'R5C4', 'R6C3', 'R6C4'], values: [2, 9] },
  { topLeft: 'R5C6', cells: ['R5C6', 'R5C7', 'R6C6', 'R6C7'], values: [5, 6, 7, 8] },
];
const allDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const quadConstraints = quads.map(({ topLeft, cells, values }) => conditional(
  cells,
  new Quad(topLeft, ...values),
  cells.map(c => new Given(c, ...allDigits.filter(v => !values.includes(v))))));

return [
  new Shape('9x9'),
  new YinYang(),
  shadeRepresentative,
  ...cageConstraints,
  ...dotConstraints,
  ...nabnerConstraints,
  ...renbanConstraints,
  ...quadConstraints,
];
