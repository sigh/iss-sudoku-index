// Title: April 22, 2023: Entropic Lines
// Author: clover!
// Video: https://www.youtube.com/watch?v=3xSu51Mcm80
// Source: https://tinyurl.com/2p94ur99

// Normal sudoku rules apply. Along each drawn line, every set of three
// adjoining digits holds one digit from {1,2,3}, one from {4,5,6}, and one
// from {7,8,9} -- Entropic(...cells) below.
//
// Six lines are drawn. Four are the sides of the border, each a plain 8-cell
// open entropic line (one corner cell belongs to each neighbouring side, so
// every side is 8 cells, not 9). The fifth is a 24-cell ring around box 5,
// drawn together with a separate short two-cell stroke R8C3-R8C2 in the same
// style that exactly reconnects the ring's last cell to its first (R8C3,
// R8C2 are adjacent) -- a 2-cell stroke can never contain a "set of three
// adjoining digits" on its own, so its only function is to close the ring
// into one 24-cell loop. Repeating the ring's first two cells at the end of
// its cell list covers the two wrap-around windows, per the closed-loop
// convention for sequential-window line classes.

const ring = [
  'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R2C3',
  'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R5C8',
  'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3',
];

return [
  new Shape('9x9'),

  // Givens (drawn digits).
  new Given('R2C1', 7), new Given('R2C2', 1),
  new Given('R3C3', 4), new Given('R3C4', 6), new Given('R3C5', 3),
  new Given('R3C6', 7), new Given('R3C7', 1),
  new Given('R4C3', 1), new Given('R4C7', 8),
  new Given('R5C3', 6), new Given('R5C7', 5),
  new Given('R6C3', 8), new Given('R6C7', 2),
  new Given('R7C3', 2), new Given('R7C4', 3), new Given('R7C5', 8),
  new Given('R7C6', 6), new Given('R7C7', 7),
  new Given('R8C8', 2), new Given('R8C9', 6),

  // Four border entropic lines, one per side.
  new Entropic(
    'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Entropic(
    'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Entropic(
    'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'),
  new Entropic(
    'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'),

  // Closed 24-cell ring around box 5 (see the closing-stroke note above).
  new Entropic(...ring, ring[0], ring[1]),
];
