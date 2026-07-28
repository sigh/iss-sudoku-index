// Title: Bodysnatchers
// Author: AnalyticalNinja and Kafkapharnaum
// Video: https://www.youtube.com/watch?v=A6bBC6GhCrU
// Source: https://sudokupad.app/e0l316poog

// Normal Sudoku rules apply. There is one hidden Doubler and one hidden Body
// Snatcher in every row, column, and box; each type occupies every digit 1-9
// once, and the two types do not overlap. The rules that turn these cells into
// values, and the purple value-Renbans, are omitted (see notes).

const graph = cellGraph('9x9');
const doublers = graph.makeOverlay('VD');
const snatchers = graph.makeOverlay('VB');

// A flag is 1 when absent and 2 when the cell has that hidden role. A nine-cell
// house sums to 10 exactly when it contains one role cell.
const onePerHouse = flags => graph.houses().map(
  house => new Sum(10, ...flags.at(house)));

// Each row has exactly one role cell. Its digit is tied to that row's role-digit
// Var; AllDifferent over the nine Vars makes the selected digits a full 1-9 set.
function roleDigitSet(flags, prefix, label) {
  const selectedDigits = new Var(prefix, label, 9);
  const bindings = graph.rows().flatMap((row, index) => {
    const selected = selectedDigits.cell(index + 1);
    return row.map(cell => new Or([
      new Given(flags.at(cell), 1),
      new SameValues(2, cell, selected),
    ]));
  });
  return [selectedDigits, new AllDifferent(...selectedDigits.cells()), ...bindings];
}

// A cell cannot have both hidden roles.
const distinctRoles = graph.cells().map(cell => new Or([
  new Given(doublers.at(cell), 1),
  new Given(snatchers.at(cell), 1),
]));

return [
  new Shape('9x9'),
  doublers.toVar('doubler flags'),
  snatchers.toVar('body snatcher flags'),
  doublers.makeReplicate(new Given(doublers.cells()[0], 1, 2)),
  snatchers.makeReplicate(new Given(snatchers.cells()[0], 1, 2)),
  ...onePerHouse(doublers),
  ...onePerHouse(snatchers),
  ...roleDigitSet(doublers, 'E', 'doubler digits by row'),
  ...roleDigitSet(snatchers, 'F', 'body snatcher digits by row'),
  ...distinctRoles,
];
