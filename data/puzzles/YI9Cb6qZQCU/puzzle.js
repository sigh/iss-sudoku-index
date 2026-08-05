// Title: Consecutive Entanglement
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=YI9Cb6qZQCU
// Source: https://app.crackingthecryptic.com/sudoku/DbQMHDMhQP

// Normal Sudoku rules apply.
// Entanglement: consecutive digits in one 3x3 box must share a row or column.
// This is equivalent to each digit sharing a unit with exactly two instances of
// each consecutive digit: the box occurrence also shares its row or column.
// Arrow routes are transcribed from the nine drawn circle-and-arrow clues.

const nonConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const entanglement = [];
for (let boxRow = 1; boxRow <= 9; boxRow += 3) {
  for (let boxCol = 1; boxCol <= 9; boxCol += 3) {
    const cells = [];
    for (let row = boxRow; row < boxRow + 3; row++) {
      for (let col = boxCol; col < boxCol + 3; col++) cells.push({row, col});
    }
    for (let first = 0; first < cells.length; first++) {
      for (let second = first + 1; second < cells.length; second++) {
        const a = cells[first];
        const b = cells[second];
        if (a.row !== b.row && a.col !== b.col) {
          // Diagonally placed box cells may not hold consecutive digits.
          entanglement.push(new Pair(
            nonConsecutive, 'Entanglement',
            makeCellId(a.row, a.col), makeCellId(b.row, b.col)));
        }
      }
    }
  }
}

return [
  new Shape('9x9'),
  ...entanglement,
  new Arrow('R9C8', 'R8C8', 'R8C9'),
  new Arrow('R6C7', 'R5C7', 'R5C8'),
  new Arrow('R4C6', 'R4C5', 'R5C5', 'R6C5'),
  new Arrow('R1C9', 'R2C8', 'R3C8', 'R4C9', 'R5C9'),
  new Arrow('R2C4', 'R2C5', 'R2C6'),
  new Arrow('R2C4', 'R1C3', 'R1C2'),
  new Arrow('R1C4', 'R1C5', 'R1C6'),
  new Arrow('R1C1', 'R2C2', 'R3C2', 'R4C1', 'R5C1', 'R6C1'),
  new Arrow('R9C2', 'R8C2', 'R9C3'),
];
