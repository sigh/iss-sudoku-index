// Title: Dizzy Dancing
// Author: Jacob Kadar
// Video: https://www.youtube.com/watch?v=kFkPAvmuKZ0
// Source: https://sudokupad.app/nxt5rs16e9

// A box-5 digit contributes either double or half its digit to a cage total.
// Multiplying the equation by 2 gives coefficient 4 (double) or 1 (half),
// while an unmodified cell has coefficient 2.
const box5 = new Set([
  'R4C4', 'R4C5', 'R4C6',
  'R5C4', 'R5C5', 'R5C6',
  'R6C4', 'R6C5', 'R6C6',
]);

function modifiedCage(total, cells) {
  const modified = cells.filter(cell => box5.has(cell));
  const alternatives = Array.from({length: 2 ** modified.length}, (_, mask) => {
    let bit = 0;
    const terms = cells.map(cell => {
      if (!box5.has(cell)) return [cell, 2];
      const coefficient = mask & (1 << bit) ? 4 : 1;
      bit += 1;
      return [cell, coefficient];
    });
    return terms.every(([, coefficient]) => coefficient === 1)
      ? new Sum(2 * total, ...cells)
      : new Sum(2 * total, ...terms);
  });
  return new Or(alternatives);
}

const givens = [
  new Given('R1C4', 7),
  new Given('R1C6', 6),
  new Given('R2C5', 1),
  new Given('R3C3', 7),
  new Given('R3C7', 6),
  new Given('R5C5', 5),
];

const evenCells = [
  'R2C3', 'R2C7', 'R3C5', 'R4C2', 'R4C8', 'R6C1', 'R8C5',
  'R6C9', 'R1C9', 'R1C1', 'R9C8', 'R9C2', 'R7C3', 'R7C7',
];
const oddCells = [
  'R3C4', 'R3C6', 'R7C4', 'R7C6', 'R5C3', 'R5C7', 'R2C2',
  'R2C8', 'R4C9', 'R4C1', 'R8C2', 'R8C8', 'R9C5',
];

const parity = [
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];

const cages = [
  new Sum(8, 'R6C3', 'R7C3', 'R8C3'),
  modifiedCage(45, ['R5C6', 'R6C4', 'R6C5', 'R6C6']),
  modifiedCage(15, ['R4C5', 'R4C6']),
  modifiedCage(8, ['R4C4', 'R5C4']),
  new Sum(9, 'R6C7', 'R7C7', 'R8C7'),
];

return [
  new Shape('9x9'),
  ...givens,
  new AntiKing(),
  new Diagonal(1), // Rising diagonal: R9C1 to R1C9.
  ...parity,
  ...cages,
];
