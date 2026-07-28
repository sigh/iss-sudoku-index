// Title: Balance
// Author: Scojo
// Video: https://www.youtube.com/watch?v=Bl8vZpsyucg
// Source: https://sudokupad.app/3ma2z9n9lr

// Normal Sudoku rules apply. Balance Cells are encoded as an unknown selection:
// exactly one per row, column, and box, and their digits are distinct. The
// arithmetic-mean value rule, Global Balance, and value-based killer cages are
// omitted because ISS has no reified arithmetic relation between a selected cell
// and a variable-length neighbour sum.
const graph = cellGraph('9x9');
const cells = graph.cells();
const balance = graph.makeOverlay('VB');
const selectedDigits = NFA.encodeSpec({
  startState: { mask: 0, flag: null },
  transition: ({ mask, flag }, value) => {
    if (flag === null) return (value === 1 || value === 2) ? { mask, flag: value } : undefined;
    if (flag === 2) return { mask, flag: null };
    const bit = 1 << (value - 1);
    return (mask & bit) ? undefined : { mask: mask | bit, flag: null };
  },
  accept: ({ flag }) => flag === null,
}, 9);

// The Balance Cell overlay is 1 for selected and 2 for unselected; each drawn
// row, column, and box has one selected cell, so its overlay sum is 17.
const groups = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
];

return [
  new Shape('9x9'),
  balance.toVar('Balance selection'),
  balance.makeReplicate(new Given(balance.at('R1C1'), 1, 2)),
  ...groups.map(group => new Sum(17, ...balance.at(group))),
  new NFA(selectedDigits, 'distinct-balance-digits',
    ...cells.flatMap(cell => [balance.at(cell), cell])),
];
