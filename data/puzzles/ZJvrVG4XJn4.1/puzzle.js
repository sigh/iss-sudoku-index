// Title: 2/26/23: Block Sum Relations
// Author: clover!
// Video: https://www.youtube.com/watch?v=ZJvrVG4XJn4
// Source: https://tinyurl.com/4ate22s7

// Normal sudoku rules apply. Each drawn "=" circle sits on the edge between
// two orthogonally adjacent cells and relates the three cells on one side of
// that edge (row-wise or column-wise) to the three on the other side: their
// sums must match. Orientation (row vs column relation) follows the pair the
// circle straddles -- confirmed against both worked examples in the rules
// text (R2C3|R2C4 and R6C8|R7C8). Each pair below is provenance for one
// EqualSum group: the two segments of three cells it relates.
return [
  new Shape('9x9'),

  new Given('R1C1', 7), new Given('R1C3', 8), new Given('R1C8', 2),
  new Given('R2C4', 2), new Given('R2C6', 4),
  new Given('R3C1', 9), new Given('R3C3', 1),
  new Given('R4C2', 7), new Given('R4C4', 4), new Given('R4C6', 9), new Given('R4C8', 1),
  new Given('R5C5', 7),
  new Given('R6C2', 3), new Given('R6C4', 8), new Given('R6C6', 1), new Given('R6C8', 9),
  new Given('R7C7', 2), new Given('R7C9', 8),
  new Given('R8C4', 3), new Given('R8C6', 5),
  new Given('R9C2', 6), new Given('R9C7', 9), new Given('R9C9', 1),

  // Circle straddling R2C3|R2C4 (row 2): left three = right three.
  new EqualSum(['R2C1', 'R2C2', 'R2C3'], ['R2C4', 'R2C5', 'R2C6']),
  // Circle straddling R8C6|R8C7 (row 8): left three = right three.
  new EqualSum(['R8C4', 'R8C5', 'R8C6'], ['R8C7', 'R8C8', 'R8C9']),
  // Circle straddling R6C5|R7C5 (col 5): above three = below three.
  new EqualSum(['R4C5', 'R5C5', 'R6C5'], ['R7C5', 'R8C5', 'R9C5']),
  // Circle straddling R3C5|R4C5 (col 5): above three = below three.
  new EqualSum(['R1C5', 'R2C5', 'R3C5'], ['R4C5', 'R5C5', 'R6C5']),
  // Circle straddling R3C2|R4C2 (col 2): above three = below three.
  new EqualSum(['R1C2', 'R2C2', 'R3C2'], ['R4C2', 'R5C2', 'R6C2']),
  // Circle straddling R6C8|R7C8 (col 8): above three = below three.
  new EqualSum(['R4C8', 'R5C8', 'R6C8'], ['R7C8', 'R8C8', 'R9C8']),
  // Circle straddling R5C3|R5C4 (row 5): left three = right three.
  new EqualSum(['R5C1', 'R5C2', 'R5C3'], ['R5C4', 'R5C5', 'R5C6']),
  // Circle straddling R5C6|R5C7 (row 5): left three = right three.
  new EqualSum(['R5C4', 'R5C5', 'R5C6'], ['R5C7', 'R5C8', 'R5C9']),
];
