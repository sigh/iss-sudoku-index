// Title: Medieval Buffet
// Author: Manta Ray
// Video: https://www.youtube.com/watch?v=NjGqUfP0lWs
// Source: https://sudokupad.app/t2HrhT8rMM

// Rules encoded below, in order:
//  1. Normal sudoku.
//  2. Shade some cells so that all shaded cells are orthogonally connected, all
//     unshaded cells are orthogonally connected, and no 2x2 area is fully
//     shaded or fully unshaded.
//  3. The digits on an arrow with the same shading as the arrow's circle sum to
//     the digit in the arrow's circle.
//  4. If both shaded and unshaded cells are found within a cage, each shading
//     type must be connected in a single region; the digits in one of these
//     regions sum to the number shown; a digit may repeat in a cage only if it
//     is once shaded and once unshaded.
//  5. Shaded cells between the 1 and the 9 in a row or column sum to that
//     row/column's sandwich total; every row/column has a different sandwich
//     total; the total of column 8 is 9.
// Nothing is omitted. The two arrow colours are drawing only -- they separate
// arrows whose arms cross -- and the grey square drawn outside the grid corner
// marks no cell.

const SHADED = 0;
const UNSHADED = 1;

// The alphabet is widened to 0-9 so that a masked overlay can hold 0 and the
// sandwich totals can hold a 0 digit; the grid cells are put back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const shade = graph.makeOverlay('YY');
const masked = graph.makeOverlay('VS');

// VS holds a shaded cell's digit and 0 for an unshaded cell, so a total over
// the shaded members of any set is a plain Sum over VS, and the unshaded total
// of a set is (sum of digits) - (sum of VS).
const maskedIsDigitOrZero = Pair.fnToKey(
  (digit, m) => m === 0 || m === digit, shape);
const maskedFollowsShade = Pair.fnToKey(
  (yy, m) => (yy === SHADED) === (m !== 0), shape);
const maskedOverlay = graph.cells().flatMap(cell => [
  new Pair(maskedIsDigitOrZero, 'masked digit', cell, masked.at(cell)),
  new Pair(maskedFollowsShade, 'masked shading', shade.at(cell), masked.at(cell)),
]);

// Circled cell then arm cells, from the circle to the arrowhead, transcribed
// from the drawn arrow polylines. Three circles carry two arrows each.
const arrows = [
  { circle: 'R2C1', arm: ['R1C2', 'R1C3'] },
  { circle: 'R3C2', arm: ['R4C3', 'R5C4', 'R5C5'] },
  { circle: 'R5C3', arm: ['R6C4', 'R6C5', 'R6C6'] },
  { circle: 'R3C5', arm: ['R3C4', 'R3C3', 'R2C2', 'R1C1'] },
  { circle: 'R3C5', arm: ['R2C6', 'R1C5', 'R1C4'] },
  { circle: 'R4C5', arm: ['R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C9'] },
  { circle: 'R4C5', arm: ['R3C4', 'R2C3'] },
  { circle: 'R2C7', arm: ['R2C8', 'R1C9'] },
  { circle: 'R5C7', arm: ['R5C6', 'R5C5', 'R4C4'] },
  { circle: 'R8C1', arm: ['R7C1', 'R6C1', 'R5C1', 'R4C1'] },
  { circle: 'R8C1', arm: ['R9C1', 'R9C2'] },
];

const arrowRules = arrows.map(({ circle, arm }) => new Or([
  // A shaded circle sums the arm's VS values, which are 0 on its unshaded cells.
  new And([
    new Given(shade.at(circle), SHADED),
    new Arrow(circle, ...masked.at(arm)),
  ]),
  // An unshaded circle sums (digit - VS) over the arm, rearranged so that both
  // sides of the equality are plain cell sums.
  new And([
    new Given(shade.at(circle), UNSHADED),
    new EqualSum(arm, [circle, ...masked.at(arm)]),
  ]),
]));

