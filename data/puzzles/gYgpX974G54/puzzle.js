// Title: Boxed In
// Author: Rasdasd
// Video: https://www.youtube.com/watch?v=gYgpX974G54
// Source: https://app.crackingthecryptic.com/sudoku/h9TqJP3nbj

// Normal sudoku rules apply (default row/column/box all-different).
// Along thermometers (grey), digits must increase from the bulb end.
// A purple line contains a set of consecutive non-repeating digits, in any
// order. Several thermometers and purple lines are drawn so their endpoints
// meet and trace rectangular loops (the "Boxed In" theme); each segment
// below is still its own independently drawn line/clue.

return [
  new Shape('9x9'),
  new Given('R5C3', 8),

  // Thermometers: cell order is bulb first, per source waypoint order
  // (bulb underlay circle coincides with each line's first waypoint).
  new Thermo('R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new Thermo('R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'),
  new Thermo('R6C4', 'R5C4', 'R4C4'),
  new Thermo('R6C6', 'R5C6', 'R4C6'),
  new Thermo('R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Thermo('R3C9', 'R4C9', 'R5C9'),
  new Thermo('R1C7', 'R1C6', 'R1C5', 'R1C4'),
  new Thermo('R9C7', 'R9C6', 'R9C5'),
  new Thermo('R8C6', 'R8C5', 'R9C4'),

  // Purple lines: consecutive non-repeating digit sets, order-free.
  new Renban('R7C1', 'R8C2', 'R9C1'),
  new Renban('R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Renban('R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7'),
  new Renban('R4C4', 'R4C5', 'R4C6'),
  new Renban('R6C4', 'R6C5', 'R6C6'),
  new Renban('R8C7', 'R9C8', 'R8C9'),
  new Renban('R1C1', 'R1C2', 'R2C3'),
];
