// Title: Less Than Three
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=tkgMIfd-7AY
// Source: https://sudokupad.app/misno24ves

// Normal sudoku rules apply. A white heart on a cell edge means the two
// digits differ by less than 3 (i.e. by 1 or 2); a black heart on a cell
// edge means the larger digit divided by the smaller is less than 3.
// Regions are the ordinary nine 3x3 boxes, so no explicit region override
// is needed.

// Custom pairwise relations: ISS has no native "difference < k" or
// "ratio < k" class (WhiteDot/BlackDot are the fixed k=1/k=2 cases), so
// each is a Pair.fnToKey predicate over the digit range.
const diffLessThan3 = Pair.fnToKey((a, b) => Math.abs(a - b) < 3, 9);
const ratioLessThan3 = Pair.fnToKey((a, b) => Math.max(a, b) / Math.min(a, b) < 3, 9);

// White heart edges, transcribed from the outline-heart overlay marks.
const whiteHeartEdges = [
  ['R2C2', 'R2C3'], ['R2C2', 'R3C2'], ['R2C3', 'R2C4'], ['R2C6', 'R2C7'],
  ['R2C6', 'R3C6'], ['R2C7', 'R2C8'], ['R3C1', 'R3C2'], ['R3C5', 'R3C6'],
  ['R3C8', 'R3C9'], ['R4C8', 'R4C9'], ['R5C2', 'R6C2'], ['R5C5', 'R6C5'],
  ['R5C8', 'R5C9'], ['R6C3', 'R7C3'], ['R6C5', 'R7C5'], ['R6C7', 'R7C7'],
  ['R7C1', 'R8C1'], ['R7C3', 'R7C4'], ['R7C6', 'R7C7'], ['R7C6', 'R8C6'],
  ['R7C9', 'R8C9'], ['R8C1', 'R8C2'], ['R8C2', 'R9C2'], ['R8C5', 'R8C6'],
  ['R8C5', 'R9C5'], ['R8C8', 'R8C9'],
];

// Black heart edges, transcribed from the filled-heart overlay marks.
const blackHeartEdges = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C3', 'R1C4'], ['R1C4', 'R1C5'],
  ['R1C5', 'R1C6'], ['R1C6', 'R1C7'], ['R1C7', 'R1C8'], ['R1C8', 'R1C9'],
  ['R2C4', 'R3C4'], ['R2C8', 'R3C8'], ['R3C4', 'R3C5'], ['R3C5', 'R4C5'],
  ['R4C1', 'R4C2'], ['R5C1', 'R5C2'], ['R5C4', 'R5C5'], ['R5C4', 'R6C4'],
  ['R5C5', 'R5C6'], ['R5C6', 'R6C6'], ['R5C8', 'R6C8'], ['R6C2', 'R6C3'],
  ['R6C4', 'R6C5'], ['R6C5', 'R6C6'], ['R6C7', 'R6C8'], ['R7C4', 'R8C4'],
  ['R8C4', 'R8C5'], ['R8C8', 'R9C8'], ['R9C1', 'R9C2'], ['R9C2', 'R9C3'],
  ['R9C3', 'R9C4'], ['R9C4', 'R9C5'], ['R9C5', 'R9C6'], ['R9C6', 'R9C7'],
  ['R9C7', 'R9C8'], ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...whiteHeartEdges.map(([a, b]) => new Pair(diffLessThan3, 'white heart', a, b)),
  ...blackHeartEdges.map(([a, b]) => new Pair(ratioLessThan3, 'black heart', a, b)),
];
