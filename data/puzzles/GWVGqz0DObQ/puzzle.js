// Title: San Francisco Summer
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=GWVGqz0DObQ
// Source: https://sudokupad.app/zquz3i6htm

// Normal 6x6 Sudoku. Each circle heads one orthogonal, nonoverlapping
// arrow whose shaft digits sum to its circle. Concealed circles and paths
// are solver-discovered; six visible cells fix the fragments below.
const shape = new Shape('6x6', '0-6');
const pred = new Var('P', 'Predecessor port', '6x6');
const succ = new Var('S', 'Successor port', '6x6');
const target = new Var('T', 'Arrow total', '6x6');
const accum = new Var('A', 'Shaft prefix sum', '6x6');
const marked = new Var('M', 'Visible clue encountered', '6x6');
const M=marked.cells();
const visible=new Set([6,11,23,28,31,34]);
const P = pred.cells(), S = succ.cells(), T = target.cells(), A = accum.cells();
const ids = Array.from({length:36}, (_, i) => makeCellId(1+Math.floor(i/6),1+i%6));
// Ports: 0 absent, 1 north, 2 east, 3 south, 4 west.
// The local machine distinguishes unused cells, bulbs, bodies and terminals.
// T is the bulb digit throughout a path; A excludes the bulb and grows on shafts.
const localSpec = NFA.encodeSpec({
  startState: {v:[]},
  transition: ({v}, x) => {
    if (!v) return undefined;
    const w = [...v,x];
    if (w.length <= 2 && x > 4) return undefined;
    if (w.length === 5) {
      const [p,s,t,a,d] = w;
      const off = p===0 && s===0 && t===0 && a===0;
      const bulb = p===0 && s>0 && t===d && a===0;
      const body = p>0 && s>0 && p!==s && t>0 && a>0 && a<t;
      const end = p>0 && s===0 && t>0 && a===t;
      return off || bulb || body || end ? {done:true} : undefined;
    }
    return {v:w};
  },
  accept: s => s.done === true,
  maxDepth:5,
}, shape);
const locals = ids.map((id,i) => new NFA(localSpec,'arrow cell',[P[i],S[i],T[i],A[i],id]));
const directions = [[-1,0,1,3],[0,1,2,4],[1,0,3,1],[0,-1,4,2]];
const edges = ids.flatMap((id,i) => {
  const r=Math.floor(i/6), c=i%6;
  return directions.flatMap(([dr,dc,dir,opp]) => {
    const nr=r+dr,nc=c+dc;
    if(nr<0 || nr>=6 || nc<0 || nc>=6) {
      return [new Given(P[i],...[0,1,2,3,4].filter(v=>v!==dir)),new Given(S[i],...[0,1,2,3,4].filter(v=>v!==dir))];
    }
    const j=nr*6+nc;
    // Each outgoing port is paired with exactly the reciprocal incoming port.
    const key=Pair.fnToKey((s,p)=>(s===dir)===(p===opp),shape);
    const absent=new Given(S[i],...[0,1,2,3,4].filter(v=>v!==dir));
    // A linked next cell adds its digit. Strict growth rules out disconnected cycles.
    return [new Pair(key,'reciprocal ports',S[i],P[j]),new Or([
      absent,
      new And([new Given(S[i],dir),new SameValues(2,T[i],T[j]),new EqualSum([A[i],ids[j]],[A[j]]),...(visible.has(j)?[new Given(M[j],1)]:[new SameValues(2,M[i],M[j])])]),
    ])];
  });
});
// White circles with northward stems in the two visible cells.
const bulbs=[6,11].flatMap(i=>[new Given(P[i],0),new Given(S[i],1)]);
// Full-width horizontal fragments: source lines #0 R6C5, #1 R6C2, #2 R5C5.
const fragments=[34,31,28].map(i=>new Or([
  new And([new Given(P[i],2),new Given(S[i],4)]),
  new And([new Given(P[i],4),new Given(S[i],2)]),
]));
// Drawn right-pointing arrowhead at R4C6, entering from its west boundary.
const endpoint=[new Given(P[23],4),new Given(S[23],0)];
// Every arrow has a representative touching a revealed clue: delete any wholly
// concealed component, which changes no digit or visible clue. The marker prefix
// is fixed along each retained path, and its terminal must have encountered a clue.
const representatives=ids.flatMap((id,i)=>[
  new Given(M[i],0,1),
  new Or([
    new And([new Given(P[i],0),new Given(S[i],0),new Given(M[i],0)]),
    new And([new Given(P[i],0),new Given(S[i],1,2,3,4),new Given(M[i],visible.has(i)?1:0)]),
    new Given(P[i],1,2,3,4),
  ]),
  new Or([new Given(S[i],1,2,3,4),new Given(P[i],0),new Given(M[i],1)]),
]);
return [shape,pred,succ,target,accum,marked,...representatives,...ids.map(id=>new Given(id,1,2,3,4,5,6)),...locals,...edges,...bulbs,...fragments,...endpoint];
