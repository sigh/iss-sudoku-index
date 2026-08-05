// Title: Double Or Half
// Author: Al Fresco
// Video: https://www.youtube.com/watch?v=Zm6i9k0-srU
// Source: https://app.crackingthecryptic.com/sudoku/t9R8FpbtRJ

// Normal sudoku applies. The listed cages have distinct digits and their totals
// count normal, doubler, and halver cells as 1, 2, and 1/2 times their digits.
// Each row, column, and box has one doubler and one halver; each digit has one
// of each modifier; and modified cells cannot touch by a king move.
const NORMAL = 1;
const DOUBLER = 2;
const HALVER = 3;
const graph = cellGraph('9x9');
const cells = graph.cells();
const flags = graph.makeOverlay('VM');
const flag = cell => flags.at(cell);
const entries = group => group.flatMap(cell => [cell, flag(cell)]);

// The 20 drawn cage outlines, transcribed in source order as [total, cells].
const cages = [
  [16, ['R1C2', 'R1C1', 'R2C1', 'R2C2']], [12, ['R1C3', 'R1C4', 'R1C5', 'R2C5']],
  [16, ['R1C6', 'R1C7', 'R2C7', 'R3C7']], [21, ['R3C8', 'R2C8', 'R1C8', 'R1C9']],
  [28, ['R2C9', 'R3C9', 'R4C9', 'R4C8']], [26, ['R4C7', 'R5C7', 'R6C7', 'R5C8']],
  [29, ['R5C9', 'R6C9', 'R6C8', 'R7C8']], [20, ['R7C9', 'R8C9', 'R9C9', 'R8C8']],
  [18, ['R7C7', 'R8C7', 'R9C7', 'R9C8']], [25, ['R2C6', 'R3C6', 'R3C5', 'R3C4']],
  [22, ['R2C4', 'R2C3', 'R3C3', 'R3C2']], [30, ['R3C1', 'R4C1', 'R4C2', 'R4C3']],
  [19, ['R5C1', 'R6C1', 'R5C2', 'R5C3']], [8, ['R7C1', 'R7C2', 'R6C2', 'R6C3']],
  [24, ['R8C1', 'R9C1', 'R9C2', 'R8C2']], [33, ['R8C3', 'R7C3', 'R7C4', 'R7C5']],
  [29, ['R9C3', 'R9C4', 'R8C4', 'R8C5']], [8, ['R7C6', 'R8C6', 'R9C6', 'R9C5']],
  [23, ['R6C4', 'R6C5', 'R6C6', 'R5C5']], [18, ['R5C4', 'R4C4', 'R4C5', 'R4C6']],
];

// Scan each digit/flag pair. We double every cage total, so modifier states
// NORMAL, DOUBLER, and HALVER contribute 2d, 4d, and d respectively.
function cageMachine(total) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') return { phase: 'modifier', sum: state.sum, digit: value };
      const weight = [null, 2, 4, 1][value];
      const sum = state.sum + state.digit * weight;
      return sum > 2 * total ? undefined : { phase: 'digit', sum };
    },
    accept: state => state.phase === 'digit' && state.sum === 2 * total,
  }, 9);
}

// For one digit and modifier state, this records whether their paired cells
// occur exactly once across the full grid.
function digitModifierMachine(digit, modifier) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', count: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') return { phase: 'modifier', count: state.count, target: value === digit };
      const count = state.count + (state.target && value === modifier ? 1 : 0);
      return count > 1 ? undefined : { phase: 'digit', count };
    },
    accept: state => state.phase === 'digit' && state.count === 1,
  }, 9);
}

const modifierRegions = [...graph.rows(), ...graph.columns(), ...graph.boxes()];
const cageConstraints = cages.flatMap(([total, cage]) => [
  new AllDifferent(...cage),
  new NFA(cageMachine(total), `cage-${total}`, ...entries(cage)),
]);
const digitModifiers = [DOUBLER, HALVER].flatMap(modifier =>
  Array.from({ length: 9 }, (_, index) => new NFA(
    digitModifierMachine(index + 1, modifier),
    `digit-${index + 1}-modifier-${modifier}`,
    ...entries(cells),
  )));
const noModifiedTouch = Pair.fnToKey((a, b) => a === NORMAL || b === NORMAL, 9);
const kingPairs = [[0, 1], [1, 0], [1, 1], [1, -1]].map(([dRow, dCol]) => {
  const other = graph.step(cells[0], dRow, dCol);
  const origins = cells.filter(cell => graph.step(cell, dRow, dCol));
  return flags.makeReplicate(
    new Pair(noModifiedTouch, 'modified-cells-do-not-touch', ...flag([cells[0], other])),
    flag(origins),
  );
});

return [
  new Shape('9x9'),
  flags.toVar('modifier states'),
  flags.makeReplicate(new Given(flags.cells()[0], NORMAL, DOUBLER, HALVER)),
  ...cageConstraints,
  ...modifierRegions.flatMap(region => [
    new ContainExact(`${DOUBLER}`, ...flag(region)),
    new ContainExact(`${HALVER}`, ...flag(region)),
  ]),
  ...digitModifiers,
  ...kingPairs,
];
