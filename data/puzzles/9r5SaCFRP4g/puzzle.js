// Title: Deck The Halls
// Author: Blobz
// Video: https://www.youtube.com/watch?v=9r5SaCFRP4g
// Source: https://sudokupad.app/blobz/deck-the-halls

// Normal sudoku rules apply.
// Holly outline (green): adjacent digits along it differ by at least 5.
// Bell outline (yellow, drawn closed): box borders divide it into segments that
// sum to the same value.
// Baubles (pink): the four digits in each form a consecutive run, any order.
// White circles: each circle's digit must appear at least once among the
// surrounding 2x2 cells.
// A ninth circle (gold-ringed, at the base of the bell, carrying three tiny
// digit glyphs rather than one clue digit) and the small ringed circle at the
// top of the bell (R3C7) are bell decoration, not a white-circle clue.

return [
  new Shape('9x9'),

  // Holly outline: cell path traced from the drawn line's waypoints.
  new Whisper(5,
    'R6C2', 'R6C1', 'R5C2', 'R4C1', 'R4C2', 'R3C2', 'R4C3', 'R3C4', 'R4C4',
    'R4C5', 'R5C4', 'R5C3', 'R6C4', 'R6C3'),

  // Bell outline: cell path traced from the drawn line's waypoints, closing
  // waypoint back to the start cell dropped -- RegionSumLine splits an ordered
  // cell list into per-box segments itself, so the drawn loop closure adds no
  // extra segment (R3C7 and R4C6 are already in different boxes).
  new RegionSumLine(
    'R4C6', 'R5C6', 'R6C6', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R6C8',
    'R5C8', 'R4C8', 'R3C7'),

  // Baubles: corner positions from the drawn pink 2x2-sized circles.
  // Renban's pairwise check applies to the whole cell set regardless of
  // geometric adjacency, matching "in any order".
  new Renban('R8C4', 'R8C5', 'R9C4', 'R9C5'),
  new Renban('R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Renban('R7C2', 'R7C3', 'R8C2', 'R8C3'),

  // White circles: positions and digits from the drawn white circle + adjacent
  // digit text pairs. Quad(topLeftCell, value) requires the value appear in
  // the surrounding 2x2.
  new Quad('R2C1', 8),
  new Quad('R1C2', 3),
  new Quad('R2C3', 9),
  new Quad('R1C4', 2),
  new Quad('R2C5', 6),
  new Quad('R1C6', 5),
  new Quad('R2C7', 8),
  new Quad('R3C8', 2),
];
