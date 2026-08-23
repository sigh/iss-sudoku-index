// Title: Broken Renbarrow
// Author: G
// Video: https://www.youtube.com/watch?v=NQpTUUOVOXk
// Source: https://app.crackingthecryptic.com/sudoku/rtnR6tQR8m

// Normal sudoku rules apply (default Shape row/col/box all-different).
//
// "The digit on one end of each line is the sum of the 'other digits' on the
// same line. Those 'other digits' are a consecutive non-repeating set in any
// order." Every cell on every line carries an identical small circle (same
// fill, same size) in the drawn data -- nothing in the art marks which end
// holds the sum digit. So for each line the sum end is encoded as a
// disjunction over its two drawn endpoints (first vs. last waypoint): one
// reading has the first-drawn endpoint as the sum with the remaining cells
// forming the consecutive run, the other has the last-drawn endpoint as the
// sum. `Renban` gives the consecutive/non-repeating run; `EqualSum` ties the
// endpoint's single-cell segment to the total of the rest.
function renbarrowLine(cells) {
  const first = cells[0];
  const last = cells[cells.length - 1];
  const rest = (excludeCell) => cells.filter(c => c !== excludeCell);

  const hyp = (sumCell) => {
    const others = rest(sumCell);
    return new And([
      new Renban(...others),
      new EqualSum([sumCell], others),
    ]);
  };

  return new Or([hyp(first), hyp(last)]);
}

// Line cell lists, drawn-order (first/last cell = the two endpoints), from
// the payload's `lines` waypoints (source geometry, straight segments
// interpolated through their intermediate cells):
const lines = [
  ['R1C1', 'R2C2', 'R2C1'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R3C7', 'R2C7', 'R1C8'],
  ['R1C9', 'R2C8', 'R3C8', 'R4C8'],
  ['R4C6', 'R4C7', 'R5C8'],
  ['R5C6', 'R5C7', 'R6C8'],
  ['R7C7', 'R8C8', 'R9C8'],
  ['R8C6', 'R8C7', 'R9C6'],
  ['R5C5', 'R5C4', 'R5C3'],
  ['R6C3', 'R7C3', 'R8C3', 'R9C2'],
  ['R3C1', 'R4C1', 'R5C1'],
];

return [
  new Shape('9x9'),
  ...lines.map(renbarrowLine),
];
