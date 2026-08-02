// Title: Rotational Disks
// Author: Leonhard Kohl-Lorting
// Video: https://www.youtube.com/watch?v=STlbZKN4EtU
// Source: https://sudokupad.app/lqvpt4f0lv

// Normal Sudoku applies. Opposite cells in each marked 5x5 disk sum to 10;
// a disk centre therefore has value 5. The listed killer cages show their sums.
const complementKey = Pair.fnToKey((a, b) => a + b === 10, 9);

function diskPairs(center, name) {
  const { row, col } = parseCellId(center);
  return [-2, -1, 0, 1, 2].flatMap(dr =>
    [-2, -1, 0, 1, 2].flatMap(dc =>
      dr < 0 || (dr === 0 && dc < 0)
        ? [new Pair(
          complementKey, name,
          makeCellId(row + dr, col + dc), makeCellId(row - dr, col - dc))]
        : []));
}

return [
  new Shape('9x9'),
  new Given('R3C3', 5),
  new Given('R5C7', 5),
  // The red and blue circle centres define the two 5x5 disks.
  ...diskPairs('R3C3', 'red disk'),
  ...diskPairs('R5C7', 'blue disk'),
  // Killer cages transcribed from the four drawn totals.
  new Cage(17, 'R4C6', 'R4C7', 'R4C8'),
  new Cage(15, 'R7C6', 'R8C6'),
  new Cage(11, 'R7C8', 'R7C9'),
  new Cage(8, 'R6C2', 'R7C2'),
];
