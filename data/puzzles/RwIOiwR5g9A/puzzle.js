// Title: Focus on Symmetry 2
// Author: Mad-Tyas
// Video: https://www.youtube.com/watch?v=RwIOiwR5g9A
// Source: https://sudokupad.app/r7eczqz83l

const lines = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C4', 'R3C3', 'R3C2', 'R2C1', 'R1C1'],
  ['R9C9', 'R8C9', 'R7C8', 'R7C7', 'R6C6', 'R7C5', 'R8C5', 'R9C5'],
  ['R3C7', 'R3C8', 'R3C9', 'R4C8', 'R4C7'],
  ['R7C3', 'R7C2', 'R7C1', 'R6C2', 'R6C3'],
  ['R3C1', 'R4C1', 'R5C2'],
  ['R7C9', 'R6C9', 'R5C8'],
  ['R3C6', 'R4C5', 'R5C4', 'R5C3', 'R4C2'],
  ['R7C4', 'R6C5', 'R5C6', 'R5C7', 'R6C8'],
  ['R2C3', 'R3C4'],
  ['R7C6', 'R8C7'],
];

const gridCells = Array.from({length: 81}, (_, i) =>
  makeCellId(Math.floor(i / 9) + 1, i % 9 + 1));
const sudokuDigits = Array.from({length: 9}, (_, i) => i + 1);
const gridGraph = cellGraph('9x9');
const markerVars = new Var('M', 'Focus markers', 81);
const focusDigitVars = new Var('F', 'Focus digits by row', 9);
const markerOverlay = gridGraph.makeOverlay('VM');
const markers = markerOverlay.cells();
const focusDigits = focusDigitVars.cells();

const rows = Array.from({length: 9}, (_, row) =>
  Array.from({length: 9}, (_, col) => row * 9 + col));
const columns = Array.from({length: 9}, (_, col) =>
  Array.from({length: 9}, (_, row) => row * 9 + col));
const boxes = Array.from({length: 9}, (_, box) => {
  const firstRow = Math.floor(box / 3) * 3;
  const firstCol = (box % 3) * 3;
  return Array.from({length: 9}, (_, offset) =>
    (firstRow + Math.floor(offset / 3)) * 9 + firstCol + offset % 3);
});

const oneFocusPerUnit = [...rows, ...columns, ...boxes].map(unit =>
  new ContainExact('2', ...unit.map(i => markers[i])));

const focusDigitByRow = rows.map((row, rowIndex) => new Or(
  row.map(i => new And([
    new Given(markers[i], 2),
    new Sum(0, gridCells[i], [focusDigits[rowIndex], -1]),
  ]))
));

const lineSegments = lines.map(line => {
  const segments = [];
  for (const cell of line) {
    const {row, col} = parseCellId(cell);
    const box = Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
    if (!segments.length || segments.at(-1).box !== box) {
      segments.push({box, cells: []});
    }
    segments.at(-1).cells.push(cell);
  }
  return segments.map(segment => segment.cells);
});

// Each alternative fixes which cells on a line are Focus Cells, then compares
// segment sums after replacing those cells' digits with their coordinate sums.
const regionSumLines = lines.map((line, lineIndex) => new Or(
  Array.from({length: 2 ** line.length}, (_, mask) => {
    const isFocus = cell => (mask & (1 << line.indexOf(cell))) !== 0;
    const markerChoices = line.map(cell => new Given(
      markers[gridCells.indexOf(cell)], isFocus(cell) ? 2 : 1));
    const segments = lineSegments[lineIndex];
    const first = segments[0];
    const firstConstant = first.filter(isFocus).reduce((total, cell) => {
      const {row, col} = parseCellId(cell);
      return total + row + col;
    }, 0);
    const equalities = segments.slice(1).map(segment => {
      const segmentConstant = segment.filter(isFocus).reduce((total, cell) => {
        const {row, col} = parseCellId(cell);
        return total + row + col;
      }, 0);
      const firstDigits = first.filter(cell => !isFocus(cell));
      const segmentDigits = segment.filter(cell => !isFocus(cell));
      if (segmentConstant === firstConstant &&
          firstDigits.length && segmentDigits.length) {
        return new EqualSum(firstDigits, segmentDigits);
      }
      return new Sum(
        segmentConstant - firstConstant,
        ...firstDigits,
        ...segmentDigits.map(cell => [cell, -1]),
      );
    });
    return new And([...markerChoices, ...equalities]);
  })
));

return [
  new Shape('9x9'),
  markerVars,
  focusDigitVars,
  markerOverlay.makeReplicate(new Given(markers[0], 1, 2)),
  ...focusDigits.map(cell => new Given(cell, ...sudokuDigits)),
  new AllDifferent(...focusDigits),
  ...oneFocusPerUnit,
  ...focusDigitByRow,
  ...regionSumLines,
];
