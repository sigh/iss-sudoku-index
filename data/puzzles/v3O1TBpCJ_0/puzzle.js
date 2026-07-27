// Title: We're All Mad Here
// Author: gdc
// Video: https://www.youtube.com/watch?v=v3O1TBpCJ_0
// Source: https://sudokupad.app/oaeuopmvrt

// Normal Sudoku on the default Shape('9x9'); the drawn regions are exactly
// the default 3x3 boxes, so no explicit Region/NoBoxes constraint is needed.
//
// Dynamic Fog is solving UI (progressive clue reveal), not a final-grid rule
// -- not encoded.
//
// Killer: 7 cages, all-different, summing to the drawn corner total.
//
// Kropki: white dots mark consecutive pairs. "Not all dots are given" means
// absence carries no information, so only the 3 drawn dots are encoded; no
// negative constraint is added elsewhere.
//
// Mad Fold-In: columns 3-7 fold away, leaving columns 1, 2, 8, 9 as a
// secondary 4-column grid ("in this grid all clues are still valid"). No
// drawn clue depends on a *new* adjacency created by the fold (no dot or
// cage crosses it), so the fold's only effect on any drawn clue is how the
// Hitpoints clues below measure horizontal distance.
//
// Hitpoints: a clue's total is the sum, over its row/column, of each cell's
// own digit where that digit equals the cell's distance from the clue (a
// mismatched cell contributes 0). "Horizontal distances in the folded 4x9
// grid are limited to 1-4": a row clue counts distance only across the 4
// columns that survive the fold {1, 2, 8, 9}, nearest the clue = 1; columns
// 3-7 take no part. The column clue is vertical (not horizontal) and keeps
// the full 1-9 distance down its column.
//   - Row 2, left, value 10: order R2C1(1), R2C2(2), R2C8(3), R2C9(4). 10 is
//     the maximum possible sum (1+2+3+4), so this clue forces every one of
//     those four matches -- checkable by hand from the clue value alone.
//   - Row 6, right, value 0: order R6C9(1), R6C8(2), R6C2(3), R6C1(4) --
//     none of those four cells may hold its listed distance.
//   - Column 8, bottom, value 5: order R9C8(1) up to R1C8(9), the full
//     column (vertical distance is not fold-limited).

// A Hitpoints clue as a small running-sum NFA over the cells in clue order:
// state.pos is the 1-indexed distance of the next cell, state.sum the total
// so far, clamped once it can only fail.
const hitpointsSpec = (target, numCells) => NFA.encodeSpec({
  startState: { pos: 1, sum: 0 },
  transition: ({ pos, sum }, v) => ({
    pos: pos + 1,
    sum: Math.min(sum + (v === pos ? pos : 0), target + 1),
  }),
  accept: ({ sum }) => sum === target,
  maxDepth: numCells,
}, 9);

const hitpoints = (target, ...cells) =>
  new NFA(hitpointsSpec(target, cells.length), `hitpoints ${target}`, ...cells);

const cages = [
  new Cage(27, 'R1C2', 'R1C3', 'R2C3', 'R2C4'),
  new Cage(27, 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Cage(28, 'R3C2', 'R3C3', 'R4C3', 'R5C2', 'R5C3', 'R6C2', 'R7C2'),
  new Cage(12, 'R3C4', 'R4C4', 'R4C5'),
  new Cage(15, 'R3C7', 'R3C8', 'R4C8', 'R5C7', 'R5C8'),
  new Cage(25, 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3'),
  new Cage(12, 'R8C7', 'R8C8', 'R8C9'),
];

const whiteDots = [
  new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R9C7', 'R9C8'),
  new WhiteDot('R8C4', 'R8C5'),
];

const hitpointsClues = [
  hitpoints(10, 'R2C1', 'R2C2', 'R2C8', 'R2C9'),
  hitpoints(0, 'R6C9', 'R6C8', 'R6C2', 'R6C1'),
  hitpoints(5, 'R9C8', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C8'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whiteDots,
  ...hitpointsClues,
];
