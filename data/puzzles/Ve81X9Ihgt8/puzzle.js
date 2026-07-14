// Title: A Very Small Flashlight
// Author: PhyDraLey
// Video: https://www.youtube.com/watch?v=Ve81X9Ihgt8
// Source: https://sudokupad.app/bxd5hl6ipw

// Anti-knight: identical digits cannot be a knight's move apart.
const antiKnight = new AntiKnight();

// Kropki black dots: digits in an orthogonal domino are in a 1:2 ratio.
// ALL BLACK DOTS ARE GIVEN, so every other orthogonally adjacent pair must
// NOT be in that ratio. There is no white-dot (consecutive) rule in this
// puzzle, so StrictKropki (which also bans unmarked consecutive pairs) would
// tighten beyond the stated rule; encode the negative directly as a custom
// Pair over every undrawn adjacent pair instead.
const blackDots = [
  ['R7C6', 'R8C6'],
  ['R8C5', 'R8C6'],
  ['R4C7', 'R4C8'],
  ['R2C2', 'R2C3'],
  ['R2C4', 'R3C4'],
  ['R4C3', 'R5C3'],
  ['R5C4', 'R5C5'],
  ['R5C5', 'R6C5'],
  ['R6C5', 'R6C6'],
  ['R6C6', 'R7C6'],
  ['R7C5', 'R7C6'],
  ['R6C5', 'R7C5'],
  ['R9C4', 'R9C5'],
  ['R8C8', 'R9C8'],
  ['R9C8', 'R9C9'],
  ['R4C9', 'R5C9'],
  ['R3C7', 'R4C7'],
  ['R3C6', 'R3C7'],
  ['R2C7', 'R3C7'],
  ['R1C7', 'R2C7'],
];

const graph = cellGraph('9x9');
const dotPairKeys = new Set(
  blackDots.map(([a, b]) => [a, b].sort().join('-'))
);
const notRatioKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const negativeRatioPairs = [];
for (const cell of graph.cells()) {
  for (const other of graph.neighbours(cell)) {
    const pairKey = [cell, other].sort().join('-');
    if (cell < other && !dotPairKeys.has(pairKey)) {
      negativeRatioPairs.push([cell, other]);
    }
  }
}

const negativeRatioConstraints = [
  graph.makeReplicate(
    new Pair(notRatioKey, 'not 1:2', 'R1C1', 'R1C2'),
    negativeRatioPairs.filter(([a, b]) => parseCellId(a).row === parseCellId(b).row).map(([a]) => a)),
  graph.makeReplicate(
    new Pair(notRatioKey, 'not 1:2', 'R1C1', 'R2C1'),
    negativeRatioPairs.filter(([a, b]) => parseCellId(a).col === parseCellId(b).col).map(([a]) => a)),
];

// V: digits sum to 5.
const vPairs = [
  ['R3C3', 'R3C4'],
];

// Arrows: bulb/control cell first, then the arm cells (sum to the circle).
const arrows = [
  ['R8C5', 'R8C6', 'R7C6', 'R6C5'],
  ['R3C2', 'R3C3', 'R2C3'],
];

// Thermometers: bulb first, strictly increasing to the tip.
const thermos = [
  ['R4C3', 'R3C3', 'R3C2'],
  ['R7C5', 'R8C6', 'R9C6', 'R8C5'],
];

// German whisper (green): adjacent digits differ by at least 5.
const germanWhisperLines = [
  ['R2C2', 'R3C3', 'R4C2'],
  ['R4C9', 'R5C8'],
];

// Equal-sum lines (blue): region borders divide each line into segments with
// equal sums; RegionSumLine handles the per-box-segment split itself.
const equalSumLines = [
  ['R3C4', 'R2C4', 'R3C3', 'R4C4'],
  ['R3C8', 'R4C8', 'R4C9'],
];

return [
  new Shape('9x9'),

  antiKnight,

  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...negativeRatioConstraints,

  ...vPairs.map(([a, b]) => new V(a, b)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...germanWhisperLines.map(cells => new Whisper(5, ...cells)),
  ...equalSumLines.map(cells => new RegionSumLine(...cells)),
];
