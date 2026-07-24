// Title: Region Sum Circus
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=DvbnnTUdByY
// Source: https://sudokupad.app/73oh4m8m8m

// Rules:
// Normal sudoku rules apply.
// The 3x3 box borders divide the blue lines into segments with the same sum,
// but the sum may be different for different lines.
// Using red, green, and blue, colour all circles such that:
//   - orthogonally adjacent circles are different colours;
//   - the digit inside a circle appears that many times in circles of that
//     colour.

// Region sum lines: each is a plain array of cells; RegionSumLine handles the
// per-box-segment sums (and repeated box visits) natively.
const lines = [
  ['R1C5', 'R1C6', 'R2C7'],
  ['R2C6', 'R2C5', 'R2C4', 'R3C3'],
  ['R3C7', 'R4C8', 'R5C9', 'R6C8', 'R7C8'],
  ['R7C7', 'R8C6', 'R8C5', 'R8C4'],
  ['R7C2', 'R8C3', 'R9C4', 'R9C5'],
  ['R4C2', 'R5C1', 'R6C2', 'R7C3'],
];

// Circles, in the source's drawing order. Two are pre-coloured in the source
// art (R3C3 red, R7C7 green) -- these double as endpoints of two of the
// region sum lines above; the rest are undrawn ('?') and must be deduced.
const circleSpecs = [
  ['R7C7', 'G'], ['R7C8', null], ['R8C9', null], ['R9C9', null], ['R9C8', null],
  ['R5C7', null], ['R4C7', null], ['R4C8', null], ['R5C8', null], ['R6C8', null],
  ['R6C9', null], ['R5C9', null], ['R3C7', null], ['R2C7', null], ['R2C8', null],
  ['R2C9', null], ['R1C9', null], ['R3C8', null], ['R3C6', null], ['R2C6', null],
  ['R1C6', null], ['R1C5', null], ['R2C5', null], ['R1C4', null], ['R2C4', null],
  ['R3C4', null], ['R1C3', null], ['R1C2', null], ['R2C1', null], ['R4C2', null],
  ['R4C1', null], ['R5C1', null], ['R5C2', null], ['R6C2', null], ['R6C1', null],
  ['R6C3', null], ['R4C4', null], ['R5C5', null], ['R6C5', null], ['R7C6', null],
  ['R8C6', null], ['R9C6', null], ['R9C5', null], ['R8C5', null], ['R8C4', null],
  ['R9C4', null], ['R8C3', null], ['R7C3', null], ['R7C2', null], ['R8C2', null],
  ['R9C2', null], ['R8C1', null], ['R3C3', 'R'],
];

function* rangeI(from, to) {
  for (let i = from; i <= to; i++) yield i;
}

const graph = cellGraph();
const circleCells = circleSpecs.map(([cell]) => cell);
const circleColorGiven = new Map(circleSpecs);

// The colour Var paired with each circle (VC1.., in the circles' listed order).
const color = graph.makeOverlay('VC', circleCells);

// Every circle's colour is one of R/G/B: one Given as the template, stamped onto
// the whole group by Replicate (the overlay locates the cells). Circles with a
// stated colour get their own Given on top -- Givens intersect, so the narrower
// one wins and the domain need not exclude them.
const colorCells = color.at(circleCells);
const colorDomain = color.makeReplicate(new Given(colorCells[0], 1, 2, 3));

const colorGivens = circleCells
  .filter(cell => circleColorGiven.get(cell))
  .map(cell => new Given(color.at(cell), 'RGB'.indexOf(circleColorGiven.get(cell)) + 1));

// Each orthogonally-adjacent pair of circles, once: the horizontal and
// vertical dominoes starting at each circle whose other cell is also a
// circle.
const circleCellSet = new Set(circleCells);
const circleAdjacencies = () => color.at(circleCells
  .flatMap(cell => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter(domino => domino?.every(c => circleCellSet.has(c))));

const allCircleEntries = circleCells.flatMap(cell => [cell, color.at(cell)]);

// For a given colour and digit: scanning every circle in drawing order, count
// how many circles of that colour hold that digit. Accept only if the count
// is 0 (digit never appears in a circle of this colour) or exactly the digit
// itself (the digit appears in circles of that colour that many times).
function colorDigitSpec(colorValue, digit) {
  return NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count, digitMatch }, value) =>
      (digitMatch === undefined) ? { count, digitMatch: value == digit }
        : (digitMatch && value == colorValue) ? ((count == digit) ? [] : { count: count + 1 })
          : { count },
    accept: ({ count, digitMatch }) =>
      (digitMatch === undefined) && (count == 0 || count == digit),
  }, 9);
}

function colorDigitNFAs() {
  const colorNames = 'RGB';
  const nfas = [];
  for (const colorValue of rangeI(1, 3)) {
    for (const digit of rangeI(1, 9)) {
      nfas.push(new NFA(
        colorDigitSpec(colorValue, digit),
        `${colorNames[colorValue - 1]}${digit}`,
        ...allCircleEntries,
      ));
    }
  }
  return nfas;
}

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
  color.toVar('Color'),
  colorDomain,
  ...colorGivens,
  new And([
    ...circleAdjacencies().map(cells => new AllDifferent(...cells)),
  ]),
  new And([...colorDigitNFAs()]),
];
