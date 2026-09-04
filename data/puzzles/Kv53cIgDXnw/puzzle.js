// Title: Double Dutch Sudoku
// Author: Arvid Baars & Richard Stolk
// Video: https://www.youtube.com/watch?v=Kv53cIgDXnw
// Source: https://cracking-the-cryptic.web.app/sudoku/gm4rTLqJ8P

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// No givens.
//
// The 24-cell green line is a Palindrome.
//
// Beside 18 of the 36 row-ends/column-ends (each row has a left end and a
// right end; each column has a top end and a bottom end), a pair of double
// chevrons marks that end's first three cells (counted in from the edge):
// those three digits are strictly ascending or descending, and the chevron's
// point -- which faces away from its two arms, per the raw waypoints -- names
// which of the three is highest (the cell nearest the direction the point
// faces). Confirmed against external-video-frame-713s.jpg, which draws every
// chevron pair explicitly. The other 18 ends carry no chevrons, so their
// first three are neither ascending nor descending: with all-different
// already guaranteed by sudoku, that leaves exactly the two cases where the
// middle cell is a strict peak or valley, i.e. NOT(a<b<c) AND NOT(a>b>c).
// A row's own two ends (or a column's own two ends) never share a cell, so
// they cannot conflict with each other.

function notMonotonic(a, b, c) {
  // Peak (b is the local max) or valley (b is the local min): the only two
  // relative orders left once strictly ascending and strictly descending are
  // excluded for three distinct digits.
  return new Or([
    new And([new GreaterThan(b, a), new GreaterThan(b, c)]),
    new And([new GreaterThan(a, b), new GreaterThan(c, b)]),
  ]);
}

return [
  new Shape('9x9'),

  new Palindrome(
    'R3C4', 'R3C3', 'R2C4', 'R1C5', 'R2C6', 'R3C7', 'R3C6', 'R4C7', 'R5C8',
    'R5C7', 'R5C6', 'R6C7', 'R7C8', 'R7C7', 'R7C6', 'R8C5', 'R7C4', 'R7C3',
    'R7C2', 'R6C3', 'R5C4', 'R5C3', 'R5C2', 'R4C3'
  ),

  // Arrowed row-ends (highest, middle, lowest in that order).
  new GreaterThan('R1C9', 'R1C8', 'R1C7'),
  new GreaterThan('R2C1', 'R2C2', 'R2C3'),
  new GreaterThan('R3C1', 'R3C2', 'R3C3'),
  new GreaterThan('R3C7', 'R3C8', 'R3C9'),
  new GreaterThan('R6C9', 'R6C8', 'R6C7'),
  new GreaterThan('R7C3', 'R7C2', 'R7C1'),
  new GreaterThan('R7C7', 'R7C8', 'R7C9'),
  new GreaterThan('R8C3', 'R8C2', 'R8C1'),
  new GreaterThan('R9C3', 'R9C2', 'R9C1'),

  // Arrowed column-ends.
  new GreaterThan('R1C3', 'R2C3', 'R3C3'),
  new GreaterThan('R9C3', 'R8C3', 'R7C3'),
  new GreaterThan('R1C4', 'R2C4', 'R3C4'),
  new GreaterThan('R9C4', 'R8C4', 'R7C4'),
  new GreaterThan('R3C5', 'R2C5', 'R1C5'),
  new GreaterThan('R3C6', 'R2C6', 'R1C6'),
  new GreaterThan('R7C6', 'R8C6', 'R9C6'),
  new GreaterThan('R3C7', 'R2C7', 'R1C7'),
  new GreaterThan('R9C7', 'R8C7', 'R7C7'),

  // Un-arrowed row-ends.
  notMonotonic('R1C1', 'R1C2', 'R1C3'),
  notMonotonic('R2C9', 'R2C8', 'R2C7'),
  notMonotonic('R4C1', 'R4C2', 'R4C3'),
  notMonotonic('R4C9', 'R4C8', 'R4C7'),
  notMonotonic('R5C1', 'R5C2', 'R5C3'),
  notMonotonic('R5C9', 'R5C8', 'R5C7'),
  notMonotonic('R6C1', 'R6C2', 'R6C3'),
  notMonotonic('R8C9', 'R8C8', 'R8C7'),
  notMonotonic('R9C9', 'R9C8', 'R9C7'),

  // Un-arrowed column-ends.
  notMonotonic('R1C1', 'R2C1', 'R3C1'),
  notMonotonic('R9C1', 'R8C1', 'R7C1'),
  notMonotonic('R1C2', 'R2C2', 'R3C2'),
  notMonotonic('R9C2', 'R8C2', 'R7C2'),
  notMonotonic('R9C5', 'R8C5', 'R7C5'),
  notMonotonic('R1C8', 'R2C8', 'R3C8'),
  notMonotonic('R9C8', 'R8C8', 'R7C8'),
  notMonotonic('R1C9', 'R2C9', 'R3C9'),
  notMonotonic('R9C9', 'R8C9', 'R7C9'),
];
