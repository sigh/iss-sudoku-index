// Title: Harvest Lumber
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=yIM8zjcfC3M
// Source: https://tinyurl.com/rrz-harvestlumber

// Standard sudoku (rows/cols/boxes). Three givens.
//
// Each colour is drawn as one longer 3-cell "Stump" plus several 2-cell
// "Logs" stacked in the southeast corner; every Stump and every Log
// independently obeys its colour's rule (the woodpile artwork is not a
// shared chain between Logs of different colours that happen to touch tip
// to tip in the drawing).
//
// X-Sum outside clues read down the two labelled columns from the top.
// Grey lines are Thermo (increase from the bulb). The R9C6 log's bulb
// circle underlay sits on R9C6, the last drawn waypoint, so its cell order
// below is reversed from the raw path to put the bulb first.
// Pink lines are Renban (consecutive digits, any order).
// Blue lines are RegionSumLine (equal sum per box segment); ISS's
// RegionSumLine splits the given cell list by box automatically, so a
// 2-cell log that crosses a box boundary becomes two 1-cell segments that
// must be equal.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R4C4', 2),
  new Given('R5C6', 1),
  new Given('R6C5', 3),

  // Cages: unique digits summing to the given total, as drawn.
  new Cage(13, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(16, 'R1C7', 'R1C8', 'R1C9'),
  new Cage(16, 'R2C6', 'R2C7'),
  new Cage(11, 'R4C1', 'R4C2'),
  new Cage(9, 'R4C7', 'R4C8'),
  new Cage(11, 'R5C1', 'R6C1'),
  new Cage(11, 'R5C8', 'R6C8'),
  new Cage(17, 'R7C2', 'R7C3'),
  new Cage(17, 'R8C6', 'R8C7', 'R8C8'),

  // X-Sums: outside clue lanes printed above columns 2 and 6, read
  // downward, as drawn.
  XSum.fromCells(22, graph.ray('R1C2', 1, 0), geometry),
  XSum.fromCells(16, graph.ray('R1C6', 1, 0), geometry),

  // Grey Thermo Stump and Logs (bulb cell first).
  new Thermo('R3C3', 'R2C3', 'R1C3'),
  new Thermo('R6C8', 'R7C7'),
  new Thermo('R9C6', 'R8C7'),
  new Thermo('R7C6', 'R8C5'),

  // Pink Renban Stump and Logs.
  new Renban('R3C5', 'R4C5', 'R5C5'),
  new Renban('R8C9', 'R9C8'),
  new Renban('R8C8', 'R9C7'),
  new Renban('R7C8', 'R8C7'),
  new Renban('R8C5', 'R9C4'),

  // Blue Sum Line Stumps and Logs.
  new RegionSumLine('R2C8', 'R3C8', 'R4C8'),
  new RegionSumLine('R5C2', 'R6C2', 'R7C2'),
  new RegionSumLine('R6C7', 'R7C6'),
  new RegionSumLine('R7C7', 'R8C6'),
  new RegionSumLine('R6C9', 'R7C8'),
];
