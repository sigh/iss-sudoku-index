// Title: One Pea, Two Perspectives
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=zN9pbslYtlU
// Source: https://sudokupad.app/isnqvw5z9r

// Normal 6x6 sudoku: default Shape('6x6') boxes are 2 rows x 3 cols, which
// matches the puzzle's own region array.
//
// Duality: the single drawn line carries two independent split-pea readings
// over the same pair of circles (the line's two endpoints, R6C6 and R4C6):
//   - Split Pea Line: the digits strictly between the circles sum to the
//     two-digit number the circles form.
//   - Split Pea Line (full): the digits on the whole line, including the
//     circles, sum to a two-digit number formed the same way.
// Neither rule sentence says which circle holds the tens digit, and nothing
// ties the tens/ones assignment of one reading to the other, so each
// reading is encoded as an Or over both tens/ones assignments of the same
// two circles, independently.

// The drawn line, in path order from R6C6 to R4C6, 21 cells.
const line = [
  'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R5C2', 'R5C1', 'R4C1', 'R3C1',
  'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R2C4', 'R1C5', 'R1C6',
  'R2C6', 'R3C5', 'R4C6',
];

// The two circled cells, drawn at the line's two endpoints.
const circleA = 'R6C6';
const circleB = 'R4C6';

// Cells strictly between the circles: the line minus its first and last (circled) cells.
const between = line.slice(1, -1);

// Sum(cells) == 10*tensCell + onesCell, tried both ways round since the
// rules never fix which circle is tens. When tensCell/onesCell are already
// members of `cells` (the "full" reading), the extra [cell, coeff] terms
// combine with that cell's default coefficient 1, per Sum's documented
// cell-may-repeat-with-different-coefficients semantics.
function eitherOrderTotal(a, b, cells) {
  return new Or([
    new Sum(0, ...cells, [a, -10], [b, -1]),
    new Sum(0, ...cells, [a, -1], [b, -10]),
  ]);
}

return [
  new Shape('6x6'),

  // Split Pea Line: digits strictly between the two circles.
  eitherOrderTotal(circleA, circleB, between),

  // Split Pea Line (full): all digits on the line, circles included.
  eitherOrderTotal(circleA, circleB, line),
];
