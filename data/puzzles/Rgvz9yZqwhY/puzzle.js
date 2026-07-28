// Title: Fog! Hammer time!
// Author: Elytron
// Video: https://www.youtube.com/watch?v=Rgvz9yZqwhY
// Source: https://sudokupad.app/n3e6mr3qwr

// Standard 9x9 Sudoku; product bands, three Little Killers, and the drawn
// non-negative black Kropki dots are encoded. Fog is UI-only.
const productBand = (name, endpointA, endpointB, interior, valuesA, valuesB) => {
  // Each alternative fixes the two endpoint digits and gives the interior
  // band their product as its sum.
  const alternatives = [];
  for (const a of valuesA) {
    for (const b of valuesB) {
      alternatives.push(new And([
        new Given(endpointA, a),
        new Given(endpointB, b),
        new Sum(a * b, ...interior),
      ]));
    }
  }
  return new Or(alternatives);
};

// The drawn coloured circles and paths, translated from the central 9x9 grid.
const productBands = [
  productBand('green', 'R4C4', 'R1C1', ['R3C3', 'R2C2'], [4, 5], [1]),
  productBand(
    'blue',
    'R4C3',
    'R3C4',
    ['R5C2', 'R6C2', 'R7C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7',
      'R3C7', 'R2C6', 'R2C5'],
    [3, 4],
    [2, 3, 4],
  ),
  productBand(
    'pink',
    'R9C3',
    'R8C5',
    ['R9C4', 'R9C5', 'R9C6'],
    [3, 7, 9],
    [5, 8],
  ),
];

return [
  new Shape('9x9'),
  ...productBands,

  // The three drawn Little Killer totals and their diagonals.
  new Sum(13, 'R1C6', 'R2C7', 'R3C8', 'R4C9'),
  new Sum(25, 'R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'),
  new Sum(46, 'R8C9', 'R7C8', 'R6C7', 'R5C6', 'R4C5', 'R3C4',
    'R2C3', 'R1C2'),

  // The three drawn black Kropki dots.
  new BlackDot('R2C8', 'R2C9'),
  new BlackDot('R8C1', 'R9C1'),
  new BlackDot('R1C3', 'R1C4'),
];
