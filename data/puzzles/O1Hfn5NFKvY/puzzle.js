// Title: The Graveyard Of Totality
// Author: fjam
// Video: https://www.youtube.com/watch?v=O1Hfn5NFKvY
// Source: https://sudokupad.app/xxltzfdah0

// Normal sudoku applies. Grave digits are distinct and sum to two or all three
// printed date components. The orthogonal green-to-red path avoids each grave's
// minimum and maximum. Directed edges and position counters close one route.

const boardShape = new Shape('9x9', '1-16');
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Drawn graves and their printed DD/MM/YY labels.
const graves = [
  {
    "cells": [
      "R1C6",
      "R1C7"
    ],
    "date": [
      5,
      1,
      12
    ]
  },
  {
    "cells": [
      "R1C4",
      "R1C5",
      "R2C4",
      "R2C5"
    ],
    "date": [
      18,
      4,
      6
    ]
  },
  {
    "cells": [
      "R2C6",
      "R3C4",
      "R3C5",
      "R3C6"
    ],
    "date": [
      14,
      12,
      4
    ]
  },
  {
    "cells": [
      "R1C8",
      "R1C9",
      "R2C9"
    ],
    "date": [
      4,
      6,
      12
    ]
  },
  {
    "cells": [
      "R2C7",
      "R2C8",
      "R3C7",
      "R3C8",
      "R3C9"
    ],
    "date": [
      14,
      10,
      6
    ]
  },
  {
    "cells": [
      "R1C2",
      "R1C3",
      "R2C2"
    ],
    "date": [
      1,
      3,
      7
    ]
  },
  {
    "cells": [
      "R2C1",
      "R3C1",
      "R4C1"
    ],
    "date": [
      17,
      2,
      7
    ]
  },
  {
    "cells": [
      "R2C3",
      "R3C2",
      "R3C3",
      "R4C2"
    ],
    "date": [
      5,
      7,
      21
    ]
  },
  {
    "cells": [
      "R5C1",
      "R6C1",
      "R7C1"
    ],
    "date": [
      6,
      12,
      4
    ]
  },
  {
    "cells": [
      "R5C2",
      "R5C3",
      "R6C2",
      "R6C3"
    ],
    "date": [
      11,
      2,
      10
    ]
  },
  {
    "cells": [
      "R4C3",
      "R4C4",
      "R5C4",
      "R5C5"
    ],
    "date": [
      3,
      9,
      7
    ]
  },
  {
    "cells": [
      "R4C5",
      "R4C6",
      "R4C7",
      "R5C6",
      "R6C6"
    ],
    "date": [
      21,
      4,
      14
    ]
  },
  {
    "cells": [
      "R4C8",
      "R4C9",
      "R5C9",
      "R6C9"
    ],
    "date": [
      3,
      12,
      15
    ]
  },
  {
    "cells": [
      "R5C7",
      "R5C8",
      "R6C7",
      "R6C8"
    ],
    "date": [
      5,
      3,
      14
    ]
  },
  {
    "cells": [
      "R7C9",
      "R8C8",
      "R8C9",
      "R9C8"
    ],
    "date": [
      13,
      11,
      6
    ]
  },
  {
    "cells": [
      "R7C7",
      "R7C8",
      "R8C7"
    ],
    "date": [
      19,
      5,
      3
    ]
  },
  {
    "cells": [
      "R8C5",
      "R8C6",
      "R9C6",
      "R9C7"
    ],
    "date": [
      9,
      8,
      8
    ]
  },
  {
    "cells": [
      "R6C4",
      "R6C5",
      "R7C5",
      "R7C6"
    ],
    "date": [
      14,
      8,
      7
    ]
  },
  {
    "cells": [
      "R7C4",
      "R8C4",
      "R9C2",
      "R9C3",
      "R9C4",
      "R9C5"
    ],
    "date": [
      13,
      9,
      14
    ]
  },
  {
    "cells": [
      "R7C2",
      "R7C3",
      "R8C1",
      "R8C2",
      "R8C3",
      "R9C1"
    ],
    "date": [
      16,
      6,
      15
    ]
  }
];

const graveConstraints = graves.flatMap(({ cells, date }) => [
  new AllDifferent(...cells),
  new Or([...new Set([date[0]+date[1], date[0]+date[2], date[1]+date[2], date[0]+date[1]+date[2]])].map(total => new Sum(total, ...cells))),
]);

const START = 'R1C1', END = 'R9C9';

// Shape codes name unused cells, straight segments and turns.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const ON_CODES = [HORIZ, VERT, UL, UR, DL, DR];

const shape = graph.makeOverlay('VS');
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];

