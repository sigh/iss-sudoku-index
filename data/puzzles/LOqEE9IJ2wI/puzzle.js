// Title: Whispering Diabolo
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=LOqEE9IJ2wI
// Source: https://sudokupad.app/auifpnq2st

// Normal sudoku rules apply (standard 3x3 boxes). Adjacent digits on an
// orange line must differ in value by at least 4 -- Whisper(4). All six
// drawn lines are the same orange colour, so all six get the rule. Four
// lines are short open arms; two are closed loops that both pass through
// the centre cell R5C5, meeting there to form the drawn bowtie ("diabolo")
// figure. Each closed loop's cell list below repeats its first cell at the
// end to cover the wrap-around edge.
return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C9', 4),
  new Given('R5C5', 9),
  new Given('R9C1', 2),
  new Given('R9C9', 6),

  // Four open whisper arms around the centre (none of them touch R5C5).
  new Whisper(4, 'R6C5', 'R7C5', 'R8C5'),
  new Whisper(4, 'R5C2', 'R5C3', 'R5C4'),
  new Whisper(4, 'R2C5', 'R3C5', 'R4C5'),
  new Whisper(4, 'R5C6', 'R5C7', 'R5C8'),

  // Lower diabolo lobe: closed loop through the centre.
  new Whisper(4,
    'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1',
    'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),

  // Upper diabolo lobe: closed loop through the centre.
  new Whisper(4,
    'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5',
    'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5'),
];
