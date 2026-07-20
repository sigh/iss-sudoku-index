// Title: Taste The Rainbow
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=VslFJ0OhlDc
// Source: https://sudokupad.app/7hi72ze6yz

// Normal Sudoku rules apply. The arrow arms have been detached from their
// circles, and some arms are split into detached pieces. Each reconstructed
// arm sums to its same-coloured circle. Colours with multiple complete arrows
// impose one sum per arrow.
const cyanArrows = [
  new Arrow('R3C3', 'R2C7', 'R3C6', 'R8C9', 'R9C9', 'R9C8'),
];

const blueArrows = [
  new Arrow('R2C6', 'R7C3', 'R7C2', 'R8C1'),
  new Arrow('R2C6', 'R2C3', 'R1C4'),
];

const pinkArrows = [
  new Arrow('R5C6', 'R5C9', 'R5C8', 'R3C2', 'R4C2', 'R4C1'),
];

const redArrows = [
  new Arrow('R3C8', 'R2C3', 'R1C2', 'R7C4', 'R7C5', 'R8C5'),
];

const greenArrows = [
  new Arrow('R6C5', 'R7C3', 'R6C4', 'R4C3', 'R5C4'),
];

const yellowArrows = [
  new Arrow('R6C8', 'R2C7', 'R3C7', 'R4C7'),
  new Arrow('R6C8', 'R2C3', 'R2C2'),
];

const orangeArrows = [
  new Arrow('R6C2', 'R1C5', 'R2C5'),
  new Arrow('R6C2', 'R8C8', 'R8C7'),
  new Arrow('R6C2', 'R6C7', 'R6C6', 'R5C5'),
  new Arrow('R6C2', 'R7C3', 'R8C4'),
];

return [
  new Shape('9x9'),
  ...cyanArrows,
  ...blueArrows,
  ...pinkArrows,
  ...redArrows,
  ...greenArrows,
  ...yellowArrows,
  ...orangeArrows,
];
