// Title: "No Bulb" Thermo Sudoku
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=UYFKy6udoOE
// Source: https://cracking-the-cryptic.web.app/sudoku/GBfJQ9b2f9

// Normal sudoku rules apply. Each gray line has exactly one thermometer bulb.
// The bulb need not be at an endpoint of the line -- if it sits mid-line, the
// line forms two thermometers, one running each way from the bulb. Digits
// inside a thermometer increase starting from the bulb.
//
// The payload draws six plain gray lines with no colour variation and no
// endpoint marker, so the bulb's cell along each line is left to the solver.
// For a line of cells c0..cn (drawn order), the bulb at index k splits the
// line into two arms, [ck..c0] and [ck..cn], each required to increase away
// from ck (a bulb at either end leaves only one live arm). That is exactly a
// disjunction over bulb position, each branch an And of the (up to) two
// resulting Thermo constraints -- Thermo's own first argument is its bulb.
function noBulbThermo(cells) {
  const n = cells.length;
  const branches = [];
  for (let k = 0; k < n; k++) {
    const left = cells.slice(0, k + 1).reverse(); // ck, ck-1, ..., c0
    const right = cells.slice(k); // ck, ck+1, ..., cn
    const arms = [];
    if (left.length > 1) arms.push(new Thermo(...left));
    if (right.length > 1) arms.push(new Thermo(...right));
    branches.push(arms.length === 1 ? arms[0] : new And(arms));
  }
  return new Or(branches);
}

// Line geometry transcribed from the drawn waypoints (all six lines share
// colour #CFCFCF, thickness 13, and carry no endpoint styling).
const lines = [
  // Row 1, straight across.
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  // Rows 3-4, out along row 3 and back along row 4.
  ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
    'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'],
  // Column 4, straight down.
  ['R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'],
  // Loop inside the bottom-left box.
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R8C2', 'R8C1', 'R9C1'],
  // Loop inside the middle-right box.
  ['R5C6', 'R5C7', 'R5C8', 'R6C8', 'R6C7', 'R6C6'],
  // Loop inside the bottom-right box.
  ['R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R8C8', 'R9C8', 'R9C7'],
];

return [
  new Shape('9x9'),

  // Givens, per the drawn grid.
  new Given('R2C8', 3),
  new Given('R5C5', 1),
  new Given('R8C2', 2),

  ...lines.map(noBulbThermo),
];
