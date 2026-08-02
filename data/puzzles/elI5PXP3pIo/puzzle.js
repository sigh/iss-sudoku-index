// Title: Whispering Regions
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=elI5PXP3pIo
// Source: https://sudokupad.app/glhzgch93y

// Normal sudoku rules apply. One line is drawn across the empty grid. The 3x3
// box borders divide it into segments. The sum of each segment must increase
// from one end of the line to the other. Adjacent digits along each segment
// (not the whole line) differ by at least 5.
//
// Two readings the encoding commits to, both from the rules sentences:
//  - "must increase" is strict: two neighbouring segment totals that are equal
//    are not an increase.
//  - "from one end of the line to the other" names neither end, and the art
//    draws no arrow, bulb or other directional mark, so both directions are
//    encoded as a disjunction.
// Nothing is omitted.

// The drawn line, in path order from its R8C1 end to its R5C7 end.
const line = [
  'R8C1', 'R7C1', 'R8C2', 'R8C3', 'R9C4', 'R9C5', 'R8C5', 'R7C5', 'R7C6',
  'R8C7', 'R8C8', 'R8C9', 'R7C9', 'R6C9', 'R6C8', 'R6C7', 'R6C6', 'R6C5',
  'R6C4', 'R5C4', 'R5C3', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2', 'R2C3',
  'R2C4', 'R1C5', 'R2C6', 'R1C7', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R5C7',
];

const boxOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// "The 3x3 box borders divide the line into segments": a segment ends wherever
// consecutive line cells fall in different boxes. This yields ten segments,
// each of which the source also redraws as its own separate stroke. The line
// enters box 6 twice, and those two visits are two segments, not one.
const segments = line.reduce((acc, cell) => {
  const current = acc[acc.length - 1];
  if (current && boxOf(current[0]) === boxOf(cell)) current.push(cell);
  else acc.push([cell]);
  return acc;
}, []);

// A segment lies inside a single box, so its digits are distinct; the longest
// segment here is 5 cells, whose largest possible total is 9+8+7+6+5 = 35.
// Totals above the bound are rejected only to keep the state count finite.
const longestSegment = Math.max(...segments.map(s => s.length));
let maxSegmentTotal = 0;
for (let i = 0; i < longestSegment; i++) maxSegmentTotal += 9 - i;

// Scans the segments in the order given and requires their totals to strictly
// increase in that order. State: `done` is the total of the last completed
// segment, `sum` the running total of the current one. SEGMENT_BREAK is where a
// segment closes and the two are compared. `done = 0` is the pre-first-segment
// value, which no segment total can tie.
const increasingTotals = NFA.encodeSpec({
  startState: { done: 0, sum: 0 },
  transition({ done, sum }, value) {
    if (value === SEGMENT_BREAK) {
      return sum > done ? { done: sum, sum: 0 } : undefined;
    }
    const next = sum + value;
    return next <= maxSegmentTotal ? { done, sum: next } : undefined;
  },
  // The final segment is closed by `accept` rather than by a break.
  accept: ({ done, sum }) => sum > done,
  // Every consumed symbol: each line cell, plus one break between segments.
  maxDepth: line.length + segments.length - 1,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  // Scoped to each segment, so no pair spanning a box border is constrained.
  ...segments.map(cells => new Whisper(5, ...cells)),
  new Or([
    new NFA(increasingTotals, 'totals increase towards R5C7', ...segments),
    new NFA(
      increasingTotals, 'totals increase towards R8C1',
      ...[...segments].reverse()),
  ]),
];
