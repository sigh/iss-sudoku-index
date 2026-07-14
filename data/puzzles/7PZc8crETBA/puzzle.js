// Title: For the Summer
// Author: Calvinball
// Video: https://www.youtube.com/watch?v=7PZc8crETBA
// Source: https://sudokupad.app/i31o1sk1xs

// Ambiguous thermos: the rules say the bulb is one end or the other,
// undetermined, so each line is an Or of the two possible directions.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

function ambiguousThermo(...cells) {
  return new Or([
    new Thermo(...cells),
    new Thermo(...[...cells].reverse()),
  ]);
}

const thermoMainDiagonal = ambiguousThermo(
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6');
const thermoTopRight = ambiguousThermo('R3C5', 'R2C5', 'R1C5', 'R1C6');
const thermoMidLeft = ambiguousThermo('R4C3', 'R4C2', 'R5C2', 'R5C3');

// Little killer diagonal: drawn one row above R1C2, arrow pointing
// down-right. Runs parallel to (one column right of) the main-diagonal
// thermo above -- it shares no cells with it.
const littleKiller = LittleKiller.fromCells(
  17, graph.ray('R1C2', 1, 1), geometry);

return [
  new Shape('6x6'),

  thermoMainDiagonal,
  thermoTopRight,
  thermoMidLeft,
  littleKiller,
];
