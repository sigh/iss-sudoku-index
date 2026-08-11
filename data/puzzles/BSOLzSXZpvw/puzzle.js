// Title: Beasthunter Saif
// Author: PulverizingPancake
// Video: https://www.youtube.com/watch?v=BSOLzSXZpvw
// Source: https://tinyurl.com/4k7v62dh

// Standard sudoku rules apply. Killer cages: digits sum to the small clue in
// the cage's top-left cell; "Killer" cages carry the standard genre
// convention that a cage's digits do not repeat, hence Cage (sum + distinct)
// rather than Sum (sum only). German Whisper lines (green): adjacent digits
// along a line differ by at least 5 -- Whisper's default difference, passed
// explicitly here.

// Cage cell lists transcribed from the drawn cage geometry, in the source
// payload's cage order.
const cages = [
  new Cage(9, 'R2C4', 'R2C5', 'R3C4'),
  new Cage(9, 'R4C4', 'R5C4', 'R5C5'),
  new Cage(9, 'R5C1', 'R5C2'),
  new Cage(20, 'R4C7', 'R4C8', 'R4C9'),
  new Cage(9, 'R7C5', 'R8C5', 'R9C5'),
  new Cage(18, 'R8C7', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(15, 'R2C1', 'R2C2', 'R2C3'),
  new Cage(9, 'R2C7', 'R2C8'),
  new Cage(13, 'R8C1', 'R8C2', 'R8C3'),
];

// Whisper line cell paths transcribed from the drawn green line geometry
// (the source payload also carries an identical generic line layer per
// stroke -- a duplicate render echo of the same path, not a second clue).
// Cells are listed in drawn stroke order; each path zigzags across cell
// corners rather than following edge adjacency, so the difference
// constraint binds consecutive cells in this list, not orthogonal
// neighbours.
const whispers = [
  new Whisper(5, 'R2C6', 'R3C7', 'R4C6', 'R5C7', 'R6C6', 'R7C7', 'R8C6'),
  new Whisper(5, 'R8C1', 'R9C2', 'R8C3'),
  new Whisper(5, 'R3C1', 'R2C2', 'R3C3'),
  new Whisper(5, 'R2C4', 'R2C3'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
