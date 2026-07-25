// Title: Pipe Down
// Author: G
// Video: https://www.youtube.com/watch?v=X876s9yvSBk
// Source: https://sudokupad.app/shdh45cgrz

// Chaos construction sudoku: rows, columns and 9 deduced regions of 9
// orthogonally-connected cells each contain 1-9. Region layout is not given;
// ChaosConstruction deduces it, paired with a CC region-label overlay.
//
// Outside arrows: the first in-grid cell the arrow points to is a control
// cell, and the digit placed there (N) gives the length of the run of cells
// -- starting at that control cell and continuing in the arrow's direction --
// sharing one region, with a region border immediately after the Nth cell.
// ChaosArrow(controlCell, 0, ...arm) encodes this with offset 0 because the
// rule counts the control cell itself as the first of the N same-region
// cells. Arm cell lists are resolved from each off-grid arrow's position and
// pointed direction to its first in-grid cell and the rest of that line.
//
// Green lines: digits along a green line have a minimum difference of 5
// (Whisper(5)).

const cc = cellGraph('9x9').makeOverlay('CC');

const ARROW_ARMS = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'], // above C1, pointing down
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'], // above C5, pointing down
  ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'], // above C6, pointing down
  ['R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4'], // below C4, pointing up
  ['R9C8', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C8'], // below C8, pointing up
  ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'], // left of R3, pointing right
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'], // left of R4, pointing right
  ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'], // left of R8, pointing right
  ['R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'], // right of R1, pointing left
  ['R4C9', 'R4C8', 'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'], // right of R4, pointing left
  ['R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'], // right of R9, pointing left
];

const chaosArrows = ARROW_ARMS.map(arm => new ChaosArrow(arm[0], 0, ...cc.at(arm)));

const WHISPER_LINES = [
  ['R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'],
  ['R8C5', 'R8C6'],
  ['R7C5', 'R7C4'],
  ['R7C2', 'R7C1'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6'],
  ['R5C5', 'R5C6'],
  ['R3C6', 'R3C5'],
  ['R2C5', 'R2C6', 'R2C7'],
  ['R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'],
];

const whispers = WHISPER_LINES.map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...chaosArrows,
  ...whispers,
];
