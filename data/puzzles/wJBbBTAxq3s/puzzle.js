// Title: Unique Under the Fog 6.0
// Author: Visumation
// Video: https://www.youtube.com/watch?v=wJBbBTAxq3s
// Source: https://sudokupad.app/hvtrbv1n24

// Each clue family is globally non-repeating. X-sum membership is dynamic, so
// cross-line equality is forbidden only when both positions are in their sums.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const littleKillerCells = [
  ...graph.ray('R1C7', 1, 1),
  ...graph.ray('R7C1', 1, 1),
  ...graph.ray('R8C9', 1, -1),
];

const renbans = [
  ['R1C9', 'R2C8', 'R3C7'],
  ['R9C9', 'R8C8', 'R7C8'],
  ['R6C6', 'R7C6', 'R8C5'],
];

const whispers = [
  ['R5C9', 'R5C8', 'R4C7'],
  ['R2C2', 'R3C2', 'R3C3', 'R2C3', 'R2C2'],
];
const whisperCells = [...new Set(whispers.flat())];

const regionSumSegments = [
  [['R4C3', 'R5C3', 'R6C3'], ['R5C4']],
  [['R3C6', 'R3C5'], ['R4C5', 'R4C6']],
];
const regionSumCells = regionSumSegments.flat(2);

const rowXSum = graph.ray('R9C1', 0, 1);
const columnXSum = graph.ray('R1C9', 1, 0);

function inactiveAt(control, position) {
  return position === 1
    ? []
    : [new Given(
      control,
      ...Array.from({ length: position - 1 }, (_, index) => index + 1),
    )];
}

const xSumGlobalNonRepeats = rowXSum.flatMap((rowCell, rowIndex) =>
  columnXSum.flatMap((columnCell, columnIndex) => {
    if (rowCell === columnCell) return [];
    return [new Or([
      ...inactiveAt(rowXSum[0], rowIndex + 1),
      ...inactiveAt(columnXSum[0], columnIndex + 1),
      new AllDifferent(rowCell, columnCell),
    ])];
  })
);

return [
  new Shape('9x9'),

  LittleKiller.fromCells(10, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R7C1', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R8C9', 1, -1), geometry),
  new AllDifferent(...littleKillerCells),

  XSum.fromCells(19, rowXSum, geometry),
  XSum.fromCells(19, columnXSum, geometry),
  ...xSumGlobalNonRepeats,

  ...renbans.map(cells => new Renban(...cells)),
  new AllDifferent(...renbans.flat()),

  ...whispers.map(cells => new Whisper(5, ...cells)),
  new AllDifferent(...whisperCells),

  ...regionSumSegments.map(segments => new EqualSum(...segments)),
  new AllDifferent(...regionSumCells),
];
