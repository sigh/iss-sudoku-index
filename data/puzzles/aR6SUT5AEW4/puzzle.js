// Title: Renban %3
// Author: Abed Hawila
// Video: https://www.youtube.com/watch?v=aR6SUT5AEW4
// Source: https://app.crackingthecryptic.com/sudoku/rMrRr4t7j4

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Every grey and red line is a
// renban line (a set of consecutive, non-repeating digits, in any order) --
// the rules text states one line rule for both colours. The outside clue
// gives the sum of digits along its indicated diagonal; repeats are allowed
// along it.

const geometry = cellGeometry(9);

// 14 renban lines transcribed from the drawn grey (#cfcfcf) and red
// (#e6261f) strokes. Grey line 1 (R1C1-R1C2-R1C3) and red line 13
// (R1C1-R2C1-R3C1) both include corner cell R1C1; grey line 10
// (R7C9-R8C9-R9C9) and red line 14 (R9C7-R9C8-R9C9) both include corner
// cell R9C9. In each pair the two strokes are separate 3-cell clues that
// merely touch at a shared cell -- not one connected 5-cell line -- so they
// are encoded as separate Renban constraints over their own cells.
const renbanLines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R2C7', 'R2C8', 'R3C8', 'R3C7'],
  ['R4C7', 'R4C8', 'R5C8'],
  ['R5C7', 'R6C7', 'R6C8'],
  ['R4C6', 'R3C6', 'R3C5', 'R3C4', 'R4C4'],
  ['R4C2', 'R4C3', 'R5C3'],
  ['R5C2', 'R6C2', 'R6C3'],
  ['R6C4', 'R7C4', 'R7C5', 'R7C6', 'R6C6'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R8C2', 'R7C2', 'R7C3'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R1C1', 'R2C1', 'R3C1'],
  ['R9C7', 'R9C8', 'R9C9'],
].map(cells => new Renban(...cells));

// Outside diagonal-sum clue, value 16. The arrow bulb sits at R5C9 and
// points down-left, which fixes this diagonal over the other candidate
// sharing the same outside lane (the up-left run R3C9-R2C8-R1C7, which
// carries no arrow). LittleKiller.fromCells derives the canonical corner
// from the explicit cell list.
const littleKillers = [
  [16, ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  new Given('R1C9', 3),
  new Given('R2C2', 9),
  new Given('R5C5', 9),
  new Given('R8C8', 2),
  new Given('R9C1', 9),
  ...renbanLines,
  ...littleKillers,
];
