// Title: Arrow/Group Sum Sudoku
// Author: ahaupt
// Video: https://www.youtube.com/watch?v=73iEwlTO_p0
// Source: https://cracking-the-cryptic.web.app/sudoku/pnf623FF7B

// Rules encoded here, in full:
//   1. Normal sudoku rules apply. There are no given digits.
//   2. Group sums: a number in a small circle on a grid vertex is the sum of
//      the digits in the four cells touching that vertex; those digits may
//      repeat. Every group-sum clue carries a comparison operator, so the
//      total is bounded rather than fixed ('>=26' means at least 26).
//   3. Arrows: the digit in a large circle equals the sum of the digits along
//      its arrow (the circle cell itself is not part of the sum).
//   4. An inequality sign between two cells points at the smaller digit.
// Nothing is omitted.

// A group-sum clue bounds a total, and no ISS class takes a bounded sum, so
// each one is a small state machine over the four cells: the state is the
// running total, and the accept test is the comparison.
//   '>=' clamps the total at the target -- once it is reached the clue can no
//        longer fail, so every larger total collapses to one state -- and
//        accepts only that state.
//   '<=' kills any prefix that has already overshot (transition returns
//        undefined) and accepts everything that survives the four cells.
const groupSumSpec = (op, total) => NFA.encodeSpec({
  startState: { sum: 0 },
  transition: ({ sum }, value) => {
    if (op === '>=') return { sum: Math.min(sum + value, total) };
    return sum + value <= total ? { sum: sum + value } : undefined;
  },
  accept: ({ sum }) => (op === '>=' ? sum === total : true),
}, 9);

// Circles drawn on grid vertices; each clue lists the four cells around its
// vertex, read from the drawn circle positions.
const groupSumClues = [
  ['>=', 26, 'R1C3', 'R1C4', 'R2C3', 'R2C4'],
  ['<=', 21, 'R2C4', 'R2C5', 'R3C4', 'R3C5'],
  ['<=', 11, 'R3C1', 'R3C2', 'R4C1', 'R4C2'],
  ['>=', 19, 'R4C2', 'R4C3', 'R5C2', 'R5C3'],
  ['>=', 20, 'R5C7', 'R5C8', 'R6C7', 'R6C8'],
  ['<=', 19, 'R6C8', 'R6C9', 'R7C8', 'R7C9'],
  ['<=', 15, 'R7C5', 'R7C6', 'R8C5', 'R8C6'],
  ['>=', 25, 'R8C6', 'R8C7', 'R9C6', 'R9C7'],
];

const groupSums = groupSumClues.map(
  ([op, total, ...cells]) =>
    new NFA(groupSumSpec(op, total), `group ${op}${total}`, ...cells));

// Drawn arrows: circle cell first, then the arrow path in order.
const arrows = [
  new Arrow('R3C6', 'R2C7', 'R1C7'),
  new Arrow('R4C7', 'R3C8', 'R3C9'),
  new Arrow('R6C3', 'R7C2', 'R7C1'),
  new Arrow('R7C4', 'R8C3', 'R9C3'),
];

// Drawn inequality signs. GreaterThan puts the larger digit first, and the
// sign's point marks the smaller one.
const inequalities = [
  new GreaterThan('R1C5', 'R1C4'),
  new GreaterThan('R9C5', 'R9C6'),
  new GreaterThan('R4C1', 'R5C1'),
  new GreaterThan('R6C9', 'R5C9'),
];

return [
  new Shape('9x9'),
  ...groupSums,
  ...arrows,
  ...inequalities,
];
