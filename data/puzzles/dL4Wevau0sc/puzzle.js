// Title: Slowly catchy catchy slowly
// Author: Edward
// Video: https://www.youtube.com/watch?v=dL4Wevau0sc
// Source: https://sudokupad.app/f8yz6eao3d

// Normal Sudoku; grey thermometers are nondecreasing from their bulbs;
// pink lines are palindromes. Each outside number supplies both a diagonal
// sum and an X-sum in its row or column. There are no negative constraints.
const shape = new Shape('9x9');
const geometry = cellGeometry(shape);
// Drawn grey shafts, listed from their matching grey bulb discs.
const thermos = [
  ['R7C9','R6C8','R7C7','R6C6','R5C5','R4C4','R3C3','R4C2','R3C1'],
  ['R6C3','R7C4','R8C5','R9C6'],
  ['R4C7','R3C6','R2C5','R1C4'],
];
// The predicate permits equality, unlike a strict thermometer.
const slowKey = Pair.fnToKey((a, b) => a <= b, shape);
// Drawn pink strokes, including cells crossed by grey bulb discs.
const palindromes = [
  ['R2C9','R3C8','R4C7','R5C6','R4C5','R3C4'],
  ['R8C1','R7C2','R6C3','R5C4','R6C5','R7C6'],
];
// Printed outside badges and their arrow-indicated diagonals / orthogonal lanes.
const clues = [
  {sum:40, diagonal:['R4C1','R5C2','R6C3','R7C4','R8C5','R9C6'], lane:Array.from({length:9},(_,i)=>makeCellId(3,i+1))},
  {sum:20, diagonal:['R6C9','R5C8','R4C7','R3C6','R2C5','R1C4'], lane:Array.from({length:9},(_,i)=>makeCellId(7,9-i))},
  {sum:45, diagonal:['R1C2','R2C3','R3C4','R4C5','R5C6','R6C7','R7C8','R8C9'], lane:Array.from({length:9},(_,i)=>makeCellId(i+1,1))},
];
return [
  shape,
  ...thermos.map(cells => new Pair(slowKey, 'Slow thermometer', ...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...clues.map(clue => LittleKiller.fromCells(clue.sum, clue.diagonal, geometry)),
  ...clues.map(clue => XSum.fromCells(clue.sum, clue.lane, geometry)),
];
