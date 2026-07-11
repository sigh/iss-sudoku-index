// Title: Synergy
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=GggK620f52I
// Source: https://sudokupad.app/hq2d86hgi0

// Normal sudoku rules apply. All arrows act as both modular arrows and
// entropic arrows: the digit on an arrow cell counts how many cells,
// starting at the arrow cell and continuing in the indicated direction to
// the edge of the grid (including the arrow cell itself), share its mod-3
// remainder, AND separately counts how many of those same cells share its
// entropic group (123 / 456 / 789) -- both counts must equal the digit.
//
// Encoding: each arrow ray is a fixed, known cell sequence (starting cell
// first). Two NFAs run over the same ray: one counts mod-3 matches, the
// other counts entropic-group matches, each against the target value fixed
// by the first digit read (the first cell counts toward both by
// definition). Kept as two small per-invariant machines (rather than one
// combined machine) to stay well under the compiled-state limit. Each
// machine kills the branch once its count exceeds the target, and accepts
// only when the final count equals the target.

const entropicGroup = (v) => Math.floor((v - 1) / 3);

const makeCounterSpec = (matches) => ({
  startState: null,
  transition: (state, value) => {
    if (state === null) {
      return { target: value, count: 1 };
    }
    const { target, count } = state;
    const newCount = count + (matches(value, target) ? 1 : 0);
    if (newCount > target) return undefined;
    return { target, count: newCount };
  },
  accept: (state) => state !== null && state.count === state.target,
});

const encodedMod3 = NFA.encodeSpec(
  makeCounterSpec((value, target) => value % 3 === target % 3), 9);
const encodedEntropic = NFA.encodeSpec(
  makeCounterSpec((value, target) => entropicGroup(value) === entropicGroup(target)), 9);

const rays = [
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'],
  ['R7C7', 'R8C6', 'R9C5'],
  ['R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R5C4', 'R4C3', 'R3C2', 'R2C1'],
  ['R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'],
];

return [
  new Shape('9x9'),
  ...rays.map((ray) => new NFA(encodedMod3, 'ArrowMod3', ...ray)),
  ...rays.map((ray) => new NFA(encodedEntropic, 'ArrowEntropic', ...ray)),
];
