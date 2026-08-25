// Title: Disjoint Groups Little Killer
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=7W0t8NxuDRE
// Source: https://app.crackingthecryptic.com/sudoku/tMD6fgrp68
//
// Normal sudoku rules. Disjoint groups: a digit cannot repeat in the same
// position across different 3x3 boxes. Ten little killer arrows give the sum
// of digits along their diagonal outside the grid; digits may repeat along a
// diagonal. Each diagonal's start cell and direction is transcribed from the
// puzzle's drawn arrow waypoints.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  new DisjointSets(),

  LittleKiller.fromCells(11, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R5C1', -1, 1), geometry),
  LittleKiller.fromCells(41, graph.ray('R7C1', -1, 1), geometry),
  LittleKiller.fromCells(40, graph.ray('R9C1', -1, 1), geometry),
  LittleKiller.fromCells(46, graph.ray('R9C3', -1, 1), geometry),
  LittleKiller.fromCells(28, graph.ray('R9C5', -1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(34, graph.ray('R9C9', -1, -1), geometry),
  LittleKiller.fromCells(53, graph.ray('R8C9', -1, -1), geometry),
  LittleKiller.fromCells(30, graph.ray('R9C8', -1, -1), geometry),
];
