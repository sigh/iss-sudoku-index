// Title: Curving Lasers
// Author: LNOMISL
// Video: https://www.youtube.com/watch?v=Vj6vfHbG1KI
// Source: https://sudokupad.app/jbg8h8300a
//
// Normal sudoku rules apply (default 3x3 boxes, no givens). Each of the 7
// drawn lines below carries one UFO icon at one end of its path: the digit
// in that endpoint cell equals the number of even digits on the whole line,
// itself included. Blue lines are region-sum lines (box-border segments sum
// equally, independently per line); green lines are German whisper lines
// (adjacent difference >= 5, ISS default); the red line is a parity line
// (adjacent digits alternate odd/even); grey lines carry no property beyond
// their UFO. Three white dots mark consecutive cells.

const graph = cellGraph('9x9');

// Drawn line paths, in path order, each with its UFO endpoint cell.
const lines = [
  { color: 'blue', cells: ['R9C4', 'R8C3', 'R7C2', 'R6C1', 'R5C1', 'R4C1', 'R3C2', 'R2C3'], ufo: 'R2C3' },
  { color: 'blue', cells: ['R2C6', 'R3C5', 'R4C4', 'R5C4', 'R6C5'], ufo: 'R2C6' },
  { color: 'green', cells: ['R3C4', 'R4C3', 'R5C3', 'R6C3', 'R7C4'], ufo: 'R7C4' },
  { color: 'green', cells: ['R7C6', 'R6C7', 'R5C7', 'R4C7', 'R3C6'], ufo: 'R7C6' },
  { color: 'red', cells: ['R1C5', 'R1C6', 'R1C7', 'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C8', 'R8C7', 'R8C6'], ufo: 'R8C6' },
  { color: 'grey', cells: ['R7C9', 'R8C9', 'R9C8'], ufo: 'R9C8' },
  { color: 'grey', cells: ['R1C2', 'R2C1', 'R3C1'], ufo: 'R1C2' },
];

// White-dot pairs (consecutive digits): the three edge-sized white-filled,
// black-bordered marks drawn between adjacent cells.
const whiteDots = [
  ['R3C8', 'R4C8'],
  ['R1C7', 'R1C8'],
  ['R6C5', 'R7C5'],
];

// UFO: the endpoint cell's own digit equals the count of even digits over
// the whole line (endpoint included). Modelled as one 2-segment NFA per
// line: segment 1 scans every non-endpoint cell, tallying evens seen;
// segment 2 is the single endpoint cell, which both contributes its own
// parity to the tally and supplies the target the final tally must equal.
const ufoSpec = NFA.encodeSpec({
  startState: { phase: 0, count: 0, target: null },
  transition: ({ phase, count, target }, value) => {
    if (value === SEGMENT_BREAK) return { phase: phase + 1, count, target };
    const isEven = (value % 2 === 0) ? 1 : 0;
    return {
      phase,
      count: count + isEven,
      target: phase === 1 ? value : target,
    };
  },
  accept: ({ phase, count, target }) => phase === 1 && count === target,
  maxDepth: 12, // longest line has 11 cells + 1 segment break
}, 9, { multiSegment: true });

const ufoConstraints = lines.map(({ cells, ufo }) => {
  const rest = cells.filter(c => c !== ufo);
  return new NFA(ufoSpec, 'ufo', rest, [ufo]);
});

const colorConstraints = lines.flatMap(({ color, cells }) => {
  if (color === 'blue') return [new RegionSumLine(...cells)];
  if (color === 'green') return [new Whisper(...cells)];
  if (color === 'red') return [new Modular(2, ...cells)];
  return []; // grey: decorative, no property beyond its UFO
});

return [
  new Shape('9x9'),
  ...colorConstraints,
  ...ufoConstraints,
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
