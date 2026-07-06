// Just Sum Long Lines by HalfBakedLunatic (aka David Workman)
// https://sudokupad.app/sxsm_HalfBakedLunaticakaD_13dbc99249d615b64379716c3c3d5f6d
// https://www.youtube.com/watch?v=rSMMWRaKq8M
//
// Rules:
// Normal Sudoku rules apply.
// Box borders divide the blue Region Sum Lines into segments with the
// same sum.

const line1 = [
  'R7C3', 'R7C2', 'R6C1', 'R5C2', 'R4C1', 'R3C1', 'R2C2', 'R1C1', 'R1C2',
  'R1C3', 'R1C4', 'R2C5', 'R1C6', 'R1C7', 'R1C8', 'R2C9', 'R3C9', 'R4C9',
  'R5C8', 'R6C9', 'R7C9', 'R7C8', 'R8C8', 'R9C8', 'R9C7', 'R9C6', 'R8C5',
  'R7C4', 'R8C3', 'R9C2',
];

const line2 = [
  'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R7C5',
  'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R5C3', 'R5C4', 'R4C4', 'R3C3', 'R2C3',
  'R2C4', 'R3C5', 'R2C6', 'R2C7', 'R2C8',
];

return [
  new Shape('9x9'),
  new Given('R4C5', 3),
  new Given('R8C1', 2),
  new RegionSumLine(...line1),
  new RegionSumLine(...line2),
];
