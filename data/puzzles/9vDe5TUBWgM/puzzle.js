// Title: To The Skies
// Author: Aaronymous and Piatato
// Video: https://www.youtube.com/watch?v=9vDe5TUBWgM
// Source: https://app.crackingthecryptic.com/sudoku/JgtqHpb2F6

// Normal sudoku rules apply (standard rows/cols/boxes, from the default
// 9x9 Shape). Anti-knight: no two cells a knight's move apart share a digit.
// Thermometer: digits increase from the bulb end -- Thermo's cell order is
// bulb-first, matching the drawn filled-circle underlay at R3C1 (the line's
// first waypoint), so no reordering is needed.
// Green lines: adjacent digits differ by at least 5 -- Whisper's default
// difference is 5, matching the rules text, so no explicit difference
// argument is passed. Two `lines[]` entries (index 1 and 10) have styling
// but no wayPoints and render nothing; they are omitted.

// Thermometer: diagonal R3C1(bulb)-R2C2-R1C3. Waypoints [2.5,0.5]->[0.5,2.5]
// span two cells diagonally; the middle cell R2C2 is the interpolated
// midpoint.
const thermo = new Thermo('R3C1', 'R2C2', 'R1C3');

// Eight green whisper lines (color #A3E048), transcribed from the drawn
// line geometry (two additional entries with the same styling carry no
// waypoints and render nothing, so they are omitted).
const whisper1 = new Whisper('R6C4', 'R5C3', 'R4C4', 'R3C5', 'R4C6');
const whisper2 = new Whisper('R2C6', 'R3C6', 'R3C7');
const whisper3 = new Whisper('R3C8', 'R4C9');
const whisper4 = new Whisper('R5C7', 'R6C8', 'R5C9');
const whisper5 = new Whisper('R7C6', 'R6C6', 'R6C7');
const whisper6 = new Whisper('R6C2', 'R6C3', 'R7C3');
const whisper7 = new Whisper('R7C5', 'R8C6', 'R9C5');
const whisper8 = new Whisper('R8C3', 'R9C4');

return [
  new Shape('9x9'),
  new Given('R3C3', 3),
  new AntiKnight(),
  thermo,
  whisper1,
  whisper2,
  whisper3,
  whisper4,
  whisper5,
  whisper6,
  whisper7,
  whisper8,
];
