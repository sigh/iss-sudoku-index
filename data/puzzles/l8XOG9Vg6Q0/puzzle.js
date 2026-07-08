// Title: Whispers in the maze
// Author: Ryan Adams
// Video: https://www.youtube.com/watch?v=l8XOG9Vg6Q0

// Partial encoding: ISS does not currently have a sound generic constraint for
// "there exists a single unknown orthogonal maze path from R5C5 to R3C1, not
// crossing drawn walls, whose adjacent cells are German Whispers."
const lessThan = Pair.fnToKey((a, b) => a < b, 9);

return [
  new Shape('9x9'),

  new WhiteDot('R4C6', 'R5C6'),
  new Pair(lessThan, 'arrow points to smaller digit', 'R1C1', 'R1C2'),
  new SameValues(2, 'R2C9', 'R9C8'),
];
