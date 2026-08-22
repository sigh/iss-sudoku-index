// Title: Trio of Trios A
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=8Dt_fnJaQJs
// Source: https://app.crackingthecryptic.com/sudoku/rNFffthDhj

// 6x6 grid, standard boxes (six 2x3 blocks matching the payload's `regions`).
// Arrow bulb (first cell) equals the sum of the remaining arm cells.
// Omitted: "if two cells in any two grids have the same letter written in
// them, those cells must contain the same digit" -- this payload is one of
// three separate, cross-linked grids ("Grid A" of "A Trio of Trios"); Grids
// B and C are not part of this puzzle_id, so the cross-grid link cannot be
// encoded here.

return [
  new Shape('6x6'),

  new Arrow('R3C2', 'R2C3', 'R1C4'),
  new Arrow('R3C3', 'R2C4', 'R1C5', 'R1C6'),
  new Arrow('R4C4', 'R5C3', 'R6C2', 'R6C1'),
  new Arrow('R6C3', 'R5C4', 'R4C5'),
];
