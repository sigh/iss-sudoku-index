// Title: Pack of Aces
// Author: Mormagli
// Video: https://www.youtube.com/watch?v=sNKXOKutB_4
// Source: https://sudokupad.app/640zvjabj2

// Normal Sudoku rules apply. Each pink line is a renban: a non-repeating set
// of consecutive digits in any order. A 1 may count as 10, so the alternative
// top-end set is 1 plus the line length minus one digits ending at 9. Orthogonal
// neighbours cannot be 1 and 9.

const graph = cellGraph('9x9');

// Pink line paths transcribed from the drawn lines.
const renbanLines = [
  ['R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R1C5', 'R1C4', 'R2C4', 'R3C4'],
  ['R1C8', 'R1C7', 'R2C7', 'R3C7'],
  ['R1C9', 'R2C9', 'R3C9', 'R3C8'],
  ['R1C6', 'R2C6', 'R3C6', 'R3C5'],
  ['R1C3', 'R2C3', 'R3C3', 'R3C2'],
  ['R5C2', 'R6C2', 'R7C2', 'R8C2'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C5'],
  ['R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9'],
  ['R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4'],
  ['R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1'],
  ['R7C4', 'R6C4', 'R6C3', 'R5C3', 'R4C3', 'R4C2', 'R5C1', 'R6C1'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R4C6', 'R5C7', 'R6C7', 'R7C7', 'R7C6', 'R6C6'],
  ['R4C4', 'R5C4'],
];

function aceRenban(cells) {
  const highRun = ['1'];
  for (let digit = 11 - cells.length; digit <= 9; digit++) highRun.push(String(digit));
  return new Or([
    new Renban(...cells),
    new ContainExact(highRun.join('_'), ...cells),
  ]);
}

const noOneNine = Pair.fnToKey(
  (a, b) => !((a === 1 && b === 9) || (a === 9 && b === 1)), 9);
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));
const adjacencyRules = [
  graph.makeReplicate(new Pair(noOneNine, 'not-1-9', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(new Pair(noOneNine, 'not-1-9', 'R1C1', 'R2C1'), verticalStarts),
];

return [
  new Shape('9x9'),
  new Given('R4C5', 5),
  ...renbanLines.map(aceRenban),
  ...adjacencyRules,
];
