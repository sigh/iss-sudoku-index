// Title: Violet Owl
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=zl7OCqkWQWY
// Source: https://app.crackingthecryptic.com/sudoku/FGHJh9tPqT

// Normal sudoku rules apply, standard 3x3 boxes, two givens.
//
// Purple lines: digits form a non-repeating consecutive set, in any order
// (Renban). 15 lines are drawn; a 16th line in the source renders nothing
// (no path), so it is excluded (not a clue).
//
// Grey "between" lines: four grey circles sit on cells R2C3, R2C7, R7C3,
// R7C7. Four grey paths connect pairs of these circle cells; despite each
// path visually bending away from a straight connector, the circle cells are
// the two bulbs (ends) of the between line, joined to the drawn path by a
// short connector stroke. Between(cells) takes the two end cells as the
// circle bulbs and every digit at a middle cell must lie strictly between
// them -- exactly this rule's "values in between those in the circles."

function renban(...cells) {
  return new Renban(...cells);
}

function between(...cells) {
  return new Between(...cells);
}

const purpleLines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R2C4', 'R3C5', 'R2C6'],
  ['R4C4', 'R4C5', 'R4C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C6'],
  ['R6C3', 'R7C4'],
  ['R3C9', 'R4C9', 'R5C9'],
  ['R3C1', 'R4C1', 'R5C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R7C2', 'R8C2', 'R9C2'],
  ['R8C3', 'R9C4'],
  ['R9C6', 'R8C7'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R7C9', 'R8C9', 'R9C9'],
];

const greyLines = [
  ['R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7'],
  ['R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C3'],
  ['R2C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C7'],
  ['R7C3', 'R8C4', 'R8C5', 'R8C6', 'R7C7'],
];

return [
  new Shape('9x9'),
  new Given('R4C3', 3),
  new Given('R7C5', 3),
  ...purpleLines.map(cells => renban(...cells)),
  ...greyLines.map(cells => between(...cells)),
];
