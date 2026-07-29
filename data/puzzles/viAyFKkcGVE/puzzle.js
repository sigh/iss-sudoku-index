// Title: Warming Sets
// Author: Teal
// Video: https://www.youtube.com/watch?v=viAyFKkcGVE
// Source: https://sudokupad.app/k9p714r5cw

// Each six-cell house contains distinct values drawn from 1-9; the chosen
// six-value set is allowed to vary from house to house.
const shape = new Shape('6x6', 9);
const graph = cellGraph(shape);

// The grey thermometer labels the successive *row totals*, from the bulb at
// Row 6 toward Row 1. Compare each adjacent pair of rows separately.
const decreasingRowPair = NFA.encodeSpec({
  startState: {index: 0, delta: 0},
  transition: (state, value) => {
    // The stream interleaves upper/lower cells, so delta stays in -48..48.
    const delta = state.delta + (state.index % 2 === 0 ? value : -value);
    return {index: state.index + 1, delta};
  },
  accept: state => state.index === 12 && state.delta > 0,
  maxDepth: 12,
}, shape);

// The three entropy bands must each occur once on the three-cell red line.
const entropyLine = NFA.encodeSpec({
  startState: {low: 0, middle: 0, high: 0},
  transition: (state, value) => {
    const band = value <= 3 ? 'low' : value <= 6 ? 'middle' : 'high';
    const count = state[band] + 1;
    return count <= 1 ? {...state, [band]: count} : undefined;
  },
  accept: state => state.low === 1 && state.middle === 1 && state.high === 1,
  maxDepth: 3,
}, shape);

const allRows = Array.from({length: 6}, (_, row) => graph.row(row + 1));

return [
  shape,
  ...allRows.slice(0, -1).map((row, index) => new NFA(decreasingRowPair,
    `Row ${index + 1} sum exceeds Row ${index + 2} sum`,
    ...row.flatMap((cell, column) => [cell, allRows[index + 1][column]]))),
  // The blue path's four box-separated segments are transcribed in path order.
  new EqualSum(
    ['R1C6', 'R1C5', 'R1C4'],
    ['R2C3'],
    ['R3C3', 'R4C3'],
    ['R5C3', 'R6C3'],
  ),
  new NFA(entropyLine, 'one digit from each entropy band', 'R1C1', 'R1C2', 'R1C3'),
  new Whisper(5, 'R5C3', 'R5C4', 'R5C5'),
  new Arrow('R3C4', 'R4C5', 'R5C5'),
  new Arrow('R2C3', 'R2C4', 'R3C4', 'R4C4'),
  new Arrow('R4C1', 'R3C1', 'R3C2'),
  new BlackDot('R2C5', 'R3C5'),
  new BlackDot('R3C1', 'R3C2'),
  new BlackDot('R6C5', 'R6C6'),
];
