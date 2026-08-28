// Title: Everything Is Wrogn
// Author: DiMono
// Video: https://www.youtube.com/watch?v=rZOU-0E5MDI
// Source: https://app.crackingthecryptic.com/sudoku/jL24HLphHb

// Normal sudoku rules apply, but every drawn clue lies, so each clue type is
// encoded as the negation of its usual meaning:
//   Thermometers   the drawn bulb is not the bulb; the true bulb is some other
//                  cell of the same thermometer, digits increase along the
//                  thermometer away from it, and no digit repeats on a
//                  thermometer.
//   Killer cages   the cage does not sum to its printed total. Only the sum is
//                  called a lie; the killer no-repeat half is untouched, and
//                  every cage here lies inside a single row, column or box, so
//                  sudoku already forbids the repeat.
//   Little killer  the marked diagonal does not sum to the clue.
//   X / V          the joined pair does not sum to 10 / 5.
//   Palindrome     the line's digit string is not a palindrome.
//   Black dots     neither joined cell is half of the other.
//   Maximum cells  a blue cell is not greater than all four of its orthogonal
//                  neighbours.
//   Quad circles   the four cells round a circle do not contain all of the
//                  circled digits (they may contain some).
// The grid has no givens, and no rule is omitted.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// "These cells do not total `total`". Over two cells that is a binary relation;
// over more it is a running-sum machine, clamped one past the target because a
// sum that has passed it can never come back, accepting every final total
// except the target.
const notTotal = (total, name, cells) => (
  cells.length === 2
    ? new Pair(Pair.fnToKey((a, b) => a + b !== total, shape), name, ...cells)
    : new NFA(
      NFA.encodeSpec({
        startState: 0,
        transition: (sum, value) => Math.min(sum + value, total + 1),
        accept: (sum) => sum !== total,
      }, shape),
      name, ...cells));

// Grey lines carrying a drawn bulb, listed from the bulb end.
const thermoLines = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R3C4', 'R3C3', 'R3C2'],
  ['R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R5C5', 'R5C4', 'R4C4'],
];

// The rules place the true bulb on the thermometer but not where it is drawn,
// so every other cell of the line is a candidate: one Or branch each, holding
// the two runs that climb away from that cell. A one-cell run is no constraint
// and is dropped, which is what makes the last branch the reversed thermometer.
const thermoOrders = thermoLines.map(cells => new Or(
  cells.slice(1).map((_, i) => i + 1).map(bulb => new And(
    [cells.slice(0, bulb + 1).reverse(), cells.slice(bulb)]
      .filter(run => run.length > 1)
      .map(run => new Thermo(...run))))));

// "each thermo cannot contain a repeated digit", restated by the rules because
// a bulb part-way along the line no longer orders the two runs against each
// other.
const thermoDistinct = thermoLines.map(cells => new AllDifferent(...cells));

// The grey line with no bulb.
const palindromeLine = ['R4C2', 'R5C3', 'R6C3', 'R7C2', 'R8C1'];

// A palindrome needs every mirrored pair equal, so its negation is that at
// least one mirrored pair differs.
const differsKey = Pair.fnToKey((a, b) => a !== b, shape);
const notPalindrome = new Or(
  palindromeLine.slice(0, palindromeLine.length >> 1).map(
    (cell, i) => new Pair(differsKey, 'not a palindrome',
      cell, palindromeLine[palindromeLine.length - 1 - i])));

// White "X" marks, as the cell pair each straddles.
const xEdges = [
  ['R1C1', 'R1C2'], ['R1C2', 'R2C2'], ['R2C4', 'R2C5'], ['R2C5', 'R2C6'],
  ['R2C7', 'R3C7'], ['R3C8', 'R4C8'], ['R2C9', 'R3C9'], ['R1C9', 'R2C9'],
  ['R6C6', 'R7C6'], ['R7C6', 'R7C7'], ['R8C5', 'R8C6'], ['R9C6', 'R9C7'],
  ['R7C4', 'R8C4'], ['R8C4', 'R9C4'], ['R7C2', 'R8C2'], ['R8C2', 'R9C2'],
];

