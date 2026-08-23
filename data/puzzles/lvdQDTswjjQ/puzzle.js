// Title: 'Twixt
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=lvdQDTswjjQ
// Source: https://app.crackingthecryptic.com/sudoku/4JmGBRNDBN

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Arrow: digits along the line sum to the digit in the circled cell
// (circle cell listed first). Between: cells strictly between the two
// listed endpoint circles must hold values strictly between the two
// circled digits (Between's cells array is endpoint, line..., endpoint).

// Arrows: [circle, ...line cells], from the drawn white-filled circles
// and their attached line paths.
const arrows = [
  ['R3C2', 'R2C2', 'R1C2'],
  ['R3C8', 'R2C8', 'R1C8', 'R1C7'],
  ['R8C6', 'R8C5', 'R9C4'],
  ['R7C2', 'R8C2', 'R9C2'],
  ['R6C1', 'R5C2', 'R4C3'],
  ['R7C8', 'R8C8', 'R9C8', 'R9C7'],
];

// Between lines: endpoints are the solid grey-filled circles; drawn purple
// lines join them.
const betweenLines = [
  ['R3C1', 'R4C2', 'R5C2', 'R6C2', 'R7C1'],
  ['R4C4', 'R3C4', 'R3C5', 'R3C6', 'R4C7'],
  ['R3C9', 'R4C8', 'R5C8', 'R6C8', 'R7C9'],
  ['R8C3', 'R8C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R7C7', 'R6C6', 'R5C5', 'R4C4'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...betweenLines.map(cells => new Between(...cells)),
];
