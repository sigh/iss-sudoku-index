// Title: The Parker Miracle
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=pc8RRH2Zj-c
// Source: https://sudokupad.app/BTGhbHLhJF

// Normal 6x6 sudoku uses the drawn 2x3 boxes. Box numbers run left-to-right,
// then top-to-bottom. Adjacent cells may not sum to either box number they touch;
// diagonal neighbours are constrained only when they share a box. The drawn > at
// R1C3/R1C4 points to the lower digit, making R1C3 greater.
const boxNumber = (row, col) => Math.floor((row - 1) / 2) * 2 + Math.floor((col - 1) / 3) + 1;
const cell = (row, col) => makeCellId(row, col);
const noSum = number => Pair.fnToKey((a, b) => a + b !== number, 6);

const neighborSums = [];
for (let row = 1; row <= 6; row++) {
  for (let col = 1; col <= 6; col++) {
    for (const [nextRow, nextCol] of [[row, col + 1], [row + 1, col]]) {
      if (nextRow > 6 || nextCol > 6) continue;
      for (const number of new Set([boxNumber(row, col), boxNumber(nextRow, nextCol)])) {
        neighborSums.push(new Pair(noSum(number), `not sum ${number}`, cell(row, col), cell(nextRow, nextCol)));
      }
    }
    for (const [nextRow, nextCol] of [[row + 1, col + 1], [row + 1, col - 1]]) {
      if (nextRow > 6 || nextCol < 1 || nextCol > 6 || boxNumber(row, col) !== boxNumber(nextRow, nextCol)) continue;
      const number = boxNumber(row, col);
      neighborSums.push(new Pair(noSum(number), `not diagonal sum ${number}`, cell(row, col), cell(nextRow, nextCol)));
    }
  }
}

return [
  new Shape('6x6'),
  ...neighborSums,
  new GreaterThan('R1C3', 'R1C4'),
];
