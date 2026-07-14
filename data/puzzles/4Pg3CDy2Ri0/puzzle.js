// Title: Rip City
// Author: Merdock
// Video: https://www.youtube.com/watch?v=4Pg3CDy2Ri0
// Source: https://sudokupad.app/r3n9cwda1t

// Full encoding: negative diagonal (no repeats), a combined 4-cell corner
// killer cage (sum 16), a 17-cell parity line whose adjacent digits
// alternate odd/even, and 33 white Kropki dots (consecutive digits). 14 of
// the dots sit on the parity line's 16 edges; the other 19 sit elsewhere in
// the grid and are still real (empirically load-bearing: omitting them
// leaves hundreds of extra solutions, and every one of the 19 is satisfied
// by the known solution, which a decorative reading would not explain).
//
// Two of the line's 16 edges are drawn without a dot -- the rules text ("all
// dots are given") makes that explicitly not-consecutive, so those two pairs
// get a negative Pair constraint. No such negative inference is extended to
// the 19 off-line dots: the rules text scopes the "all dots are given"
// guarantee to cells "adjacent... along the red line", and broader readings
// (a global strict Kropki; a negative inference over every undotted pair
// between two dot-touched cells) were tested and rejected against the known
// solution. This leaves some cells under-constrained relative to the
// encoded rules (13 solutions on a complete search; still accepts the known
// solution).

const line = [
  'R9C5', 'R8C5', 'R8C4', 'R7C4', 'R7C3', 'R6C3', 'R6C4', 'R6C5',
  'R5C5', 'R4C5', 'R4C6', 'R4C7', 'R3C7', 'R3C6', 'R2C6', 'R2C5', 'R1C5',
];

// All 33 drawn white dots (consecutive digits): 14 on the parity line's
// edges, 19 elsewhere in the grid.
const allDots = [
  ['R9C5', 'R8C5'], ['R8C4', 'R7C4'], ['R7C4', 'R7C3'], ['R7C3', 'R6C3'],
  ['R6C3', 'R6C4'], ['R6C4', 'R6C5'], ['R6C5', 'R5C5'], ['R5C5', 'R4C5'],
  ['R4C5', 'R4C6'], ['R4C6', 'R4C7'], ['R4C7', 'R3C7'], ['R3C7', 'R3C6'],
  ['R3C6', 'R2C6'], ['R2C5', 'R1C5'],
  ['R1C6', 'R1C7'], ['R1C7', 'R2C7'], ['R2C8', 'R3C8'], ['R3C9', 'R4C9'],
  ['R5C9', 'R6C9'], ['R6C9', 'R7C9'], ['R7C8', 'R7C9'], ['R7C8', 'R8C8'],
  ['R8C7', 'R9C7'], ['R9C6', 'R9C7'], ['R9C3', 'R9C4'], ['R8C3', 'R9C3'],
  ['R7C1', 'R7C2'], ['R6C1', 'R7C1'], ['R4C1', 'R5C1'], ['R3C1', 'R4C1'],
  ['R2C2', 'R3C2'], ['R1C3', 'R2C3'], ['R1C3', 'R1C4'],
];

// The two edges along the drawn line that carry no dot -- explicitly not
// consecutive.
const notConsecutiveOnLine = [
  ['R8C5', 'R8C4'],
  ['R2C6', 'R2C5'],
];

const parityAlternates = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const notConsecutive = Pair.fnToKey((a, b) => a !== b + 1 && a !== b - 1, 9);

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Cage(16, 'R1C1', 'R1C9', 'R9C1', 'R9C9'),
  new Pair(parityAlternates, 'parity alternates', ...line),
  ...allDots.map(cells => new WhiteDot(...cells)),
  ...notConsecutiveOnLine.map(
    cells => new Pair(notConsecutive, 'not consecutive', ...cells)),
];
