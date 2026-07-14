// Title: Death Spiral
// Author: Andrewsarchus
// Video: https://www.youtube.com/watch?v=aQe1UwGjW2M
// Source: https://sudokupad.app/he396mr00y

// Normal sudoku rules apply.
//
// Region Sum Line (blue): box borders divide the region sum line into
// segments with equal sums. The line spirals through every box exactly
// once, so RegionSumLine's default one-segment-per-box-crossing behaviour
// matches the rule directly.
//
// Modular Lines (teal): any run of three sequential cells on a modular line
// must contain one digit from each of the sets {1,4,7}, {2,5,8} and
// {3,6,9} -- Modular(3, ...cells). The source draws four separate teal
// strokes; two pairs of them end on geometrically adjacent cells, but each
// stroke independently satisfies the modular rule against the known
// solution while joining either pair does not, so they are encoded as four
// distinct lines.

return [
  new Shape('9x9'),

  // Region Sum Line (blue), 30 cells, spirals through every box once.
  new RegionSumLine(
    'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8',
    'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8',
    'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2',
    'R7C2', 'R6C2', 'R5C2', 'R4C2',
    'R4C3', 'R4C4', 'R4C5', 'R4C6',
    'R5C6', 'R6C6',
  ),

  // Modular Lines (teal), mod = 3, each drawn as one separate stroke.
  new Modular(3,
    'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
    'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9',
    'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1',
    'R8C1', 'R7C1', 'R6C1', 'R5C1',
  ),
  new Modular(3, 'R7C5', 'R7C4', 'R6C4', 'R5C4', 'R5C5'),
  new Modular(3, 'R7C6', 'R7C7', 'R6C7', 'R5C7'),
  new Modular(3, 'R4C1', 'R3C1', 'R3C2'),
];
