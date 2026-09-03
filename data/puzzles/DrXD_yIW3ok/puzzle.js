// Title: Projojojomo
// Author: Scojojobo
// Video: https://www.youtube.com/watch?v=DrXD_yIW3ok
// Source: https://sudokupad.app/br70hyi0ur

// Rules encoded here, in full:
//   * Normal sudoku: digits 1-9 once each per row, column and 3x3 box. No
//     given digits.
//   * Cipher: the letters B, C, D, J, K, O, S, T, U stand for nine distinct
//     digits 1-9.
//   * Clones: shaded regions of the same shape hold identical digits in the
//     same positions, without rotation or reflection.
//   * Quads: every digit printed in a large green circle appears among the
//     four cells around that circle, at least as many times as it is printed.
//   * Difference dots: the two cells a small white dot separates differ by the
//     digit its letter stands for.
// Nothing is omitted. The canvas rows below the grid (the letter legend and the
// blank strip a solver writes the cipher into) carry no puzzle cells.

const graph = cellGraph('9x9');

// Cipher letters in the legend's printed order; VC1..VC9 hold their digits.
const LETTERS = 'BCDJKOSTU';
const cipher = new Var('C', 'Cipher', LETTERS.length);
const letterCell = (letter) => cipher.cell(LETTERS.indexOf(letter) + 1);

// Shaded blocks, as [top-left cell, rows, cols]; drawn as the four grey areas.
const SHADED_BLOCKS = [
  ['R2C2', 4, 2],
  ['R6C5', 4, 2],
  ['R1C8', 2, 2],
  ['R8C1', 2, 2],
];

// Green circles: [top-left cell of the 2x2 the circle sits on, letters printed].
// A repeated letter is a repeated digit in the quad.
const QUADS = [
  ['R1C1', 'SCOJ'],
  ['R2C6', 'JOJO'],
  ['R4C3', 'SUD'],
  ['R4C4', 'OKU'],
  ['R5C6', 'CTC'],
  ['R6C8', 'JOBO'],
  ['R8C3', 'JOJO'],
];

// White dots: [cell, cell, letter printed on the dot].
const DIFFERENCE_DOTS = [
  ['R1C4', 'R1C5', 'K'],
  ['R2C2', 'R2C3', 'O'],
  ['R2C5', 'R2C6', 'D'],
  ['R2C9', 'R3C9', 'U'],
  ['R4C6', 'R4C7', 'K'],
  ['R4C8', 'R4C9', 'K'],
  ['R6C1', 'R6C2', 'C'],
  ['R6C7', 'R7C7', 'C'],
  ['R7C4', 'R8C4', 'S'],
  ['R7C8', 'R8C8', 'O'],
];

// Same-shape pairs of shaded blocks, matched cell-for-cell in reading order.
// Each block size occurs exactly twice, so the pairing is forced by the shapes
// alone; blocks of different sizes are different shapes and are not linked.
const cloneConstraints = () => {
  const blocks = SHADED_BLOCKS.map(([cell, rows, cols]) =>
    ({ key: `${rows}x${cols}`, cells: graph.block(cell, rows, cols) }));
  return blocks.flatMap((a, i) => blocks.slice(i + 1)
    .filter(b => b.key === a.key)
    .flatMap(b => a.cells.map((cell, k) =>
      new SameValues(2, cell, b.cells[k]))));
};

// "digit v appears at least `minCount` times among the four cells": the scan
// reads the letter's cipher cell first, which fixes v as the target, then
// counts matches over the quad's four cells. The counter is clamped at
// `minCount`, so acceptance at exactly `minCount` means "at least".
const quadCountSpec = (minCount) => NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => (target === null)
    ? { target: value, count: 0 }
    : { target, count: Math.min(count + (value === target ? 1 : 0), minCount) },
  accept: ({ target, count }) => (target !== null) && (count === minCount),
}, 9);

const quadConstraints = () => QUADS.flatMap(([topLeft, letters]) => {
  const cells = graph.block(topLeft, 2, 2);
  const counts = new Map();
  for (const letter of letters) {
    counts.set(letter, (counts.get(letter) ?? 0) + 1);
  }
  return [...counts].map(([letter, minCount]) => new NFA(
    quadCountSpec(minCount),
    `quad ${topLeft} ${letter}x${minCount}`,
    letterCell(letter), ...cells));
});

// |a - b| = the letter's digit: whichever cell is the larger equals the other
// plus that digit, so each branch is "one cell" balanced against "the other
// cell plus the cipher cell".
const differenceDotConstraints = () => DIFFERENCE_DOTS.map(([a, b, letter]) => {
  const v = letterCell(letter);
  return new Or([
    new EqualSum([a], [b, v]),
    new EqualSum([b], [a, v]),
  ]);
});

return [
  new Shape('9x9'),
  cipher,
  new AllDifferent(...cipher.cells()),
  ...cloneConstraints(),
  ...quadConstraints(),
  ...differenceDotConstraints(),
];
