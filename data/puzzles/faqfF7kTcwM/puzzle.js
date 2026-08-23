// Title: Zippery When Wet
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=faqfF7kTcwM
// Source: https://sudokupad.app/7kov2n4lrz

// Normal Sudoku applies. Each cell is land or water; each type is orthogonally
// connected, and no 2x2 block is monochrome. A dry line has its colour rule, a
// wet line is a zipper, and a mixed line has both rules.

const LAND = 1;
const WATER = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// The drawn coloured line paths, in their drawn order.
const lines = [
  { type: 'renban', cells: ['R1C2', 'R2C2', 'R2C1'] },
  { type: 'regionSum', cells: ['R1C4', 'R2C3', 'R3C2'] },
  { type: 'nabner', cells: ['R1C7', 'R1C6', 'R1C5', 'R2C5', 'R3C5'] },
  { type: 'whisper', cells: ['R2C4', 'R3C4', 'R3C3', 'R4C3', 'R4C2'] },
  { type: 'palindrome', cells: ['R2C6', 'R3C6', 'R4C5'] },
  { type: 'entropic', cells: ['R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C9'] },
  { type: 'sameDifference', cells: ['R3C7', 'R3C8', 'R4C8'] },
  { type: 'regionSum', cells: ['R5C2', 'R5C3', 'R4C4', 'R5C5', 'R6C5'] },
  { type: 'renban', cells: ['R4C6', 'R5C6', 'R6C6'] },
  { type: 'parity', cells: ['R5C4', 'R6C3', 'R7C4', 'R8C4', 'R9C4'] },
  { type: 'parity', cells: ['R5C7', 'R5C8', 'R5C9'] },
  { type: 'sameDifference', cells: ['R6C1', 'R7C2', 'R8C3'] },
  { type: 'sameDifference', cells: ['R6C4', 'R7C5', 'R8C5'] },
  { type: 'entropic', cells: ['R6C7', 'R6C8', 'R7C7'] },
  { type: 'whisper', cells: ['R7C6', 'R8C6', 'R9C7'] },
  { type: 'nabner', cells: ['R7C8', 'R8C7', 'R8C8'] },
  { type: 'palindrome', cells: ['R8C9', 'R9C9', 'R9C8'] },
];

const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

function sameDifference(cells) {
  // A turquoise three-cell line has one common absolute difference on its two edges.
  return new Or(Array.from({ length: 8 }, (_, i) => i + 1).map(diff => {
    const key = Pair.fnToKey((a, b) => Math.abs(a - b) === diff, 9);
    return new And([
      new Pair(key, `difference ${diff}`, cells[0], cells[1]),
      new Pair(key, `difference ${diff}`, cells[1], cells[2]),
    ]);
  }));
}

function presentingRule({ type, cells }) {
  if (type === 'renban') return new Renban(...cells);
  if (type === 'regionSum') return new RegionSumLine(...cells);
  if (type === 'nabner') return new PairX(nabnerKey, 'nabner', ...cells);
  if (type === 'whisper') return new Whisper(5, ...cells);
  if (type === 'palindrome') return new Palindrome(...cells);
  if (type === 'entropic') return new Entropic(...cells);
  if (type === 'parity') return new Modular(2, ...cells);
  return sameDifference(cells);
}

function shadeAll(cells, value) {
  return shade.at(cells).map(cell => new Given(cell, value));
}

function zipperWhenWet(line) {
  const { cells } = line;
  // These three branches respectively implement wet, dry, and mixed lines.
  return new Or([
    new And([...shadeAll(cells, WATER), new Zipper(...cells)]),
    new And([...shadeAll(cells, LAND), presentingRule(line)]),
    new And([presentingRule(line), new Zipper(...cells)]),
  ]);
}

return [
  new Shape('9x9'),
  new YinYang(),
  ...lines.map(zipperWhenWet),
];
