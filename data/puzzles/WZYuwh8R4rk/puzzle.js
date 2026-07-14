// Title: Field of View
// Author: Matt Tressel
// Video: https://www.youtube.com/watch?v=WZYuwh8R4rk
// Source: https://sudokupad.app/mjek1gdfcg

// Normal sudoku rules apply.
//
// Magnets: a digit in a magnet cell (M) is the sum of all digits seen in
// the indicated direction, up to the first cell seen that contains a digit
// larger than M. Modelled as one NFA per magnet: it scans the magnet cell
// itself, then the ray of cells to the grid edge in the marked direction.
// The first value scanned (the magnet cell) sets the target M; each later
// digit that is <= M and does not push the running sum past M keeps
// summing; the first digit > M freezes the sum for the rest of the ray
// (its own value, and everything after it, is excluded from the sum); a
// branch whose running sum exceeds M without a larger digit having been
// seen is dead, since only positive digits remain to add. Accept iff the
// final sum equals M. Directions were read from the small arrow-shaped
// pill drawn in each magnet cell.

const graph = cellGraph('9x9');

const magnetSpec = NFA.encodeSpec({
  startState: { target: null, sum: 0, stopped: false },
  transition: ({ target, sum, stopped }, value) => {
    if (target === null) return { target: value, sum: 0, stopped: false };
    if (stopped) return { target, sum, stopped: true };
    if (value > target) return { target, sum, stopped: true };
    const next = sum + value;
    if (next > target) return undefined; // dead branch: sum only grows from here
    return { target, sum: next, stopped: false };
  },
  accept: ({ target, sum }) => target !== null && sum === target,
}, 9);

// [magnet cell, dRow, dCol] - direction the magnet's arrow points.
const MAGNETS = [
  ['R2C2', 0, 1],   // East
  ['R2C5', 0, -1],  // West
  ['R2C7', 0, 1],   // East
  ['R3C3', 0, -1],  // West
  ['R4C2', 1, 0],   // South
  ['R4C5', 0, -1],  // West
  ['R4C8', 0, -1],  // West
  ['R5C4', 0, -1],  // West
  ['R5C6', -1, 0],  // North
  ['R6C5', 1, 0],   // South
  ['R7C2', -1, 0],  // North
  ['R7C8', -1, 0],  // North
  ['R8C6', -1, 0],  // North
  ['R8C8', -1, 0],  // North
  ['R9C3', 0, -1],  // West
];

const magnets = MAGNETS.map(
  ([cell, dRow, dCol]) => new NFA(magnetSpec, 'Magnet', ...graph.ray(cell, dRow, dCol)));

return [
  new Shape('9x9'),
  ...magnets,
];