// White "V" marks, as the cell pair each straddles.
const vEdges = [
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R2C3', 'R3C3'], ['R4C3', 'R4C4'],
  ['R6C3', 'R6C4'], ['R7C6', 'R8C6'], ['R9C5', 'R9C6'],
];

// Black kropki dots, as the cell pair each straddles. The payload draws the
// R1C3/R2C3 dot twice at the same spot; one dot is encoded.
const blackDotEdges = [
  ['R1C3', 'R2C3'], ['R3C5', 'R4C5'], ['R4C5', 'R5C5'], ['R4C5', 'R4C6'],
  ['R4C7', 'R5C7'], ['R6C4', 'R7C4'], ['R9C3', 'R9C4'], ['R8C2', 'R8C3'],
];

const notTenKey = Pair.fnToKey((a, b) => a + b !== 10, shape);
const notFiveKey = Pair.fnToKey((a, b) => a + b !== 5, shape);
const notHalfKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, shape);

const xClues = xEdges.map(([a, b]) => new Pair(notTenKey, 'X lies', a, b));
const vClues = vEdges.map(([a, b]) => new Pair(notFiveKey, 'V lies', a, b));
const blackDots = blackDotEdges.map(
  ([a, b]) => new Pair(notHalfKey, 'black dot lies', a, b));

// Blue shaded cells.
const maximumCells = ['R5C2', 'R5C8', 'R7C5'];

// Not greater than all four neighbours means some neighbour is at least as
// large; `>=` rather than `>` keeps the encoding the plain negation, without
// leaning on the row/column that already separates the two digits.
const atLeastKey = Pair.fnToKey((a, b) => a >= b, shape);
const notMaximums = maximumCells.map(cell => new Or(
  graph.neighbours(cell).map(
    neighbour => new Pair(atLeastKey, 'maximum lies', neighbour, cell))));

// Quadruple circles: the 2x2 square's top-left cell, then the circled digits.
const quadCircles = [
  ['R3C1', [3, 8, 9]],
  ['R5C1', [7, 8]],
  ['R5C6', [4, 7, 9]],
  ['R6C8', [3, 5, 7]],
  ['R4C8', [6, 7]],
  ['R8C6', [1, 2, 7]],
];

// Not all the circled digits appear means at least one of them appears in none
// of the four cells, which is that digit struck from all four candidate lists.
const notQuads = quadCircles.map(([topLeft, values]) => {
  const cells = [topLeft, graph.step(topLeft, 0, 1),
  graph.step(topLeft, 1, 0), graph.step(topLeft, 1, 1)];
  return new Or(values.map(value => new And(
    cells.map(cell => new Given(cell, ...DIGITS.filter(d => d !== value))))));
});

// Killer cages: printed total, then the cage's cells.
const cageClues = [
  [12, 'R1C5', 'R1C6'],
  [14, 'R2C7', 'R2C8'],
  [8, 'R3C8', 'R3C9'],
  [19, 'R8C8', 'R9C8', 'R9C9', 'R8C9'],
  [20, 'R7C5', 'R8C5', 'R9C5'],
  [9, 'R8C3', 'R8C4'],
  [9, 'R9C1', 'R9C2'],
  [24, 'R5C1', 'R5C2', 'R5C3'],
];

const notCageTotals = cageClues.map(([total, ...cells]) => notTotal(
  total, `cage not ${total}`, cells));

// Little killer arrows: clue, the first cell of the diagonal, and the step the
// arrow is drawn pointing along.
const littleKillerClues = [
  [5, 'R1C3', 1, 1],
  [13, 'R1C7', 1, 1],
  [10, 'R1C8', 1, 1],
  [44, 'R3C9', 1, -1],
  [7, 'R9C2', -1, -1],
  [12, 'R9C3', -1, -1],
  [10, 'R2C1', -1, 1],
];

const notLittleKillerTotals = littleKillerClues.map(
  ([total, start, dRow, dCol]) => notTotal(
    total, `diagonal not ${total}`, graph.ray(start, dRow, dCol)));

return [
  shape,
  ...thermoOrders,
  ...thermoDistinct,
  notPalindrome,
  ...xClues,
  ...vClues,
  ...blackDots,
  ...notMaximums,
  ...notQuads,
  ...notCageTotals,
  ...notLittleKillerTotals,
];
