// Title: September 2, 2021: Next to 6
// Author: Setter 3
// Video: https://www.youtube.com/watch?v=z-CQLijElrk
// Source: https://tinyurl.com/7fpayyae

// Normal 6x6 sudoku rules apply (1-6 once each in every row, column and box).
// Clues outside a row or column list *all* digits in that row/column that sit
// immediately next to the 6 (same row for a row clue, same column for a
// column clue) -- an exact set, not just some of them. A lane with no outside
// clue is left unconstrained (source: "If there is no clue outside of a row
// or column, then you don't necessarily know which digits are adjacent to
// the 6").
//
// Outside clues, transcribed from the drawn labels beside the grid:
//   row 1:    {2}
//   row 2:    {3, 5}
//   row 5:    {3, 5}
//   row 6:    {4}
//   column 2: {2, 3}
//   column 5: {4, 5}
// Rows 3, 4 and columns 1, 3, 4, 6 carry no outside clue and are unconstrained.

const graph = cellGraph('6x6');

// digits -> bitmask (bit v-1 set for each digit v).
const mask = (...digits) => digits.reduce((m, d) => m | (1 << (d - 1)), 0);

// Scans a lane in printed order and accumulates a bitmask of every digit
// that has appeared immediately before or after a 6 in that lane. `prev`
// holds the previous cell's value (0 = none read yet, so the sentinel is
// never mistaken for digit 6). Accept only when the finished mask equals the
// clue's exact set: the rule says the clue shows *all* such digits, so this
// is an equality check, not "at least these".
const nextToSixSpec = (targetMask) => NFA.encodeSpec({
  startState: { prev: 0, mask: 0 },
  transition: ({ prev, mask }, value) => {
    let next = mask;
    if (value === 6 && prev !== 0) next |= 1 << (prev - 1);
    if (prev === 6) next |= 1 << (value - 1);
    return { prev: value, mask: next };
  },
  accept: ({ mask }) => mask === targetMask,
}, 6);

const laneClues = [
  { cells: graph.row(1), digits: [2] },
  { cells: graph.row(2), digits: [3, 5] },
  { cells: graph.row(5), digits: [3, 5] },
  { cells: graph.row(6), digits: [4] },
  { cells: graph.column(2), digits: [2, 3] },
  { cells: graph.column(5), digits: [4, 5] },
];

const nextToSixConstraints = laneClues.map(({ cells, digits }) =>
  new NFA(nextToSixSpec(mask(...digits)), 'nextTo6', cells));

return [
  new Shape('6x6'),
  ...nextToSixConstraints,
];
