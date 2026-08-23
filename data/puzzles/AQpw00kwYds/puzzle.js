// Title: Two-Tone Totals
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=AQpw00kwYds
// Source: https://sudokupad.app/m6sunffs9u

// Normal sudoku. Every cell is yellow or blue; each colour is orthogonally
// connected and no 2x2 block is monochrome. A purple two-cell frame has one
// colour and displays, as a two-digit number, the total of that colour in its
// 3x3 box. X clues sum to 10; black dots have a 1:2 ratio.

const YELLOW = 1;
const BLUE = 2;

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const boxes = graph.boxes();
const shade = graph.makeOverlay('YY');
const yellowValue = graph.makeOverlay('VY');
const shadeOf = cell => shade.at(cell);
const yellowOf = cell => yellowValue.at(cell);

// Each VY cell is its grid digit when yellow and the sentinel 1 when blue.
// These branches also restrict every shade Var to YELLOW or BLUE. For a box,
// yellow total = sum(VY) - count(blue) = sum(VY) - sum(VS) + 9.
const yellowContributions = gridCells.map(cell => new Or([
  new And([
    new Given(shadeOf(cell), YELLOW),
    new SameValues(2, cell, yellowOf(cell)),
  ]),
  new And([
    new Given(shadeOf(cell), BLUE),
    new Given(yellowOf(cell), 1),
  ]),
]));

const frames = [
  ['R1C2', 'R1C3'],
  ['R3C1', 'R3C2'],
  ['R5C2', 'R5C3'],
  ['R3C7', 'R3C8'],
  ['R1C7', 'R2C7'],
  ['R9C8', 'R9C9'],
  ['R7C4', 'R8C4'],
  ['R1C4', 'R1C5'],
  ['R7C8', 'R7C9'],
  ['R9C1', 'R9C2'],
  ['R9C4', 'R9C5'],
  ['R4C9', 'R5C9'],
  ['R4C5', 'R4C6'],
];

function frameConstraint(tens, ones) {
  const box = boxes.find(cells => cells.includes(tens));
  const yellowTotal = yellowValue.at(box);
  const boxShades = shade.at(box);
  return new And([
    // Both framed cells have the same colour.
    new SameValues(2, shadeOf(tens), shadeOf(ones)),
    new Or([
      new And([
        new Given(shadeOf(tens), YELLOW),
        // Sum of yellow digits = the displayed two-digit number.
        new Sum(-9, ...yellowTotal,
          ...boxShades.map(cell => [cell, -1]),
          [tens, -10], [ones, -1]),
      ]),
      new And([
        new Given(shadeOf(tens), BLUE),
        // A sudoku box totals 45, so blue total = 45 - yellow total.
        new Sum(36, ...yellowTotal,
          ...boxShades.map(cell => [cell, -1]),
          [tens, 10], ones),
      ]),
    ]),
  ]);
}

const frameTotals = frames.map(([tens, ones]) =>
  frameConstraint(tens, ones));

const xClues = [
  new X('R5C6', 'R5C7'),
  new X('R6C8', 'R6C9'),
];

const blackDots = [
  new BlackDot('R4C1', 'R5C1'),
  new BlackDot('R3C3', 'R3C4'),
  new BlackDot('R7C3', 'R8C3'),
  new BlackDot('R8C7', 'R8C8'),
];

return [
  shape,
  new YinYang(),
  yellowValue.toVar('yellow contribution'),
  ...yellowContributions,
  // The clue system is invariant under globally swapping the two colour
  // labels, so pin one cell to remove only that meaningless label symmetry.
  new Given(shadeOf('R1C1'), YELLOW),
  ...frameTotals,
  ...xClues,
  ...blackDots,
];
