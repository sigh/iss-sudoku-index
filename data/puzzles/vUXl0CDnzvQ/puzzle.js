// Title: Cracker Sandwich
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=vUXl0CDnzvQ
// Source: https://app.crackingthecryptic.com/sudoku/BQf98jFLqh

// Normal sudoku rules apply, standard 3x3 boxes, no givens.
// Outside clues are Sandwich sums (digits strictly between the 1 and the 9
// in that row/column). The grey circles form a network of between lines:
// each Between(...) below is one drawn stroke, first/last cell the two
// circle endpoints (Between's own cells order does not affect semantics),
// middle cell(s) the digit(s) that must lie strictly between them. Endpoints
// were recovered from each stroke's raw waypoints (nearest circle to each
// end, including the diagonal strokes).
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const sandwiches = [
  Sandwich.fromCells(18, graph.column(3), geometry),
  Sandwich.fromCells(18, graph.column(7), geometry),
  Sandwich.fromCells(7, graph.row(2), geometry),
  Sandwich.fromCells(2, graph.row(4), geometry),
  Sandwich.fromCells(2, graph.row(5), geometry),
  Sandwich.fromCells(20, graph.row(6), geometry),
  Sandwich.fromCells(12, graph.row(8), geometry),
];

const betweenLines = [
  ['R3C2', 'R3C3', 'R3C4'],
  ['R3C2', 'R4C3', 'R5C4'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R5C2', 'R6C2', 'R7C2'],
  ['R5C4', 'R6C4', 'R7C4'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R7C6', 'R6C6', 'R5C6'],
  ['R7C4', 'R6C5', 'R5C6'],
  ['R5C6', 'R4C5', 'R3C4'],
  ['R5C4', 'R4C5', 'R3C6'],
  ['R3C6', 'R3C7', 'R3C8'],
  ['R3C8', 'R4C8', 'R5C8'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R5C6', 'R6C7', 'R7C8'],
  ['R5C8', 'R6C8', 'R7C8'],
];

return [
  new Shape('9x9'),
  ...sandwiches,
  ...betweenLines.map(cells => new Between(...cells)),
];
