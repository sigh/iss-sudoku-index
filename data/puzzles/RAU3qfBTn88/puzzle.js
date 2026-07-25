// Title: Big Bad Wolf
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=RAU3qfBTn88
// Source: https://sudokupad.app/8cs9gx5dfg

// Chaos Construction: divide the grid into nine 9-cell orthogonally
// connected regions; each row, column, and region holds 1-9 once. No
// regions are drawn -- the solver deduces the region borders.
//
// Omitted: the drawn line's segment/position rule ("region boundaries
// divide the line into segments; the digit in the Nth cell of a segment
// indicates the position of digit N on that segment, positions counted
// from an end of the segment that must be determined, direction chosen
// per segment") is not encoded. The segment breaks are wherever the line
// crosses a region boundary, and the regions themselves are solver-
// discovered, so this needs distance/order/segment length measured along
// an unknown graph -- no ISS primitive expresses that.

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  new Given('R3C5', 2),
  new Given('R9C8', 8),
];
