// Title: Pill Arrow Sudoku
// Author: Stimim
// Video: https://www.youtube.com/watch?v=Fgq_H9GkCNM
// Source: https://app.crackingthecryptic.com/sudoku/4ndLTTHRpf

// Normal sudoku rules apply. Digits along an arrow sum to the number in the
// attached circle or pill. Eight arrows end in a two-cell pill holding a
// two-digit number (its two cells read left-to-right or top-to-bottom, per
// the rules text); the other three end in an ordinary single-cell circle
// holding a one-digit number. Pill cells and bulb cells come from the
// payload's `overlays` marks, matched to each arrow by the shared endpoint
// adjacent to its arm; arm cells come from the payload's `arrows` array.

// Pill arrows: PillArrow(2, tensCell, onesCell, ...armCells). The two pill
// cells are always given in reading order (left-to-right for a horizontal
// pill, top-to-bottom for a vertical one), independent of which side the arm
// leaves from.
const pillArrows = [
  new PillArrow(2, 'R1C7', 'R1C8', 'R1C6', 'R1C5', 'R1C4'),
  new PillArrow(2, 'R1C2', 'R1C3', 'R1C1', 'R2C1', 'R3C1'),
  new PillArrow(2, 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'),
  new PillArrow(2, 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'),
  new PillArrow(2, 'R8C6', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new PillArrow(2, 'R4C9', 'R5C9', 'R3C9', 'R2C9', 'R1C9'),
  new PillArrow(2, 'R2C6', 'R2C7', 'R2C5', 'R2C4', 'R2C3'),
  new PillArrow(2, 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2'),
];

// Circle arrows: Arrow(bulbCell, ...armCells).
const circleArrows = [
  new Arrow('R3C3', 'R4C4', 'R5C5'),
  new Arrow('R7C3', 'R6C4', 'R5C5', 'R4C6'),
  new Arrow('R3C8', 'R4C7'),
];

return [
  new Shape('9x9'),
  ...pillArrows,
  ...circleArrows,
];
