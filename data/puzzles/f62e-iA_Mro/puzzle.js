// Title: Friends^2
// Author: JoWovrin
// Video: https://www.youtube.com/watch?v=f62e-iA_Mro
// Source: https://app.crackingthecryptic.com/sudoku/LLDprBq3FH

// Normal sudoku rules apply. A cell is "friendly" when its digit equals its
// own row number, its own column number, or its own box number (box numbered
// 1-9 in reading order: the rules' own example, R5C9, sits in box 6, giving
// candidates 5/9/6). The nine green-shaded cells below are given as
// friendly; the digit within their own {row, column, box} set is not given.
// Every row, column and box holds exactly two friendly cells in total, so a
// second, unmarked friendly cell exists in each and is left for the solver.
//
// Friendliness is modelled with a parallel Var flag per grid cell: flag 2
// means friendly, flag 1 means not. A per-cell Pair ties the grid digit to
// its flag using that cell's own {row, column, box} set as the truth table;
// ContainExact then requires exactly two "2" flags per row, column and box.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VF');
const cells = graph.cells();
const flagCells = flags.at(cells);

const box = (row, col) =>
  3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;

function friendlyPair(cell, flagCell) {
  const { row, col } = parseCellId(cell);
  const friendlySet = new Set([row, col, box(row, col)]);
  const key = Pair.fnToKey(
    (digit, f) => (f === 2 ? friendlySet.has(digit) : !friendlySet.has(digit)),
    9);
  return new Pair(key, 'friendly', cell, flagCell);
}

const exactlyTwoFriendly = group => new ContainExact('2_2', ...flags.at(group));

// Green "friendly" cells, read from the underlay layer's 1x1 swatches.
const greenCells = [
  'R1C6', 'R2C8', 'R3C3', 'R4C4', 'R5C9', 'R6C1', 'R8C2', 'R9C5', 'R7C7',
];

return [
  new Shape('9x9'),
  new Given('R1C1', 4),
  new Given('R3C7', 2),
  new Given('R5C5', 7),
  new Given('R7C3', 6),
  new Given('R9C9', 1),

  flags.toVar('friendly flags'),
  // Every flag cell ranges over {1 (not friendly), 2 (friendly)}; one
  // Replicate template stamped across the whole overlay.
  new Replicate(
    [new Given(flagCells[0], 1, 2)],
    Replicate.encodeTargetCells(flagCells, flagCells[0], flags),
    flagCells[0]),
  ...cells.map((cell, i) => friendlyPair(cell, flagCells[i])),
  ...flags.at(greenCells).map(flagCell => new Given(flagCell, 2)),

  ...graph.rows().map(exactlyTwoFriendly),
  ...graph.columns().map(exactlyTwoFriendly),
  ...graph.boxes().map(exactlyTwoFriendly),
];
