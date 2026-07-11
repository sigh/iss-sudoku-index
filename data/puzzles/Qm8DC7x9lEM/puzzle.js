// Title: Killers in Hiding
// Author: Aron Lidé (Aspartagcus)
// Video: https://www.youtube.com/watch?v=Qm8DC7x9lEM
// Source: https://sudokupad.app/5gyf7rj813

// Normal sudoku rules apply.
//
// Hidden sum killer cages: digits in a cage may not repeat, and sum to the
// two-digit number formed by reading the two left-most cells in the cage's
// top row (tens digit then units digit). Each cage's own total is therefore
// read from two of its own member cells rather than shown as a clue.

function rowMajor(cells) {
  return [...cells].sort((a, b) => {
    const A = parseCellId(a);
    const B = parseCellId(b);
    return A.row - B.row || A.col - B.col;
  });
}

// Cage cells are listed in any order; rowMajor picks out the two left-most
// cells of the top row as the tens/units digits of the cage's own total.
function selfCluedCage(cells) {
  const [tensCell, onesCell] = rowMajor(cells);
  return [
    new Sum(0, [tensCell, -10], [onesCell, -1], ...cells),
    new AllDifferent(...cells),
  ];
}

const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9'],
  ['R8C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R2C4', 'R2C5', 'R2C6', 'R2C7'],
  ['R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R7C1', 'R7C2'],
  ['R3C8', 'R3C9', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8'],
  ['R3C4', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R7C6'],
];

return [
  new Shape('9x9'),
  ...cages.flatMap(selfCluedCage),
];
