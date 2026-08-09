// Title: Huey, Duwey, Louie
// Author: Crusader175 (Alaric Taqi A.)
// Video: https://www.youtube.com/watch?v=FN5Ed4Ynxo0
// Source: https://app.crackingthecryptic.com/sudoku/8Bh622pLMP

// Normal 9x9 Sudoku. Digits along each arrow sum to the digit in that arrow's
// circle. Divide digits 1-9 into three different groups; the nine cells of
// box 5 carry letters A/B/C (three cells each) and same-letter cells hold
// digits from the same group. Two orthogonally adjacent cells may not hold
// digits from the same group.

const GROUPS = [1, 2, 3];
const DIGITS = Array.from({ length: 9 }, (_, i) => i + 1);

const graph = cellGraph('9x9');
const gridCells = graph.cells();

// One Var per digit records which group (1-3) that digit value belongs to,
// so the group is a fixed property of the digit, not the cell.
const digitGroups = new Var('G', 'group of digit 1 through 9', 9);
const groupCells = digitGroups.cells();
const groupDomain = groupCells.map(cell => new Given(cell, ...GROUPS));

// Whole-grid overlay: the group of whatever digit occupies each cell.
const colour = graph.makeOverlay('VC');
const colourDomain = colour.makeReplicate(new Given(colour.cells()[0], ...GROUPS));
const colourMatchesDigit = gridCells.map(cell => new Or(DIGITS.map(digit => new And([
  new Given(cell, digit),
  new SameValues(2, groupCells[digit - 1], colour.at(cell)),
]))));

// Box-5 letter cells, hand-transcribed from the nine "A"/"B"/"C" text
// overlays' nearestCell placements.
const letterCells = {
  A: ['R4C4', 'R5C6', 'R6C5'],
  B: ['R4C5', 'R5C4', 'R6C6'],
  C: ['R4C6', 'R5C5', 'R6C4'],
};
// Same-letter cells share a group. Pinning each letter's group to a distinct
// constant (1/2/3) both fixes the arbitrary group-label symmetry and encodes
// "three different groups" -- the letters name exactly the three groups.
const letterGroups = Object.entries(letterCells).flatMap(([letter, cells], i) => [
  new SameValues(3, ...colour.at(cells)),
  new Given(colour.at(cells[0]), GROUPS[i]),
]);

// Two orthogonally adjacent cells never share a group colour. Each edge is
// generated once via the right/down steps.
const noTouchSameGroup = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new AllDifferent(colour.at(cell), colour.at(other))));

// Arrows, hand-transcribed from the arrows array (waypoints snapped to cell
// centres); the first cell of each path is the circled sum cell, matching the
// underlay circle drawn there.
const arrows = [
  ['R1C1', 'R2C1', 'R2C2', 'R1C2'],
  ['R2C9', 'R3C8', 'R2C7'],
  ['R8C1', 'R7C2', 'R8C3'],
  ['R7C7', 'R6C8'],
  ['R7C7', 'R8C6', 'R9C5'],
  ['R7C4', 'R6C5', 'R5C6', 'R4C7'],
  ['R3C6', 'R4C5', 'R5C4', 'R6C3'],
  ['R3C3', 'R4C2'],
  ['R3C3', 'R2C4', 'R1C5'],
];

return [
  new Shape('9x9'),
  colour.toVar('cell group'),
  digitGroups,
  ...groupDomain,
  colourDomain,
  ...colourMatchesDigit,
  ...letterGroups,
  ...noTouchSameGroup,
  ...arrows.map(cells => new Arrow(...cells)),
  new Given('R1C4', 2),
  new Given('R9C6', 2),
];
