// Title: Untitled
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=ODob3WSRoyM
// Source: https://cracking-the-cryptic.web.app/sudoku/Fb3fH2MB6n

// Normal sudoku rules apply. Cells a chess knight's move apart cannot hold
// the same digit (global). In the grey cells, two cells connected
// horizontally must differ by exactly 2; two cells connected vertically
// must differ by exactly 3.
//
// The drawn grey cells form one diagonal zig-zag band of 17 cells running
// R9C1 -> R1C9. Its horizontal/vertical edges are derived below rather than
// hand-listed twice, so the encoding can't drift from the cell set it was
// read from.
//
// A small in-app legend beside the grid pairs a vertical domino with
// "2 apart" and a horizontal domino with "3 apart" -- the reverse of the
// direction/value binding used below, which follows the rules text instead
// (the legend's binding is unsatisfiable).

const greyCells = [
  'R9C1', 'R8C1', 'R8C2', 'R7C2', 'R7C3', 'R6C3', 'R6C4', 'R5C4', 'R5C5',
  'R4C5', 'R4C6', 'R3C6', 'R3C7', 'R2C7', 'R2C8', 'R1C8', 'R1C9',
];

const horizontalDiff = 2;
const verticalDiff = 3;
const hKey = Pair.fnToKey((a, b) => Math.abs(a - b) === horizontalDiff, 9);
const vKey = Pair.fnToKey((a, b) => Math.abs(a - b) === verticalDiff, 9);

const greyPairs = [];
for (let i = 0; i + 1 < greyCells.length; i++) {
  const a = parseCellId(greyCells[i]);
  const b = parseCellId(greyCells[i + 1]);
  if (a.row === b.row) {
    greyPairs.push(new Pair(hKey, `grey-horizontal-${horizontalDiff}`, greyCells[i], greyCells[i + 1]));
  } else {
    greyPairs.push(new Pair(vKey, `grey-vertical-${verticalDiff}`, greyCells[i], greyCells[i + 1]));
  }
}

return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R4C1', 2),
  new Given('R4C6', 4),
  new Given('R9C2', 9),

  new AntiKnight(),

  ...greyPairs,
];
