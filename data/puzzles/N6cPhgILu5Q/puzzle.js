// Title: Sumthing's Very Wrong
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=N6cPhgILu5Q
// Source: https://app.crackingthecryptic.com/sudoku/h6JTfRmMB2
//
// Normal sudoku. Each arrow has a bulb cell (no printed value) and an arm of
// further cells. An arrow is "correct" when the arm digits sum to the bulb
// digit, "incorrect" otherwise -- the solver works out which from the digits
// alone, so correctness is not extra puzzle state, just a fact about the grid.
// Each outside total is the sum, over the arrows whose bulb lies in that
// row/column, of the bulb digit *for the correct ones only* (0 for an
// incorrect arrow's bulb).
//
// Arrow bulb+arm cells and the outside totals are transcribed from the drawn
// arrow paths and their bulb circles.

// bulb -> arm cells, in path order.
const ARROWS = {
  R1C1: ['R1C2', 'R2C2', 'R3C2', 'R4C1', 'R5C1'],
  R1C9: ['R1C8', 'R2C8', 'R3C8', 'R4C9', 'R5C9'],
  R1C5: ['R2C5', 'R3C5'],
  R1C6: ['R2C6', 'R3C6'],
  R1C4: ['R2C4', 'R3C4'],
  R7C1: ['R7C2', 'R7C3'],
  R8C1: ['R8C2', 'R8C3'],
  R9C1: ['R9C2', 'R9C3'],
  R8C9: ['R8C8', 'R8C7'],
  R9C9: ['R9C8', 'R9C7'],
  R9C5: ['R8C5', 'R7C5'],
  R7C9: ['R7C8', 'R7C7'],
  R4C5: ['R4C6', 'R4C7'],
  R6C2: ['R5C2', 'R4C2'],
  R6C3: ['R5C3', 'R4C3'],
  R6C7: ['R5C7', 'R4C7'],
  R6C8: ['R5C8', 'R4C8'],
  R3C7: ['R4C6'],
  R3C3: ['R4C4'],
  R6C4: ['R7C4', 'R8C3'],
  R6C6: ['R7C6', 'R8C7'],
};

// Outside-clue lanes: each lists the bulbs (in reading order) whose arrows lie
// in that row/column, with the printed total.
const LANES = [
  { total: 17, bulbs: ['R1C1', 'R1C4', 'R1C5', 'R1C6', 'R1C9'] }, // left R1
  { total: 9, bulbs: ['R3C3', 'R3C7'] },                          // left R3
  { total: 26, bulbs: ['R6C2', 'R6C3', 'R6C4', 'R6C6', 'R6C7', 'R6C8'] }, // left R6
  { total: 8, bulbs: ['R7C1', 'R7C9'] },                          // left R7
  { total: 9, bulbs: ['R8C1', 'R8C9'] },                          // left R8
  { total: 13, bulbs: ['R9C1', 'R9C5', 'R9C9'] },                 // left R9
  { total: 17, bulbs: ['R1C1', 'R7C1', 'R8C1', 'R9C1'] },         // top C1
  { total: 15, bulbs: ['R3C3', 'R6C3'] },                         // top C3
  { total: 19, bulbs: ['R1C5', 'R4C5', 'R9C5'] },                 // top C5
  { total: 9, bulbs: ['R3C7', 'R6C7'] },                          // top C7
  { total: 17, bulbs: ['R1C9', 'R7C9', 'R8C9', 'R9C9'] },         // top C9
];

// One compiled NFA spec per distinct outside total (several lanes share a
// total). Segments are one per arrow: [bulb, ...arm]. State carries only the
// current arrow's (target, armSum) -- target === null doubles as "expecting
// this segment's bulb cell next" -- plus the lane's running total, each
// clamped as soon as it can only fail: armSum at target+1 (arm can't still
// equal target above that), laneTotal at total+1 (a sink: once the lane's sum
// already exceeds the clue it can never come back down). A SEGMENT_BREAK (or
// the end of the scan, via `accept`) folds the just-finished arrow's
// contribution -- its bulb value if the arm summed to it, else 0 -- into
// laneTotal before the next arrow starts.
const laneSpecCache = new Map();
function laneSpec(total) {
  if (laneSpecCache.has(total)) return laneSpecCache.get(total);
  const sink = total + 1;
  const fold = (state) => {
    const contributes = state.armSum === state.target;
    return Math.min(state.laneTotal + (contributes ? state.target : 0), sink);
  };
  const spec = NFA.encodeSpec({
    startState: { target: null, armSum: 0, laneTotal: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { target: null, armSum: 0, laneTotal: fold(state) };
      }
      if (state.target === null) {
        return { target: value, armSum: 0, laneTotal: state.laneTotal };
      }
      const armSum = Math.min(state.armSum + value, state.target + 1);
      return { target: state.target, armSum, laneTotal: state.laneTotal };
    },
    accept: (state) => fold(state) === total,
  }, 9, { multiSegment: true });
  laneSpecCache.set(total, spec);
  return spec;
}

const laneConstraints = LANES.map(({ total, bulbs }) =>
  new NFA(
    laneSpec(total),
    'ArrowLane',
    ...bulbs.map(bulb => [bulb, ...ARROWS[bulb]])));

return [
  new Shape('9x9'),
  ...laneConstraints,
];
