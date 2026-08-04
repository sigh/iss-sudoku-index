// Title: Patchwork
// Author: Steelwool
// Video: https://www.youtube.com/watch?v=oVWlOoPyGVI
// Source: https://app.crackingthecryptic.com/sudoku/Qd3HHTrB94

// Normal sudoku rules apply.
// A black dot separates two cells in which one digit is double the other:
// two dots are drawn, as edge marks between R2C5/R3C5 and R4C5/R5C5 --
// BlackDot is exactly this Kropki relation.
// In each 3x3 box, the coloured cells form a set of consecutive digits.
// Each box has a group of underlay-filled cells in one of two colours
// (#A3E048 yellowgreen, #34BBE6 deepskyblue); "consecutive digits" is
// modelled with Renban over each box's coloured cells (the box's own
// all-different already forbids repeats, so Renban's non-repeat clause is
// redundant but harmless).
// Each cage in a 3x3 box sums to the same value as the coloured area in
// that box, modelled with EqualSum(cage cells, coloured cells) per box
// that has a cage. Box 5 (centre) has no cage, so it gets no equal-sum
// constraint -- only its coloured-consecutive-set constraint.
// Every drawn cage has no printed total, so each cage's own local
// constraint is only AllDifferent.

// Per box (reading order): cage cells (from the `cages` array; null where
// the box has none) and coloured cells (from the underlay fill colour).
const boxes = [
  { cage: ['R2C1', 'R2C2', 'R1C2', 'R1C3', 'R2C3', 'R3C3'],
    coloured: ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1'] },
  { cage: ['R1C4', 'R1C5', 'R1C6', 'R2C5'],
    coloured: ['R1C4', 'R2C4', 'R2C5', 'R3C5', 'R3C6', 'R2C6'] },
  { cage: ['R2C9', 'R3C9', 'R3C8', 'R3C7'],
    coloured: ['R1C8', 'R1C9', 'R2C7', 'R2C8', 'R3C8', 'R3C9'] },
  { cage: ['R5C3', 'R6C3', 'R6C2', 'R6C1'],
    coloured: ['R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C3'] },
  { cage: null,
    coloured: ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6'] },
  { cage: ['R5C7', 'R4C7', 'R4C8', 'R4C9'],
    coloured: ['R4C7', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8'] },
  { cage: ['R7C2', 'R8C2', 'R9C2', 'R9C3'],
    coloured: ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C3', 'R9C3'] },
  { cage: ['R7C5', 'R7C6', 'R8C6', 'R9C6'],
    coloured: ['R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'] },
  { cage: ['R7C7', 'R8C7', 'R9C7', 'R8C8', 'R9C8', 'R9C9'],
    coloured: ['R7C7', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7'] },
];

const noTotalCages = boxes
  .filter(b => b.cage)
  .map(b => new AllDifferent(...b.cage));

const colouredConsecutiveSets = boxes
  .map(b => new Renban(...b.coloured));

const cageEqualsColoured = boxes
  .filter(b => b.cage)
  .map(b => new EqualSum(b.cage, b.coloured));

return [
  new Shape('9x9'),
  new Given('R1C5', 9),
  new BlackDot('R2C5', 'R3C5'),
  new BlackDot('R4C5', 'R5C5'),
  ...noTotalCages,
  ...colouredConsecutiveSets,
  ...cageEqualsColoured,
];
