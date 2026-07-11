// Title: Empty Vessels
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=kTB2LzuY3HQ
// Source: https://sudokupad.app/9q82og2xas

// Normal sudoku rules apply. If the digit N appears in any of the four
// cells adjacent to a circle then it appears exactly N times adjacent to a
// circle across the grid. The 3x3 box borders divide blue lines into
// segments; each segment along an individual line has the same sum.
// Adjacent digits on red lines alternate between odd and even. Adjacent
// digits on green lines differ by at least 5. Digits on a pink line form a
// non-repeating consecutive set in any order.

const constraints = [new Shape('9x9')];

// Circles ("vessels"): each circle's four adjacent cells feed one global
// counting-circles pool. If digit N appears anywhere in the pool, it must
// appear exactly N times across the whole pool (CountingCircles enforces
// exactly this self-referential rule).
const circleCellGroups = [
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R7C5', 'R7C6', 'R8C5', 'R8C6'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9'],
  ['R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R5C7', 'R5C8', 'R6C7', 'R6C8'],
];
const circleCells = circleCellGroups.flat();
constraints.push(new CountingCircles(...circleCells));

// Blue line: box borders cut the line into segments, each segment along
// the line sums to the same total.
constraints.push(new RegionSumLine('R1C8', 'R1C7', 'R1C6'));

// Red line: adjacent digits alternate odd/even.
const oddEvenKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
constraints.push(
  new Pair(oddEvenKey, 'OddEven', 'R9C2', 'R9C3', 'R9C4'));

// Green lines: adjacent digits differ by at least 5 (default Whisper gap).
constraints.push(new Whisper(5, 'R7C8', 'R7C9', 'R6C9'));
constraints.push(new Whisper(5, 'R3C8', 'R4C9'));
constraints.push(new Whisper(5, 'R6C5', 'R7C6'));

// Pink line: non-repeating consecutive set, any order.
constraints.push(new Renban('R6C2', 'R6C3', 'R7C4'));

return constraints;
