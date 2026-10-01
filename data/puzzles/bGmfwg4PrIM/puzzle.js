// Title: No Peeking - Markov's Order
// Author: Belamis
// Video: https://www.youtube.com/watch?v=bGmfwg4PrIM
// Source: https://sudokupad.app/llgqh0kzve

// Rules encoded:
// - Normal sudoku; given R4C1 = 4.
// - German whispers: adjacent digits on a green line differ by at least 5.
// - Killer cages: digits distinct, summing to the clue.
// - Placement order: digits are placed only in visible cells, and filling the
//   last visible cell reveals the next fog stage, so the stages are filled one
//   after another, each in any internal order. Each placed digit must be a
//   factor or multiple of the previously placed one, starting from the given 4.
//   Once all fog is revealed (after stage 14) order is free, so the final 31
//   cells are not part of the chain.
// The fog itself is solving UI and is not encoded.

const shape = new Shape('9x9');

const whisperLines = [
  ['R4C1', 'R4C2', 'R4C3', 'R5C2'],
  ['R4C8', 'R4C9', 'R3C9'],
  ['R6C4', 'R7C4'],
  ['R1C4', 'R1C5'],
];

const cages = [
  [14, 'R1C1', 'R1C2', 'R2C2'],
  [12, 'R4C7', 'R5C7'],
  [8, 'R5C3', 'R5C4'],
  [10, 'R5C9', 'R6C9'],
  [18, 'R6C8', 'R7C8', 'R7C9'],
  [7, 'R7C1', 'R8C1'],
  [6, 'R7C7', 'R8C7'],
  [27, 'R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5'],
];

// Fog stages in reveal order, from the trigger/effect chain: each stage is
// revealed when every cell of the previous stage holds a digit. The initially
// visible R4C2, R4C3 (beside the given R4C1) form stage 1.
const stages = [
  ['R4C2', 'R4C3'],
  ['R5C2', 'R4C7', 'R5C7'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R5C3', 'R5C4', 'R5C8'],
  ['R5C1', 'R4C8', 'R1C9'],
  ['R1C1', 'R1C2', 'R2C2'],
  ['R2C6', 'R6C4', 'R7C4', 'R9C9'],
  ['R6C1', 'R7C7', 'R8C7', 'R3C7'],
  ['R2C1', 'R1C4', 'R1C5', 'R4C6', 'R9C4'],
  ['R2C3', 'R4C4', 'R4C5', 'R6C7', 'R3C2'],
  ['R6C8', 'R7C8', 'R7C1'],
  ['R2C8', 'R3C9'],
  ['R1C3', 'R6C2', 'R7C2', 'R5C6', 'R8C8'],
  ['R8C1', 'R8C4', 'R8C5', 'R9C3'],
];

// Placement sequence overlay: VP<k> is the digit placed k-th after the given.
// Each stage's slice of slots holds the same multiset of digits as the
// stage's cells (SameValues), i.e. it is some ordering of that stage.
const numSlots = stages.reduce((n, s) => n + s.length, 0);
const slots = new Var('P', 'Placement order', numSlots);
const stageSlots = stages.map((s, i) => {
  const start = stages.slice(0, i).reduce((n, t) => n + t.length, 0);
  return slots.cells().slice(start, start + s.length);
});

const factorOrMultiple = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, shape);

return [
  shape,
  new Given('R4C1', 4),
  ...whisperLines.map((line) => new Whisper(5, ...line)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  slots,
  ...stages.map((cells, i) => new SameValues(2, ...cells, ...stageSlots[i])),
  // Consecutive placements, starting from the given 4.
  new Pair(factorOrMultiple, 'Factor or multiple', 'R4C1', ...slots.cells()),
];
