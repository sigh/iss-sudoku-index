// Title: Erbsenzahler
// Author: sujoyku and SamuPiano
// Video: https://www.youtube.com/watch?v=OirSnlNNrDk
// Source: https://sudokupad.app/z14kvlwqlh

// Rules encoded:
// - Normal sudoku (each row, column, box has digits 1-9 once) -- default
//   Shape('9x9') regions.
// - Split Peas: a drawn green line is cut into segments by the circles that
//   lie along it (an interior circle, not just the two ends). For each
//   segment, the sum of the strictly-interior cells must equal the two-digit
//   concatenation of the segment's two bounding circles' values, in either
//   order (10a+b or 10b+a). Encoded per segment as a custom NFA that records
//   the first circle's value, accumulates the interior sum, then checks the
//   last cell (the second circle) against both concatenations.
// - Counting Circles: a digit placed in a circle states exactly how many of
//   the 12 drawn circles hold that digit, and the rule's own note puts every
//   circle that also bounds a Split Peas segment into this same count, so
//   all 12 circles form one set. Encoded with the native CountingCircles
//   constraint over all circle cells.

const lines = [
  // Green line #0 waypoints -> cell path (source-drawn).
  ['R1C4', 'R2C3', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R5C3', 'R4C4',
   'R3C5', 'R2C6', 'R1C7', 'R1C8', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4',
   'R7C3', 'R8C2', 'R9C1'],
  // Green line #1 waypoints -> cell path (source-drawn).
  ['R2C6', 'R1C6', 'R1C5', 'R2C4', 'R3C3', 'R4C2'],
  // Green line #2 waypoints -> cell path (source-drawn).
  ['R3C7', 'R3C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C8', 'R7C8', 'R7C7', 'R7C6'],
];

// Circle overlay positions (source-drawn); 9 of these also sit on a line
// above (its endpoints and any interior cut points), 3 are standalone.
const circles = [
  'R4C1', 'R1C4', 'R6C2', 'R2C6', 'R5C9', 'R3C7', 'R9C1', 'R4C2',
  'R7C6', 'R7C5', 'R8C9', 'R5C7',
];
const circleSet = new Set(circles);

// Split each line's cell path into segments cut at each circle position
// along it; a segment runs from one circle to the next circle, inclusive.
const segments = [];
for (const line of lines) {
  const cutIdx = [];
  line.forEach((cell, i) => { if (circleSet.has(cell)) cutIdx.push(i); });
  for (let k = 0; k + 1 < cutIdx.length; k++) {
    segments.push(line.slice(cutIdx[k], cutIdx[k + 1] + 1));
  }
}

// State machine per segment length (cached, since several segments share a
// length): state = {i: cells seen so far, a: first cell's value, sum:
// running sum of interior cells, sink/done: true once the last cell closes
// one of the two valid concatenations}. `i` is this segment's own position
// counter (not the UI-only NUM_CELLS global), closed over via `numCells`.
// Once accepted, the state collapses to a fixed absorbing sink instead of
// continuing to grow `sum` -- the builder explores transitions generically
// (it does not know this machine is only ever fed exactly `numCells`
// values), so an unbounded counter past the accept point blows the 4096
// compile-time state limit even though it is never reached in practice.
const machineByLength = new Map();
const machineFor = (numCells) => {
  if (machineByLength.has(numCells)) return machineByLength.get(numCells);
  const spec = {
    startState: { i: 0, a: null, sum: 0, sink: false },
    transition: (state, value) => {
      if (state.sink) return state; // absorbing; not reached in practice
      const { i, a, sum } = state;
      if (i === 0) return { i: 1, a: value, sum: 0, sink: false };
      if (i === numCells - 1) {
        const b = value;
        if (sum === 10 * a + b || sum === 10 * b + a) {
          return { i: i + 1, a: 0, sum: 0, sink: true };
        }
        return undefined;
      }
      return { i: i + 1, a, sum: sum + value, sink: false };
    },
    accept: (state) => state.sink,
  };
  const machine = NFA.encodeSpec(spec, 9);
  machineByLength.set(numCells, machine);
  return machine;
};

const splitPeas = segments.map(
  (seg, idx) => new NFA(machineFor(seg.length), `SplitPea${idx}`, ...seg));

return [
  new Shape('9x9'),
  ...splitPeas,
  new CountingCircles(...circles),
];
