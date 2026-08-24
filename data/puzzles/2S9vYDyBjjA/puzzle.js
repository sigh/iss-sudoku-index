// Title: That's No Moon
// Author: G
// Video: https://www.youtube.com/watch?v=2S9vYDyBjjA
// Source: https://app.crackingthecryptic.com/sudoku/NJbPwMVNwZ
//
// Apply normal sudoku rules. Along thermometers, digits increase from the
// bulb. Along the grey german whisper lines, digits must have a difference
// of at least 5. The digit in the grey circle must be odd. Digits joined by
// a white dot must be consecutive. Not all dots are given (so absence of a
// dot is not a constraint).
//
// Two line styles are drawn. The thick light-grey 3-cell sprays each meet at
// a large filled circle -- the classic thermometer bulb shape -- so they are
// the thermometers, one Thermo per drawn arm (bulb-first). The thinner
// darker-grey lines (a 20-cell loop plus a separate 6-cell line) have no
// bulb and no length limit, so they are the german whisper lines; each
// drawn stroke is encoded as its own Whisper, which together cover every
// adjacent pair the strokes draw (the loop's closing edge is covered by the
// short second stroke that connects the long stroke's two ends). "The grey
// circle" (definite, singular) is the one plain, unattached, smaller grey
// circle -- the other three grey circles are thermometer bulbs, not this
// clue.

return [
  new Shape('9x9'),

  // "The grey circle" (odd digit): the one plain circle not doubling as a
  // thermometer bulb. No Odd/Even class exists, so encode as a multi-value
  // Given.
  new Given('R3C6', 1, 3, 5, 7, 9),

  // Thermometers: three 4-armed sprays, bulb-first per drawn line order.
  // Bulb at R7C7:
  new Thermo('R7C7', 'R6C6', 'R5C7'),
  new Thermo('R7C7', 'R6C6', 'R7C5'),
  new Thermo('R7C7', 'R8C8', 'R9C7'),
  new Thermo('R7C7', 'R8C8', 'R7C9'),
  // Bulb at R3C3:
  new Thermo('R3C3', 'R3C2', 'R2C2'),
  new Thermo('R3C3', 'R3C2', 'R4C2'),
  new Thermo('R3C3', 'R3C4', 'R2C4'),
  new Thermo('R3C3', 'R3C4', 'R4C4'),
  // Bulb at R7C3:
  new Thermo('R7C3', 'R7C2', 'R8C2'),
  new Thermo('R7C3', 'R7C2', 'R6C2'),
  new Thermo('R7C3', 'R7C4', 'R8C4'),
  new Thermo('R7C3', 'R7C4', 'R6C4'),

  // German whisper lines (diff >= 5). The 20-cell loop is drawn as two
  // strokes -- a long open run and a 2-cell closer -- encoded per drawn
  // segment; together they cover every adjacent pair around the loop,
  // including the wrap-around edge. The 6-cell line is a separate stroke.
  new Whisper(
    'R5C1', 'R4C1', 'R3C1', 'R2C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6',
    'R2C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C7', 'R8C6', 'R8C5',
    'R8C4', 'R8C3', 'R7C2', 'R6C1'),
  new Whisper('R6C1', 'R5C1'),
  new Whisper('R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'),

  // White dots (consecutive). Only these two are drawn; "not all dots are
  // given" means unmarked adjacent pairs carry no constraint.
  new WhiteDot('R1C1', 'R1C2'),
  new WhiteDot('R4C9', 'R5C9'),
];
