// Title: Regions in the Fog
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=ez-IIaVTa3w
// Source: https://app.crackingthecryptic.com/sudoku/Rf868QGJdj

// Normal sudoku on the default 3x3 boxes (Shape('9x9') adds row/col/box
// all-different; the payload's `regions` array is nine contiguous 3x3
// blocks, so no jigsaw geometry or NoBoxes is needed).
//
// Region Sum Lines: RegionSumLine's semantics ("equal sum N within each box
// it passes through; a box revisited by the same line counts each visit
// separately") is exactly the stated rule, so each drawn line below is one
// RegionSumLine over its cells in drawn order. Fog of War is solving UI
// only (fog clears as digits are placed) and is not encoded -- no rule text
// refers to what is currently revealed.
//
// Cell paths are transcribed from the drawn line waypoints, interpolated
// into per-cell paths, in drawn order.
return [
  new Shape('9x9'),

  new RegionSumLine(
    'R1C5', 'R2C5', 'R3C5', 'R4C4', 'R5C4', 'R6C3', 'R6C4', 'R6C5',
    'R7C6', 'R6C6', 'R5C6', 'R4C7', 'R4C6', 'R4C5'),
  new RegionSumLine(
    'R3C6', 'R2C6', 'R2C7', 'R1C7', 'R2C8', 'R2C9', 'R3C8'),
  new RegionSumLine(
    'R3C7', 'R4C8', 'R5C9', 'R6C8', 'R7C9'),
  new RegionSumLine(
    'R6C7', 'R7C8', 'R7C7', 'R8C6', 'R8C5', 'R8C4', 'R7C3', 'R7C2',
    'R7C1', 'R6C2', 'R5C1'),
  new RegionSumLine('R9C2', 'R8C3', 'R9C4'),
  new RegionSumLine('R9C6', 'R8C7', 'R9C8'),
  new RegionSumLine('R4C3', 'R3C4'),
  new RegionSumLine('R4C1', 'R3C1', 'R3C2'),
];
