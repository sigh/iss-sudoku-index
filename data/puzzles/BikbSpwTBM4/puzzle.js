// Title: Untitled
// Author: Peter C Hayward
// Video: https://www.youtube.com/watch?v=BikbSpwTBM4
// Source: https://cracking-the-cryptic.web.app/sudoku/hLbJqLdFQG

// Normal sudoku rules apply (default Shape gives rows/cols/boxes AllDifferent).
// There are ten colored areas (edge-connected groups of same-colored cells;
// five colors are reused across separate areas). In each area, two cells are
// circled; the two circled
// digits are read as a two-digit number, and the sum of every digit in the
// area (including the circled cells) equals that number. Digits do not
// repeat within an area.
//
// Every area's two circled cells sit in the same row, horizontally adjacent,
// with the lower-numbered column on the left. Read left-to-right (normal
// numeral convention: leftmost digit is most significant), so the left
// circled cell is the tens digit and the right one is the ones digit -- this
// is not ambiguous in the drawn art, since all ten pairs share the same
// left/right layout.

// Each area: [tensCell, onesCell, ...restOfCells]. The tens/ones cells are
// also area members and are included again in the cage's own cell list.
const areas = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C2'],
  ['R6C3', 'R6C4', 'R7C1', 'R7C2', 'R7C3', 'R7C4'],
  ['R6C8', 'R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C8', 'R9C8'],
  ['R1C3', 'R1C4', 'R2C3', 'R2C4', 'R3C3'],
  ['R5C6', 'R5C7', 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R8C5', 'R8C6'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R4C1', 'R4C2', 'R5C1', 'R6C1'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R3C4', 'R3C5', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R5C5', 'R6C5'],
  ['R3C8', 'R3C9', 'R4C9'],
];

function selfCluedArea(cells) {
  const [tensCell, onesCell] = cells;
  return [
    // Sum of all cells in the area equals 10*tens + 1*ones; tens/onesCell
    // are counted once for the area total and again (with negative
    // coefficients) to subtract the two-digit number they encode.
    new Sum(0, ...cells, [tensCell, -10], [onesCell, -1]),
    new AllDifferent(...cells),
  ];
}

return [
  new Shape('9x9'),
  ...areas.flatMap(selfCluedArea),
];
