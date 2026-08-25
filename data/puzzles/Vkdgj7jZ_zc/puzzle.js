// Title: SVS (296) - Flexible Sandwich Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=Vkdgj7jZ_zc
// Source: https://app.crackingthecryptic.com/webapp/QT7Mfrnt7B

// Normal 9x9 Sudoku. No givens. Each outside clue gives the sum of digits
// strictly between digit X and digit X+1 in that row/column, where X is the
// first digit seen scanning inward from the clue (the cell adjacent to it);
// X+1 then sits somewhere further along the line (video description).
const graph = cellGraph('9x9');

// Scans one row/column, cells ordered from the clue inward. The first cell
// read fixes X (must be 1-8: no transition exists for 9, since there would be
// no X+1, which is exactly how the rule excludes 9 from that position).
// Cells are then summed until X+1 is read, locking the sum; cells after that
// are unconstrained. Accepts iff the locked sum equals the clue target.
function flexibleSandwichNFA(target) {
  return NFA.encodeSpec({
    startState: {stage: 'first'},
    transition: (state, value) => {
      if (state.stage === 'first') {
        if (value < 1 || value > 8) return undefined;
        return {stage: 'seeking', x: value, sum: 0};
      }
      if (state.stage === 'seeking') {
        if (value === state.x + 1) return {stage: 'done', sum: state.sum};
        // Clamp: target + 1 is a sink meaning "already too many".
        return {stage: 'seeking', x: state.x, sum: Math.min(state.sum + value, target + 1)};
      }
      // stage === 'done': remaining cells are unconstrained.
      return state;
    },
    accept: state => state.stage === 'done' && state.sum === target,
  }, 9);
}

// Clue coordinates transcribed from the outside-clue overlays; direction is
// which edge of the grid each clue sits against (top/bottom/left/right).
const CLUES = [
  {label: 'left R3', target: 15, cells: graph.row(3)},
  {label: 'right R5', target: 21, cells: [...graph.row(5)].reverse()},
  {label: 'left R7', target: 23, cells: graph.row(7)},
  {label: 'right R7', target: 13, cells: [...graph.row(7)].reverse()},
  {label: 'left R8', target: 17, cells: graph.row(8)},
  {label: 'right R8', target: 19, cells: [...graph.row(8)].reverse()},
  {label: 'left R9', target: 10, cells: graph.row(9)},
  {label: 'top C2', target: 21, cells: graph.column(2)},
  {label: 'bottom C2', target: 4, cells: [...graph.column(2)].reverse()},
  {label: 'top C3', target: 39, cells: graph.column(3)},
  {label: 'bottom C3', target: 16, cells: [...graph.column(3)].reverse()},
  {label: 'bottom C4', target: 14, cells: [...graph.column(4)].reverse()},
  {label: 'top C7', target: 5, cells: graph.column(7)},
  {label: 'bottom C9', target: 18, cells: [...graph.column(9)].reverse()},
];

return [
  new Shape('9x9'),
  ...CLUES.map(({label, target, cells}) =>
    new NFA(flexibleSandwichNFA(target), `flexible sandwich ${label}`, ...cells)),
];
