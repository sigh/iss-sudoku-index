// Title: The Knight & The Knave
// Author: Nordy & Math Pesto
// Video: https://www.youtube.com/watch?v=V8mduxeMMSQ
// Source: https://app.crackingthecryptic.com/sudoku/3m2dNR7FQF

// Normal sudoku rules apply (standard 3x3 boxes, no non-default regions).
// White dots: joined digits are consecutive (WhiteDot). Thermometers:
// digits strictly increase from the bulb (Thermo, cells listed bulb-first).
// Green lines: adjacent digits differ by 5 or more (Whisper(5)).
//
// Several green lines and thermometers share an endpoint cell where drawn
// strokes meet (e.g. two green lines and a thermo tail all touch R2C8); each
// drawn line is still its own payload entry and is encoded as an independent
// clue over only its own cells.

const whiteDots = [
  // Consecutive pairs; transcribed from the edge-centred white/black overlay
  // marks.
  new WhiteDot('R1C2', 'R2C2'),
  new WhiteDot('R1C7', 'R2C7'),
  new WhiteDot('R2C5', 'R2C6'),
  new WhiteDot('R5C4', 'R5C5'),
  new WhiteDot('R5C3', 'R6C3'),
  new WhiteDot('R5C1', 'R5C2'),
  new WhiteDot('R9C1', 'R9C2'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R8C8', 'R9C8'),
  new WhiteDot('R7C8', 'R8C8'),
];

const thermos = [
  // Bulb-first cell lists; transcribed from the grey lines and their grey
  // circle bulb markers (underlay/overlay). Straight multi-cell spans are
  // expanded through the cell the drawn stroke passes through.
  ['R5C8', 'R4C9', 'R3C8', 'R2C8'],
  ['R6C1', 'R7C2', 'R8C2'],
  ['R9C4', 'R8C4', 'R7C4'],
  ['R1C6', 'R2C6', 'R3C6'],
  ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6'],
  ['R6C9', 'R6C8', 'R6C7', 'R6C6', 'R6C5', 'R6C4'],
];

const greenLines = [
  // Cell lists in drawn stroke order; transcribed from the green lines.
  // Adjacent-in-list cells get the difference-5+ rule (Whisper applies it
  // between consecutive listed cells, not by grid adjacency), matching the
  // stroke as drawn even where a segment steps diagonally (e.g. R1C9-R2C8).
  ['R1C8', 'R2C8', 'R2C9'],
  ['R1C9', 'R2C8'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R5C7', 'R5C6'],
  // Closed loop: first waypoint repeats at the end so the closing edge
  // (R5C2-R4C2) also gets the rule, matching the drawn closed stroke.
  ['R4C2', 'R5C1', 'R6C2', 'R5C2', 'R4C2'],
  ['R1C1', 'R2C1'],
  ['R8C1', 'R8C2', 'R9C2'],
  ['R9C1', 'R8C2'],
  ['R5C9', 'R6C9'],
  ['R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...whiteDots,
  ...thermos.map(cells => new Thermo(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
