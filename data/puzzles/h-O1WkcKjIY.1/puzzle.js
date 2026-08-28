// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=h-O1WkcKjIY
// Source: https://cracking-the-cryptic.web.app/sudoku/Qd4drHbRJ3

// Normal sudoku rules apply; the grid carries no givens.
// Digits cannot repeat in cages, but the cage totals will need to be deduced.
// Each colored ring contains cages that all have the same total. However, the
// totals may differ from ring to ring. In addition, the sum of the numbers in
// each colored ring will appear in the rectangular outlines.
// Nothing is omitted.

// The four coloured rings are painted as full-cell backgrounds and each is
// exactly the border of a concentric square: blue rows/cols 1-9, green 2-8,
// gold 3-7, red 4-6. R5C5 is uncoloured and lies in no ring.
const ringPerimeter = (lo, hi) => {
  const cells = [];
  for (let r = lo; r <= hi; r++) {
    for (let c = lo; c <= hi; c++) {
      if (r === lo || r === hi || c === lo || c === hi) cells.push(makeCellId(r, c));
    }
  }
  return cells;
};

// Rings outermost first. `cages` transcribes the drawn cage outlines, which each
// lie wholly inside one ring; `box` transcribes the black rectangular outline
// drawn inside that ring, in left-to-right reading order (every rectangle spans
// a horizontal run of cells within one row).
const rings = [
  {
    cells: ringPerimeter(1, 9),
    cages: [
      ['R3C9', 'R4C9', 'R5C9', 'R6C9'],
      ['R7C1', 'R8C1', 'R9C1'],
      ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
      ['R9C7', 'R9C8'],
      ['R7C9', 'R8C9', 'R9C9'],
    ],
    box: ['R1C7', 'R1C8', 'R1C9'],
  },
  {
    cells: ringPerimeter(2, 8),
    cages: [
      ['R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5'],
      ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C2'],
      ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
    ],
    box: ['R2C2', 'R2C3', 'R2C4'],
  },
  {
    cells: ringPerimeter(3, 7),
    cages: [
      ['R3C3', 'R4C3', 'R5C3'],
      ['R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
      ['R7C3', 'R7C4', 'R7C5', 'R7C6'],
    ],
    box: ['R3C3', 'R3C4'],
  },
  {
    cells: ringPerimeter(4, 6),
    cages: [
      ['R4C4', 'R4C5', 'R4C6', 'R5C4'],
      ['R5C6', 'R6C6'],
      ['R6C4', 'R6C5'],
    ],
    box: ['R4C4', 'R4C5'],
  },
];

// No cage total is printed, so each cage contributes only its all-different.
const cages = rings.flatMap(
  (ring) => ring.cages.map((cells) => new Cage(0, ...cells)));

const equalCageTotals = rings.map((ring) => new EqualSum(...ring.cages));

// sum(ring cells) - (the box read as a decimal number) = 0. The box cells are
// themselves ring cells, so they appear twice in the argument list, once with
// coefficient 1 from the ring and once with their negative place value; ISS adds
// the two contributions.
const ringTotalsInBoxes = rings.map((ring) => new Sum(
  0,
  ...ring.cells,
  ...ring.box.map((cell, i) => [cell, -Math.pow(10, ring.box.length - 1 - i)])));

return [
  new Shape('9x9'),
  ...cages,
  ...equalCageTotals,
  ...ringTotalsInBoxes,
];