const shapeDomains = gridCells
  .filter(cell => cell !== START && cell !== END)
  .map(cell => {
    const { row, col } = parseCellId(cell);
    const allowed = ALL_SHAPES.filter(s =>
      !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
      !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
    return new Given(shape.at(cell), ...allowed);
  });
const cornerPlaceholders = [START, END].map(cell => new Given(shape.at(cell), OFF));

const START_DOWN = 1, START_RIGHT = 2, END_UP = 3, END_LEFT = 4;
const ends = graph.makeOverlay('VE', [START, END]);
const endDomains = [
  new Given(ends.at(START), START_DOWN, START_RIGHT),
  new Given(ends.at(END), END_UP, END_LEFT),
];

// Each Pair requires both cells to agree whether their common edge is used.
const edgeAgreeKey = (toB, toA) => Pair.fnToKey((a, b) => toB(a) === toA(b), boardShape);
const rightKey = edgeAgreeKey(usesRight, usesLeft), downKey = edgeAgreeKey(usesDown, usesUp);

function directionalEdgeFamily(key, label, dRow, dCol) {
  const anchors = gridCells.filter(cell => {
    if (cell === START || cell === END) return false;
    const neighbour = graph.step(cell, dRow, dCol);
    return neighbour && neighbour !== START && neighbour !== END;
  });

  const first = gridCells[0];
  const template = new Pair(key, label, shape.at(first), shape.at(graph.step(first, dRow, dCol)));
  return shape.makeReplicate([template], shape.at(anchors));
}
const generalEdges = [
  directionalEdgeFamily(rightKey, 'edge-h', 0, 1),
  directionalEdgeFamily(downKey, 'edge-v', 1, 0),
];

const cornerEdges = [
  new Pair(edgeAgreeKey(v => v === START_DOWN, usesUp), 'edge-start-v', ends.at(START), shape.at('R2C1')),
  new Pair(edgeAgreeKey(v => v === START_RIGHT, usesLeft), 'edge-start-h', ends.at(START), shape.at('R1C2')),
  new Pair(edgeAgreeKey(v => v === END_UP, usesDown), 'edge-end-v', ends.at(END), shape.at('R8C9')),
  new Pair(edgeAgreeKey(v => v === END_LEFT, usesRight), 'edge-end-h', ends.at(END), shape.at('R9C8')),
];

// Outgoing direction has one choice per used side; the end has no outgoing edge.
const outgoing = graph.makeOverlay('VD');
const modNine = graph.makeOverlay('VA'), modTen = graph.makeOverlay('VB');
const dirs = [[-1,0],[0,1],[1,0],[0,-1]];
const uses = [usesUp,usesRight,usesDown,usesLeft];
const outCodes = [1,2,3,4,5]; // off, north, east, south, west
const key = fn => Pair.fnToKey(fn, boardShape);
const outgoingRules = gridCells.map(c => c === END
  ? new Given(outgoing.at(c),1)
  : c === START
    ? new Pair(key((e,d) => d === (e === START_DOWN ? 4 : 3)), 'start direction', ends.at(c),outgoing.at(c))
    : new Pair(key((s,d) => s===OFF ? d===1 : d>=2 && d<=5 && uses[d-2](s)), 'outgoing side',shape.at(c),outgoing.at(c)));
const lacksSide = (c,d) => c===START
  ? new Given(ends.at(c),d===2?START_RIGHT:START_DOWN)
  : c===END ? new Given(ends.at(c),d===0?END_LEFT:END_UP)
  : new Given(shape.at(c),...ALL_SHAPES.filter(v=>!uses[d](v)));
// A used edge has exactly one outgoing arrow, giving each internal vertex one
// incoming and one outgoing edge. Endpoint domains orient the route from green.
const orientationRules=gridCells.flatMap(c=>[1,2].flatMap(d=>{
  const n=graph.step(c,...dirs[d]); if(!n)return [];
  return [new Or([lacksSide(c,d),new Pair(key((a,b)=>(a===d+2)!==(b===(d+2)%4+2)), 'directed edge',outgoing.at(c),outgoing.at(n))])];
}));
// Residues start at 1 and increment along every outgoing edge. Both moduli
// determine the positions uniquely from green; lcm(9,10)=90 exceeds 81, so no
// disconnected directed cycle fits. Sentinel 11 fixes both counters off-path.
const layers=[[modNine,9],[modTen,10]];
const counterDomains=layers.flatMap(([layer,mod])=>gridCells.map(c=>
  c===START||c===END ? new Given(layer.at(c),...Array.from({length:mod},(_,i)=>i+1))
  : new Or([new And([new Given(shape.at(c),OFF),new Given(layer.at(c),11)]),new And([new Given(shape.at(c),...ON_CODES),new Given(layer.at(c),...Array.from({length:mod},(_,i)=>i+1))])])
));
const counterRules=layers.flatMap(([layer,mod])=>[new Given(layer.at(START),1),...gridCells.flatMap(c=>dirs.flatMap(([dr,dc],d)=>{
  const n=graph.step(c,dr,dc);if(!n)return [];
  return [new Or([new Given(outgoing.at(c),...outCodes.filter(v=>v!==d+2)),new Pair(key((a,b)=>a<=mod&&b===a%mod+1),'route position',layer.at(c),layer.at(n))])];
}))]);

// The gt predicate witnesses another grave digit above and below each path digit.
const gtKey = Pair.fnToKey((a, b) => a > b, boardShape);
const graveExclusions = graves.flatMap(({ cells }) => cells.map(cell => {
  const others = cells.filter(other => other !== cell);
  return new Or([
    new Given(shape.at(cell), OFF),
    new And([
      new Or(others.map(other => new Pair(gtKey, 'gt', other, cell))), 
      new Or(others.map(other => new Pair(gtKey, 'gt', cell, other))), 
    ]),
  ]);
}));

return [
  boardShape,
  graph.makeReplicate(new Given('R1C1',1,2,3,4,5,6,7,8,9)),
  ...graveConstraints,
  shape.toVar('shape'),
  ends.toVar('end'),
  ...shapeDomains,
  ...cornerPlaceholders,
  ...endDomains,
  ...generalEdges,
  ...cornerEdges,
  outgoing.toVar('outgoing direction'),
  modNine.toVar('position modulo 9'),
  modTen.toVar('position modulo 10'),
  ...outgoingRules,
  ...orientationRules,
  ...counterDomains,
  ...counterRules,
  ...graveExclusions,
];
