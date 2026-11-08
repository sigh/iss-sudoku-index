// Title: Uphill Struggle
// Author: trufflebear
// Video: https://www.youtube.com/watch?v=35_c6LQWeLI
// Source: https://sudokupad.app/ir256dson1

// Normal Sudoku, Yin-Yang shading, black Kropki dots, red sum arrows,
// and increasing same-shade line segments of length 3, 4 or 5.
const shape = new Shape('9x9');
const shade = cellGraph('9x9').makeOverlay('YY');
// Grey line, ordered from the bulb at R1C1.
const line = ["R1C1", "R2C1", "R3C1", "R2C2", "R3C2", "R3C3", "R2C3", "R1C2", "R1C3", "R1C4", "R2C4", "R3C4", "R2C5", "R2C6", "R1C5", "R1C6", "R1C7", "R1C8", "R2C9", "R3C9", "R3C8", "R2C8", "R2C7", "R3C7", "R4C8", "R5C8", "R4C9", "R5C9", "R6C8", "R5C7", "R4C6", "R4C5", "R4C4", "R4C3", "R5C2", "R5C1", "R6C2", "R7C1", "R8C1", "R8C2", "R7C2", "R7C3", "R7C4", "R6C4", "R6C5", "R5C6", "R6C7", "R7C6", "R7C7", "R7C8", "R8C8", "R9C8", "R8C7", "R9C7", "R8C6", "R8C5", "R8C4", "R8C3", "R9C3", "R9C2"];
// Drawn black dots.
const dots = [['R1C3','R2C3'], ['R2C2','R2C3'], ['R5C3','R6C3'], ['R8C3','R9C3'], ['R6C7','R6C8']];
// Red circles followed by the cells traversed by their shafts.
const arrows = [['R3C1','R4C1','R3C2'], ['R5C8','R4C7','R3C8','R2C7','R1C6'], ['R8C7','R7C8','R7C7','R7C6']];
// The alternating input is shade,digit for each line cell. State records
// the previous shade/digit and current run length; a shade change closes
// a length-3..5 run and resets the increasing-digit comparison.
const spec = NFA.encodeSpec({
  startState: {phase:'shade', shade:0, prev:0, len:0},
  transition: (s,v) => {
    if(s.phase === 'shade') {
      if(v !== 1 && v !== 2) return undefined;
      const same = v === s.shade;
      if(!same && s.len !== 0 && s.len < 3) return undefined;
      if(same && s.len === 5) return undefined;
      return {phase:'digit', shade:v, prev:same?s.prev:0, len:same?s.len+1:1};
    }
    if(v <= s.prev) return undefined;
    return {phase:'shade', shade:s.shade, prev:v, len:s.len};
  },
  accept: s => s.phase === 'shade' && s.len >= 3,
},shape);
return [shape, new YinYang(),
  // The two unnamed colours can be exchanged; choose one representative.
  new Given(shade.at('R1C1'),1),
  ...dots.map(c => new BlackDot(...c)),
  ...arrows.map(c => new Arrow(...c)),
  new NFA(spec,'MultiThermo',line.flatMap(c => [shade.at(c),c])),
];
