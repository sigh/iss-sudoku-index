// Title: 10/24/2022: Jango Plays Jenga
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=j-60lxKeWJI
// Source: https://tinyurl.com/24nndkcn

// Normal sudoku rules apply. Cages of the same shape are clones: matching
// relative positions contain the same digit. The two tables list the drawn
// no-total cages in top-left, top-right, bottom-left, bottom-right order for
// the 2x2 cages, and top-left, top-right, bottom-right order for the L cages.
const CLONE_2X2 = [
  ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
  ['R3C5', 'R3C6', 'R4C5', 'R4C6'],
  ['R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R6C4', 'R6C5', 'R7C4', 'R7C5'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2'],
  ['R8C7', 'R8C8', 'R9C7', 'R9C8'],
];
const CLONE_L = [
  ['R3C1', 'R3C2', 'R4C2'],
  ['R6C2', 'R6C3', 'R7C3'],
  ['R8C4', 'R8C5', 'R9C5'],
  ['R7C8', 'R7C9', 'R8C9'],
  ['R4C7', 'R4C8', 'R5C8'],
];

// Each SameValues call compares singleton corresponding positions, so it fixes
// one relative position across every same-shaped cage.
const cloneRules = groups => groups[0].map((_, i) =>
  new SameValues(groups.length, ...groups.map(group => group[i])));

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C4', 2), new Given('R1C7', 3),
  new Given('R5C3', 4), new Given('R5C5', 5), new Given('R5C7', 6),
  new Given('R9C3', 7), new Given('R9C6', 8), new Given('R9C9', 9),
  ...cloneRules(CLONE_2X2),
  ...cloneRules(CLONE_L),
];
