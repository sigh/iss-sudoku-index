// Title: Product Ltd.
// Author: Paul Marx
// Video: https://www.youtube.com/watch?v=8-Qdo445nTQ
// Source: https://app.crackingthecryptic.com/sudoku/4m7b7qNRn9

// Normal sudoku rules apply. Each outside clue counts, for its row or column,
// how many adjacent-cell pairs have a product over 30; rows/columns with no
// printed clue (R4, R6, R9, C3, C4, C6, C8) are unconstrained by this rule.
// Clue values transcribed from the drawn outside-grid overlays (single-digit
// text, no nearest-grid-first/as-printed direction ambiguity).
const rowTargets = { 1: 0, 2: 0, 3: 0, 5: 5, 7: 3, 8: 0 };
const colTargets = { 1: 0, 2: 1, 5: 0, 7: 2, 9: 3 };

const graph = cellGraph('9x9');

// Scans a line's cells in order, tracking the previous digit and a count of
// adjacent pairs whose product exceeds 30, clamped at target+1 (a sink state
// meaning "already too many") so the state space stays small. Accepts only
// when the final count equals the printed clue.
function productOver30Count(target, cells) {
  const spec = NFA.encodeSpec({
    startState: { prev: null, count: 0 },
    transition: ({ prev, count }, value) => {
      if (prev === null) return { prev: value, count };
      const hit = prev * value > 30 ? 1 : 0;
      return { prev: value, count: Math.min(count + hit, target + 1) };
    },
    accept: ({ count }) => count === target,
  }, 9);
  return new NFA(spec, 'ProductOver30', ...cells);
}

const rowConstraints = Object.entries(rowTargets).map(
  ([r, target]) => productOver30Count(target, graph.row(Number(r))));
const colConstraints = Object.entries(colTargets).map(
  ([c, target]) => productOver30Count(target, graph.column(Number(c))));

return [
  new Shape('9x9'),

  // Givens (drawn digits).
  new Given('R1C8', 9),
  new Given('R2C2', 9),
  new Given('R2C4', 8),
  new Given('R3C5', 9),
  new Given('R6C8', 3),
  new Given('R7C3', 1),
  new Given('R8C1', 7),
  new Given('R8C5', 4),
  new Given('R9C4', 1),
  new Given('R9C7', 6),

  ...rowConstraints,
  ...colConstraints,
];