// Cage totals and cells, transcribed from the drawn cages.
const cages = [
  { total: 6, cells: ['R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3'] },
  { total: 10, cells: ['R4C1', 'R4C2', 'R4C3'] },
  { total: 23, cells: ['R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C9'] },
  { total: 16, cells: ['R5C8', 'R5C9', 'R6C9'] },
  { total: 27, cells: ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R8C2', 'R9C2'] },
];

// Each shade present in a cage occupies one orthogonally-connected region of
// that cage, so enumerate the cage's shadings with that property and disjoin
// over them (6 to 34 per cage here). Restricting the connectivity test to the
// cage's own cells is what makes it a within-cage rule.
const cageShadings = cages.map(({ cells }) => new Or(
  Array.from({ length: 1 << cells.length }, (_, mask) => mask)
    .filter(mask => [
      cells.filter((_, i) => (mask >> i) & 1),
      cells.filter((_, i) => !((mask >> i) & 1)),
    ].every(part => !part.length || graph.connected(part)))
    .map(mask => new And(cells.map((cell, i) => new Given(
      shade.at(cell), (mask >> i) & 1 ? SHADED : UNSHADED))))));

// The printed number is the total of one of the two shading regions: either the
// shaded digits of the cage or the unshaded ones. A single-shade cage is the
// same disjunction with one branch demanding a total of 0 from no cells.
const cageTotals = cages.map(({ total, cells }) => new Or([
  new Sum(total, ...masked.at(cells)),
  new Sum(total, ...cells, ...masked.at(cells).map(cell => [cell, -1])),
]));

// A digit repeats in a cage only when it is once shaded and once unshaded.
const cageRepeats = cages.flatMap(({ cells }) =>
  cells.flatMap((a, i) => cells.slice(i + 1).map(b => new Or([
    new AllDifferent(a, b),
    new AllDifferent(shade.at(a), shade.at(b)),
  ]))));

const lines = [
  ...graph.rows().map((cells, i) => ({ id: `R${i + 1}`, cells })),
  ...graph.columns().map((cells, i) => ({ id: `C${i + 1}`, cells })),
];

// A sandwich total is not a printed number here, so each line carries its own
// total in two Var cells read as a decimal pair, tens then ones. The largest
// reachable total is 2+3+4+5+6+7+8 = 35, so the tens digit is 0-3.
const SANDWICH_MAX = 35;
const tens = new Var('T', 'sandwich total tens digit', lines.length);
const ones = new Var('O', 'sandwich total ones digit', lines.length);
const tensRange = lines.map(
  (_, i) => new Given(tens.cell(i + 1), 0, 1, 2, 3));

// Scans a line as (digit, VS) pairs, then the tens and ones cells as their own
// segments. `zone` is 0 before the first crust digit, 1 strictly between the
// crusts and 2 after the second; `need` is the crust digit still to come; `add`
// marks a digit read inside the crusts, whose VS value the next symbol adds to
// `sum`. Accepting states are those where the accumulated `sum` equals the
// total spelled by the last two cells.
const sandwichSpec = NFA.encodeSpec({
  startState: { at: 'digit', zone: 0, need: 0, sum: 0, add: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.at === 'digit' && state.zone === 2) {
        return { at: 'tens', sum: state.sum };
      }
      if (state.at === 'gap') return { at: 'ones', rem: state.rem };
      return undefined;
    }
    switch (state.at) {
      case 'digit':
        if (value === 0) return undefined;  // grid cells hold 1-9
        if (state.zone === 0) {
          const crust = value === 1 || value === 9;
          return {
            at: 'mask', zone: crust ? 1 : 0, need: crust ? 10 - value : 0,
            sum: 0, add: false,
          };
        }
        if (state.zone === 1) {
          const closes = value === state.need;
          return {
            at: 'mask', zone: closes ? 2 : 1, need: closes ? 0 : state.need,
            sum: state.sum, add: !closes,
          };
        }
        return { at: 'mask', zone: 2, need: 0, sum: state.sum, add: false };
      case 'mask': {
        const sum = state.add ? state.sum + value : state.sum;
        if (sum > SANDWICH_MAX) return undefined;
        return {
          at: 'digit', zone: state.zone, need: state.need, sum, add: false,
        };
      }
      case 'tens': {
        const rem = state.sum - 10 * value;
        if (rem < 0 || rem > 9) return undefined;
        return { at: 'gap', rem };
      }
      case 'ones':
        return value === state.rem ? { at: 'done' } : undefined;
      default:
        return undefined;
    }
  },
  accept: state => state.at === 'done',
  maxDepth: 22,  // 18 interleaved cells + 2 total cells + 2 segment breaks
}, shape, { multiSegment: true });

const sandwichTotals = lines.map(({ cells }, i) => new NFA(
  sandwichSpec, 'sandwich total',
  cells.flatMap(cell => [cell, masked.at(cell)]),
  [tens.cell(i + 1)],
  [ones.cell(i + 1)]));

// Two totals differ exactly when their tens or their ones digits differ.
const distinctTotals = lines.flatMap((_, i) =>
  lines.slice(i + 1).map((_, k) => new Or([
    new AllDifferent(tens.cell(i + 1), tens.cell(i + k + 2)),
    new AllDifferent(ones.cell(i + 1), ones.cell(i + k + 2)),
  ])));

// The only printed total: the 9 above column 8.
const clueIndex = lines.findIndex(({ id }) => id === 'C8');
const sandwichClue = [
  new Given(tens.cell(clueIndex + 1), 0),
  new Given(ones.cell(clueIndex + 1), 9),
];

return [
  shape,
  new YinYang(),
  masked.toVar('shaded digits'),
  tens,
  ones,
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...maskedOverlay,
  ...arrowRules,
  ...cageShadings,
  ...cageTotals,
  ...cageRepeats,
  ...tensRange,
  ...sandwichTotals,
  ...distinctTotals,
  ...sandwichClue,
];
