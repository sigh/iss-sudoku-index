// Title: Gravity
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=-kym5UAVA7I
// Source: https://app.crackingthecryptic.com/sudoku/9GB9bhd2hF

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Along thermometers, digits must increase from the bulb end. Seven
// thermometers are drawn (five grey, two purple); the colour split is not
// referenced by the rules text, so it is decoration, not a distinct rule.
// One additional payload line entry has a colour and thickness but no
// waypoints, so it draws nothing and is omitted. Cell paths transcribed
// from the drawn waypoints, bulb cell listed first per line.

return [
  new Shape('9x9'),
  new Thermo('R1C4', 'R2C3', 'R2C2'),
  new Thermo('R1C5', 'R1C6', 'R2C7', 'R3C7', 'R3C8', 'R4C9', 'R5C9'),
  new Thermo('R3C4', 'R4C5', 'R5C6', 'R5C7'),
  new Thermo('R4C3', 'R5C4', 'R6C5', 'R7C5'),
  new Thermo('R6C1', 'R7C2', 'R7C3', 'R8C3', 'R9C4'),
  new Thermo('R4C8', 'R3C9', 'R2C9', 'R1C9'),
  new Thermo('R8C5', 'R8C4', 'R9C3', 'R9C2', 'R9C1'),
];
