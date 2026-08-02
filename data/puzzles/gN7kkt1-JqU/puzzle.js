// Title: Beautiful Day
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=gN7kkt1-JqU
// Source: https://sudokupad.app/1c1i6cf4wu

// Normal 9x9 Sudoku. Arrow circles equal their arms' sums; black dots are 1:2,
// white dots are consecutive, and one unknown motivation cell increases on every
// horizontal, vertical, and diagonal ray away from it. Fog and FOGLIGHT are UI-only.
const motivationOptions = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    const rays = [];
    for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
      const ray = [makeCellId(row, col)];
      for (let r = row + dr, c = col + dc; r >= 1 && r <= 9 && c >= 1 && c <= 9; r += dr, c += dc) {
        ray.push(makeCellId(r, c));
      }
      if (ray.length > 1) rays.push(new Thermo(...ray));
    }
    motivationOptions.push(new And(rays));
  }
}

return [
  new Shape('9x9'),
  // Arrow paths transcribed from the four coloured arrow drawings.
  new Arrow('R1C6', 'R2C5', 'R1C4', 'R2C4'),
  new Arrow('R7C2', 'R6C1', 'R5C1'),
  new Arrow('R5C4', 'R6C3', 'R7C3'),
  new Arrow('R2C3', 'R3C4', 'R4C4', 'R3C3', 'R3C2', 'R4C1'),
  // Drawn black and white Kropki dots respectively; no negative constraint.
  new BlackDot('R2C2', 'R3C2'),
  new BlackDot('R1C2', 'R2C2'),
  new BlackDot('R2C6', 'R2C7'),
  new BlackDot('R5C2', 'R5C3'),
  new WhiteDot('R3C4', 'R4C4'),
  new WhiteDot('R2C6', 'R3C6'),
  // Each option selects a possible motivation cell and constrains all rays from it.
  new Or(motivationOptions),
];
