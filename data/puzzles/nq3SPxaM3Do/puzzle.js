// Title: Horses Sliding through a Field of Oil and Water
// Author: Merdock
// Video: https://www.youtube.com/watch?v=nq3SPxaM3Do
// Source: https://sudokupad.app/bh7z9bwzxx

// Rules encoded here:
//  - Normal sudoku (implicit).
//  - Anti-knight: digits a knight's move apart are not identical.
//  - Killer cages: no repeats; a printed total is the cage sum (unprinted
//    totals are written as 0, i.e. all-different only).
//  - Oil and water (even = oil, odd = water), per cage:
//      * cells of a cage connected horizontally (a run of horizontally
//        adjacent cage cells) share a parity;
//      * even digits are always in rows above odd digits: for two cage cells
//        in different rows, the upper one may not be odd while the lower one
//        is even. Two cells in the same row but not horizontally connected
//        may differ ("r5c6 & r5c8 for example"), so same-row pairs are left
//        free. In an all-even or all-odd cage both clauses are vacuous.
// Fog is a presentation feature only and is not encoded.

// Cages transcribed from the drawn killer cages (total 0 = no printed total).
const CAGES = [
  [0, 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  [30, 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R7C5', 'R8C5'],
  [22, 'R7C1', 'R7C2', 'R7C3', 'R7C4'],
  [30, 'R3C8', 'R4C8', 'R5C6', 'R5C8', 'R6C6', 'R6C7', 'R6C8'],
  [0, 'R5C2', 'R5C3', 'R6C3'],
  [21, 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R5C1'],
  [0, 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R3C5', 'R3C6'],
  [19, 'R3C7', 'R4C7', 'R5C7'],
  [0, 'R4C9', 'R5C9'],
  [0, 'R1C9', 'R2C9', 'R3C9'],
  [20, 'R1C7', 'R1C8', 'R2C7', 'R2C8'],
  [0, 'R1C2', 'R2C2', 'R2C3', 'R3C3', 'R3C4'],
  [0, 'R6C1', 'R6C2'],
];

const isEven = (v) => v % 2 === 0;
const sameParityKey = Pair.fnToKey((a, b) => isEven(a) === isEven(b), 9);
// Pair(upper, lower): rejects an odd upper cell above an even lower cell.
const oilAboveWaterKey = Pair.fnToKey((upper, lower) => !(!isEven(upper) && isEven(lower)), 9);

const cagePairs = (cells) => {
  const parsed = cells.map((id) => ({ id, ...parseCellId(id) }));
  const pairs = [];
  for (const a of parsed) {
    for (const b of parsed) {
      if (a.row === b.row && b.col === a.col + 1) {
        pairs.push(new Pair(sameParityKey, 'Oil/water: horizontal run', a.id, b.id));
      } else if (a.row < b.row) {
        pairs.push(new Pair(oilAboveWaterKey, 'Oil above water', a.id, b.id));
      }
    }
  }
  return pairs;
};

const cages = CAGES.map(([total, ...cells]) => new Cage(total, ...cells));
const oilAndWater = CAGES.flatMap(([, ...cells]) => cagePairs(cells));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  ...oilAndWater,
];
