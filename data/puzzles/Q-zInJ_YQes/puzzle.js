// Title: Six Seven
// Author: Zentoxe
// Video: https://www.youtube.com/watch?v=Q-zInJ_YQes
// Source: https://sudokupad.app/txhi4w5d14

// Cages are sums with repeats allowed. All horizontal ordered 6-7 pairs are
// given, so every unmarked horizontal edge forbids exactly (left, right)=(6, 7).
const graph = cellGraph('9x9');
const marked67Starts = new Set(['R1C1', 'R3C7', 'R7C2', 'R9C8']);
const unmarkedHorizontalStarts = graph.rows()
  .flatMap(row => row.slice(0, -1))
  .filter(cell => !marked67Starts.has(cell));
const noUnmarked67Key = Pair.fnToKey((left, right) => left !== 6 || right !== 7, 9);
const noUnmarked67 = graph.makeReplicate(
  new Pair(noUnmarked67Key, 'no unmarked 67', 'R1C1', 'R1C2'),
  unmarkedHorizontalStarts,
);

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Given('R1C1', 6), new Given('R1C2', 7),
  new Given('R3C7', 6), new Given('R3C8', 7),
  new Given('R7C2', 6), new Given('R7C3', 7),
  new Given('R9C8', 6), new Given('R9C9', 7),
  new Sum(6, 'R1C4', 'R1C5'),
  new Sum(7, 'R1C6', 'R1C7'),
  new Sum(67,
    'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R5C3',
    'R5C4', 'R6C1', 'R6C4', 'R7C1', 'R7C4', 'R8C1', 'R8C2', 'R8C3', 'R8C4'),
  new Sum(67,
    'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C9', 'R4C8', 'R4C9', 'R5C7', 'R5C8',
    'R6C7', 'R7C7', 'R8C7'),
  new V('R3C5', 'R3C6'),
  new V('R2C2', 'R2C3'),
  new X('R2C9', 'R3C9'),
  noUnmarked67,
];
