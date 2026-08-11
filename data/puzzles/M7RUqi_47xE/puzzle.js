// Title: Pythagoras' Nightmare
// Author: Matthias J. Raives
// Video: https://www.youtube.com/watch?v=M7RUqi_47xE
// Source: https://app.crackingthecryptic.com/sudoku/bntpQqtDT4

// Normal sudoku rules apply, standard 3x3 boxes (default Shape).
//
// The sum of digits along each edge of a triangle must form a Pythagorean
// triple, with the largest number of the triple corresponding to the sum
// along the hypotenuse. There are 12 triangles in this puzzle.
//
// Every triangle here is drawn as an isosceles right (45-45-90) triangle, so
// an edge is always a straight run of cells (interpolated from the drawn
// polyline's wayPoints, per SudokuPad's [row,col] .5-is-a-cell-centre
// convention) and a triangle's two legs and hypotenuse always cover the same
// number of cells n. Because a Pythagorean triple's largest member c is
// always its hypotenuse, "largest -> hypotenuse" is automatic once c is
// fixed to the diagonal edge's sum -- it needs no separate ordering
// constraint. validPythagoreanTriples enumerates every (a,b,c) an n-cell
// edge can actually reach (each edge sums at least n, at most 9n, repeats
// allowed) with a^2+b^2=c^2; each triangle becomes the Or, over those
// triples, of the And of its three edges each summing to one member.
function validPythagoreanTriples(n) {
  const lo = n, hi = 9 * n;
  const triples = [];
  for (let c = lo; c <= hi; c++) {
    for (let a = lo; a < c; a++) {
      const b2 = c * c - a * a;
      const b = Math.round(Math.sqrt(b2));
      if (b * b === b2 && b >= lo && b <= hi) triples.push([a, b, c]);
    }
  }
  return triples;
}

function pythagoreanTriangle(leg1, leg2, hyp) {
  const n = leg1.length; // leg1, leg2 and hyp are always the same length here
  return new Or(validPythagoreanTriples(n).map(([a, b, c]) => new And([
    new Sum(a, ...leg1),
    new Sum(b, ...leg2),
    new Sum(c, ...hyp),
  ])));
}

// Triangle cell lists, transcribed from the drawn grey polylines. Each entry
// is [leg1, leg2, hyp] -- leg1 and leg2 meet at the triangle's right angle,
// hyp is the diagonal edge. A vertex cell is shared between the two edges
// that meet there, matching the drawn geometry.
const triangles = [
  // lines[0]: single triangle, right angle R1C2.
  [['R3C2', 'R2C2', 'R1C2'], ['R1C2', 'R1C3', 'R1C4'], ['R1C4', 'R2C3', 'R3C2']],
  // lines[1]: a unit square cut by its own diagonal (R3C3-R4C4) into two
  // triangles, right angles at R3C4 and R4C3.
  [['R4C4', 'R3C4'], ['R3C4', 'R3C3'], ['R3C3', 'R4C4']],
  [['R3C3', 'R4C3'], ['R4C3', 'R4C4'], ['R4C4', 'R3C3']],
  // lines[2]: single triangle, right angle R1C8.
  [['R1C8', 'R2C8'], ['R1C9', 'R1C8'], ['R2C8', 'R1C9']],
  // lines[3]: the big outer triangle, right angle R7C7.
  [['R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
   ['R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7'],
   ['R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2']],
  // lines[3] continued: four small "teeth" triangles carved from the outer
  // triangle's corners/hypotenuse by the same polyline. Their leg/hyp cells
  // reuse the outer triangle's own edge cells where the walk retraces them.
  [['R2C7', 'R3C7'], ['R3C7', 'R3C6'], ['R3C6', 'R2C7']],
  [['R4C5', 'R5C5'], ['R5C5', 'R5C4'], ['R5C4', 'R4C5']],
  [['R6C3', 'R7C3'], ['R7C3', 'R7C2'], ['R7C2', 'R6C3']],
  [['R7C6', 'R7C7'], ['R7C7', 'R6C7'], ['R6C7', 'R7C6']],
  // lines[4]: single triangle, right angle R8C8.
  [['R7C8', 'R8C8'], ['R8C8', 'R8C9'], ['R8C9', 'R7C8']],
  // lines[5]: single triangle, right angle R8C2.
  [['R7C2', 'R8C2'], ['R8C2', 'R8C3'], ['R8C3', 'R7C2']],
  // lines[6]: single triangle, right angle R4C1.
  [['R4C1', 'R5C1'], ['R4C2', 'R4C1'], ['R5C1', 'R4C2']],
];

const triangleConstraints = triangles.map(
  ([leg1, leg2, hyp]) => pythagoreanTriangle(leg1, leg2, hyp));

return [
  new Shape('9x9'),
  new Given('R1C1', 9),
  new Given('R1C3', 6),
  new Given('R3C1', 4),
  new Given('R9C9', 1),
  ...triangleConstraints,
];
