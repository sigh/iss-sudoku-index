// Title: Roundabout
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=rbB6x0De6t8
// Source: https://sudokupad.app/ba2j4ki9y7

// Normal sudoku, increasing thermometers, and clockwise digit-sized perimeter
// jumps for which every starting cell eventually returns to itself.
const shape = new Shape('9x9');
// Grey shafts, listed from their matching grey bulb.
const thermometers = [
  ['R1C1','R2C1','R3C1'],
  ['R9C1','R9C2','R9C3'],
  ['R9C9','R8C9','R7C8'],
  ['R1C9','R1C8','R2C7'],
  ['R4C8','R3C9','R2C8'],
  ['R4C2','R4C1','R3C2','R2C3'],
  ['R4C3','R5C3','R6C2','R7C1'],
  ['R5C4','R5C5','R6C6'],
].map(cells => new Thermo(...cells));
const perimeter = [
  ...Array.from({length: 9}, (_, i) => makeCellId(1, i + 1)),
  ...Array.from({length: 8}, (_, i) => makeCellId(i + 2, 9)),
  ...Array.from({length: 8}, (_, i) => makeCellId(9, 8 - i)),
  ...Array.from({length: 7}, (_, i) => makeCellId(8 - i, 1)),
];
// A finite function has every vertex on a cycle iff it is a permutation.
// Each predicate forbids two sources from sharing their clockwise destination.
// The 496 pairs cover all pairs of the 32 perimeter cells.
const jumps = perimeter.flatMap((cell, i) =>
  perimeter.slice(i + 1).map((other, offset) => {
    const j = i + offset + 1;
    const key = Pair.fnToKey((a, b) => (i + a) % 32 !== (j + b) % 32, shape);
    return new Pair(key, 'distinct jump destinations', cell, other);
  }));
return [shape, ...thermometers, ...jumps];
