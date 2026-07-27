// Title: This one goes to 11
// Author: Super Mikal
// Video: https://www.youtube.com/watch?v=6tYM2ClmjVo
// Source: https://sudokupad.app/jan0hcmke0

// Normal sudoku on a 9x9 grid, but the digit alphabet is widened to 0-11
// (12 symbols); each row/column/box holds 9 of the 12 digits (default
// all-different already gives this). Two more rules constrain WHICH 9-digit
// set a house may use:
//   (a) it must sum to 45;
//   (b) no two houses of the same kind (row/row, column/column, box/box)
//       may use the identical 9-digit set.
// The grey R1-9,C10-12 / R10-12,C1-12 note cells are not modelled (rules:
// "The grey cells are just extra space for taking notes").
//
// A 9-of-12 digit set is equivalent to its 3-digit complement, and since
// 0+1+...+11 = 66, a set sums to 45 iff its complement sums to 21. Exactly
// 12 triples of distinct digits in 0-11 sum to 21 (found by exhaustive
// enumeration over the 220 three-digit subsets of 0-11). One of those,
// {0,10,11}, is the complement of {1,...,9} -- the classic set the rules
// text explicitly disallows ("The classic set of the numbers 1 through 9 is
// not allowed"), even though it also sums to 45. That leaves 11 valid
// per-house digit sets (also the answer to the rules' bonus "how many valid
// sets" question). Every house is one of those 11 "types", each type's 9
// allowed digits being the complement of one EXCLUDED_TRIPLES entry.
//
// Each house gets a Var holding its type (an arbitrary index into
// EXCLUDED_TRIPLES, not a digit). `typedHouse` ties a house to its type: an
// Or over the types, each branch pinning the type Var to k and every house
// cell's candidates to type k's 9 allowed digits (Given). Once a branch's
// Given restrictions hold, the house's own all-different plus the
// 9-cell/9-value domain forces a bijection onto that type's set, so rule (a)
// falls out for free -- it needs no separate Sum. Rule (b) is then just
// AllDifferent over the 9 type Vars within each house kind (rows vs rows,
// columns vs columns, boxes vs boxes) -- types may repeat across kinds.
const EXCLUDED_TRIPLES = [
  // [0, 10, 11] omitted: its complement {1,...,9} is the disallowed classic set.
  [1, 9, 11], [2, 8, 11], [2, 9, 10],
  [3, 7, 11], [3, 8, 10], [4, 6, 11], [4, 7, 10],
  [4, 8, 9], [5, 6, 10], [5, 7, 9], [6, 7, 8],
];
const ALLOWED_DIGITS = EXCLUDED_TRIPLES.map(
  triple => Array.from({ length: 12 }, (_, v) => v).filter(v => !triple.includes(v)));

function typedHouse(typeCell, houseCells) {
  return new Or(ALLOWED_DIGITS.map((allowed, k) => new And([
    new Given(typeCell, k),
    ...houseCells.map(cell => new Given(cell, ...allowed)),
  ])));
}

const graph = cellGraph('9x9');
const rowTypes = new Var('RT', 'row set id', 9);
const colTypes = new Var('CT', 'column set id', 9);
const boxTypes = new Var('BT', 'box set id', 9);

// Givens, from the source payload's per-cell given/value fields (26 total,
// including R4C7=A, R4C8=B, and R9C3=A).
const givens = [
  ['R1C4', 5], ['R1C5', 4], ['R2C2', 2], ['R2C5', 6], ['R2C7', 7], ['R2C9', 3],
  ['R3C1', 4], ['R3C5', 0], ['R3C7', 5], ['R4C1', 0], ['R4C7', 10], ['R4C8', 11],
  ['R5C1', 1], ['R5C3', 8], ['R5C8', 3], ['R6C2', 9], ['R7C2', 5], ['R7C5', 2],
  ['R8C4', 9], ['R8C5', 8], ['R8C7', 0], ['R8C9', 1], ['R9C2', 7], ['R9C3', 10],
  ['R9C7', 6], ['R9C8', 2],
].map(([cell, value]) => new Given(cell, value));

return [
  new Shape('9x9', '0-11'),
  rowTypes,
  colTypes,
  boxTypes,
  ...givens,
  ...graph.rows().map((cells, i) => typedHouse(rowTypes.cell(i + 1), cells)),
  ...graph.columns().map((cells, i) => typedHouse(colTypes.cell(i + 1), cells)),
  ...graph.boxes().map((cells, i) => typedHouse(boxTypes.cell(i + 1), cells)),
  new AllDifferent(...rowTypes.cells()),
  new AllDifferent(...colTypes.cells()),
  new AllDifferent(...boxTypes.cells()),
];
