// Title: April 6, 2022: Multiples of 3
// Author: clover!
// Video: https://www.youtube.com/watch?v=AG01kJwi7DA
// Source: https://tinyurl.com/3mf9udfu

// Normal sudoku rules apply. Additionally, in each 3x3 region, every run of 3
// vertically adjacent or 3 horizontally adjacent cells (i.e. each of the
// box's 3 rows and 3 columns) must sum to a multiple of 3. No other clue
// types are drawn on this puzzle.

const graph = cellGraph('9x9');

// Givens, transcribed from the drawn grid.
const givens = [
  ['R1C1', 8], ['R1C4', 1], ['R1C6', 2], ['R1C9', 6],
  ['R3C4', 3], ['R3C6', 4], ['R3C9', 2],
  ['R4C1', 2], ['R4C3', 7], ['R4C5', 5], ['R4C8', 4],
  ['R6C2', 5], ['R6C5', 6], ['R6C7', 1], ['R6C9', 3],
  ['R7C1', 5], ['R7C4', 4], ['R7C6', 9],
  ['R9C1', 1], ['R9C4', 8], ['R9C6', 7], ['R9C9', 5],
];

// Each 3x3 box's 3 rows and 3 columns. `graph.boxes()` lists each box's cells
// row-major, so consecutive triples are its rows and strided triples are its
// columns. 9 boxes x 6 runs = 54 runs, each fed to the NFA below as its own
// segment.
const runs = graph.boxes().flatMap(box => [
  box.slice(0, 3), box.slice(3, 6), box.slice(6, 9),
  [box[0], box[3], box[6]], [box[1], box[4], box[7]], [box[2], box[5], box[8]],
]);

// Sum-mod-3 machine, scanned over all 54 runs as one multiSegment NFA. `sum`
// is the running total mod 3 within the current run. `accept` only inspects
// the final state (the last run), so every earlier run's total is checked as
// its trailing SEGMENT_BREAK is consumed, before the state resets to 0 for
// the next run; a run whose sum isn't a multiple of 3 rejects there.
const spec = NFA.encodeSpec({
  startState: { sum: 0 },
  transition: ({ sum }, value) => {
    if (value === SEGMENT_BREAK) {
      return sum % 3 === 0 ? { sum: 0 } : undefined;
    }
    return { sum: (sum + value) % 3 };
  },
  accept: ({ sum }) => sum % 3 === 0,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new NFA(spec, 'multipleOf3', ...runs),
];
