// Title: Full Rank Sudoku
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=ROwjAFvZxZo
// Source: https://app.crackingthecryptic.com/sudoku/Qd8gJRm7Fh

// Normal sudoku rules apply. Every row and every column can be read as a
// 9-digit number in either direction, giving 36 numbers total (9 rows x 2
// directions + 9 columns x 2 directions). Each outside clue gives the rank
// (1 lowest .. 36 highest) of the number formed by reading that row/column
// starting from the digit nearest the clue, through to the far side.
//
// FullRank.fromCells(rank, cells, geometry) takes the cell order the number
// is read in, first cell most significant; a clue on the left/top reads the
// row/column forward, a clue on the right/bottom reads it backward -- built
// below with graph.ray() from the side nearest each drawn clue toward the
// far side. Ranks are the drawn outside-clue values.
// Ties are not addressed by the rules text, so the default FullRankTies
// ('only-unclued': the 9 clued numbers must be strictly ranked; unclued
// numbers may tie with each other) applies.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  FullRank.fromCells(33, graph.ray('R1C1', 1, 0), geometry), // top C1
  FullRank.fromCells(30, graph.ray('R1C2', 1, 0), geometry), // top C2
  FullRank.fromCells(26, graph.ray('R1C3', 1, 0), geometry), // top C3
  FullRank.fromCells(24, graph.ray('R1C4', 1, 0), geometry), // top C4
  FullRank.fromCells(13, graph.ray('R1C5', 1, 0), geometry), // top C5
  FullRank.fromCells(1, graph.ray('R4C1', 0, 1), geometry),  // left R4
  FullRank.fromCells(17, graph.ray('R5C1', 0, 1), geometry), // left R5
  FullRank.fromCells(36, graph.ray('R6C9', 0, -1), geometry), // right R6
  FullRank.fromCells(35, graph.ray('R9C6', -1, 0), geometry), // bottom C6
];
