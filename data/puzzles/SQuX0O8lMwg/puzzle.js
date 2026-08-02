// Title: Killer Look-and-say Islands
// Author: Virtual
// Video: https://www.youtube.com/watch?v=SQuX0O8lMwg
// Source: https://app.crackingthecryptic.com/R8fhNnT2HJ

// Normal Sudoku rules apply. Each drawn cage is Killer, Look-and-Say, or both;
// every orthogonally connected three-cage same-size island has one of each type.
// The cage lists are transcribed from the drawn cage borders and their top-left totals.
const islands = [
  [
    { total: 17, cells: ['R3C1', 'R3C2', 'R3C3'] },
    { total: 22, cells: ['R1C3', 'R1C4', 'R2C3'] },
    { total: 22, cells: ['R1C1', 'R1C2', 'R2C2'] },
  ],
  [
    { total: 17, cells: ['R3C5', 'R4C5', 'R5C5'] },
    { total: 23, cells: ['R5C3', 'R5C4', 'R6C3'] },
    { total: 23, cells: ['R6C2', 'R7C2', 'R7C3'] },
  ],
  [
    { total: 28, cells: ['R1C6', 'R1C7', 'R1C8', 'R2C8'] },
    { total: 26, cells: ['R1C5', 'R2C5', 'R2C6', 'R2C7'] },
    { total: 14, cells: ['R3C6', 'R3C7', 'R4C7', 'R4C8'] },
  ],
  [
    { total: 19, cells: ['R4C1', 'R5C1', 'R6C1', 'R7C1'] },
    { total: 14, cells: ['R4C2', 'R4C3', 'R4C4', 'R5C2'] },
    { total: 22, cells: ['R8C1', 'R8C2', 'R9C2', 'R9C3'] },
  ],
  [
    { total: 32, cells: ['R6C4', 'R6C5', 'R7C4', 'R8C3', 'R8C4'] },
    { total: 19, cells: ['R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'] },
    { total: 32, cells: ['R5C7', 'R6C6', 'R6C7', 'R7C5', 'R7C6'] },
  ],
];

const lookAndSay = ({ total, cells }) =>
  new ContainExact(Array(total / 10 | 0).fill(total % 10).join('_'), ...cells);
const killer = ({ total, cells }) => new Cage(total, ...cells);
// A both-type cage sums but permits repeats, as the stated Look-and-Say exception requires.
const both = cage => new And([new Sum(cage.total, ...cage.cells), lookAndSay(cage)]);
const typedIsland = ([a, b, c]) => new Or([
  new And([killer(a), lookAndSay(b), both(c)]),
  new And([killer(a), both(b), lookAndSay(c)]),
  new And([lookAndSay(a), killer(b), both(c)]),
  new And([lookAndSay(a), both(b), killer(c)]),
  new And([both(a), killer(b), lookAndSay(c)]),
  new And([both(a), lookAndSay(b), killer(c)]),
]);

return [new Shape('9x9'), ...islands.map(typedIsland)];
