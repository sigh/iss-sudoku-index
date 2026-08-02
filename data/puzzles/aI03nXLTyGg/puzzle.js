// Title: Onion
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=aI03nXLTyGg
// Source: https://sudokupad.app/i9wx9vdy41

// Rules encoded, in full: normal Sudoku; a digit in a circled cell is the number
// of circled cells in the grid holding that digit; and digits on a line
// connecting circled cells lie strictly between the digits in that line's
// circled endpoints. There are no givens and nothing is omitted.

// Circled cells, transcribed from the white-fill, black-border circle underlays.
const circleCells = [
  'R1C2', 'R1C3', 'R1C4', 'R1C6', 'R1C7', 'R1C8',
  'R2C1', 'R2C5', 'R2C9',
  'R3C1', 'R3C5', 'R3C6', 'R3C9',
  'R4C1', 'R4C5', 'R4C7', 'R4C9',
  'R5C2', 'R5C8',
  'R6C1', 'R6C3', 'R6C5', 'R6C9',
  'R7C1', 'R7C4', 'R7C5', 'R7C9',
  'R8C1', 'R8C5', 'R8C9',
  'R9C2', 'R9C3', 'R9C4', 'R9C6', 'R9C7', 'R9C8',
];

// The eight grey strokes, as the cell path each covers; all eight share one
// colour and thickness. The last stroke is drawn closed - it returns to its
// starting cell R9C8 - so that cell is listed at both ends.
const greyStrokes = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R2C5', 'R2C6', 'R3C6'],
  ['R2C9', 'R3C8', 'R4C9'],
  ['R5C2', 'R6C2', 'R6C3'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R9C2', 'R8C3', 'R9C4'],
  ['R9C8', 'R8C8', 'R8C9', 'R9C9', 'R9C8'],
];

const circled = new Set(circleCells);

// The rule gives a between line circled endpoints, so each stroke is cut at
// every circled cell it reaches and each maximal arc between two consecutive
// circled cells is one between line. All eight strokes alternate circled cell,
// uncircled interior, circled cell, so the cut lands on the drawn shape in every
// case. The seven open strokes carry circles only at their two ends and give one
// arc each. The closed stroke passes through the two circled cells R9C8 and
// R8C9, which cut the loop into its two drawn halves R9C8-R8C8-R8C9 and
// R8C9-R9C9-R9C8; keeping both uses every drawn edge and gives the uncircled
// R8C8 and R9C9 the same pair of endpoints.
const betweenLines = greyStrokes.flatMap((stroke) => {
  const arcs = [];
  let arc = [];
  for (const cell of stroke) {
    arc.push(cell);
    if (circled.has(cell) && arc.length > 1) {
      arcs.push(arc);
      arc = [cell];
    }
  }
  return arcs;
});

return [
  new Shape('9x9'),
  new CountingCircles(...circleCells),
  ...betweenLines.map((cells) => new Between(...cells)),
];
