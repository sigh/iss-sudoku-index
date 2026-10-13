// Title: Denver
// Author: zetamath
// Video: https://www.youtube.com/watch?v=BOUee_H8rVM
// Source: https://app.crackingthecryptic.com/sudoku/9rb36pr87q

// The initial video explanation (647-662s) writes the size in every cell.
// Partition into connected ominos labelled by their size; equal sizes cannot
// touch orthogonally. A single orthogonal centre loop visits each omino in one
// nonempty run. Adjacent off-loop cells share an omino. Every arrow crosses a
// region border; its target label counts visited cells of the arrow's omino.
const GRID = '10x10';
const DIGITS = [1,2,3,4,5,6,7,8,9];
// Arrow tails and directions transcribed from the black arrow glyphs.
const ARROWS = [[1, 1, 0, 1], [1, 2, 1, 0], [1, 5, 0, 1], [1, 7, 0, 1], [2, 3, 0, 1], [2, 7, 1, 0], [2, 8, 1, 0], [2, 10, -1, 0], [3, 1, 0, 1], [3, 3, 0, 1], [3, 6, 0, -1], [3, 8, 1, 0], [3, 10, 0, -1], [4, 2, -1, 0], [4, 2, 1, 0], [4, 7, 1, 0], [5, 5, 0, 1], [6, 2, 1, 0], [6, 4, 1, 0], [6, 5, 0, 1], [6, 5, 1, 0], [6, 10, 0, -1], [6, 10, 1, 0], [7, 5, 0, 1], [7, 5, 1, 0], [9, 6, 0, 1], [9, 9, -1, 0], [10, 6, 0, 1], [10, 7, 0, 1]];
const S_UNUSED=1,S_UNUSED_X=2,S_FWD=3,S_FWD_X=4,S_BWD=5,S_BWD_X=6;
const S_MAX=6;
const isCrossing=v=>v===2||v===4||v===6;
const isUsed=v=>v>=3;
const M_OFF=1,M_ON=2,M_ENTRY=3,M_ON_SEAM=4,M_ENTRY_SEAM=5;
const M_MAX=5;
const isOn=v=>v!==1;
const isEntry=v=>v===3||v===5;
const isSeam=v=>v===4||v===5;
// Coprime moduli exclude seam-free cycles: 9*13 exceeds 100 cells.
const MOD_P=9, MOD_Q=13;
const shape=new Shape(GRID,13,'Raw');
const graph=cellGraph(shape), geometry=graph.gridGeometry(), gridCells=graph.cells();
const rootRow=graph.makeOverlay('VR'),rootCol=graph.makeOverlay('VC');
const depth=graph.makeOverlay('VD'),loop=graph.makeOverlay('VM');
const posP=graph.makeOverlay('VP'),posQ=graph.makeOverlay('VQ');
const coord=cell=>parseCellId(cell);
const machine=(spec,name,cells)=>new NFA(NFA.encodeSpec(spec,geometry),name,...cells);
const unequal=(a,b)=>new Pair(Pair.fnToKey((x,y)=>x!==y,geometry),'different',a,b);
const steps = [];
const incidentAt = new Map(gridCells.map(cell => [cell, []]));
gridCells.forEach(cell => {
  for (const [dR, dC] of [[0, 1], [1, 0]]) {
    const other = graph.step(cell, dR, dC);
    if (!other) continue;
    const id = 'VS' + (steps.length + 1);
    steps.push({ id, a: cell, b: other });
    incidentAt.get(cell).push(
      { id, other, out: [S_FWD, S_FWD_X], in: [S_BWD, S_BWD_X] });
    incidentAt.get(other).push(
      { id, other: cell, out: [S_BWD, S_BWD_X], in: [S_FWD, S_FWD_X] });
  }
});
const cellOrder = new Map(gridCells.map((cell, i) => [cell, i]));
for (const list of incidentAt.values()) {
  list.sort((x, y) => cellOrder.get(x.other) - cellOrder.get(y.other));
}

const digitDomain=graph.makeReplicate(new Given(gridCells[0],...DIGITS));
const loopDomain=loop.makeReplicate(new Given(loop.at(gridCells[0]),1,2,3,4,5));
const posPDomain=posP.makeReplicate(new Given(posP.at(gridCells[0]),1,2,3,4,5,6,7,8,9));
const coordinates=[rootRow,rootCol].map(o=>o.makeReplicate(new Given(o.at(gridCells[0]),1,2,3,4,5,6,7,8,9,10)));
const depthDomain=depth.makeReplicate(new Given(depth.at(gridCells[0]),1,2,3,4,5,6,7,8,9));
// Depth is BFS distance plus one; first cell in reading order names the region.
const roots=gridCells.map(cell=>{
 const {row,col}=coord(cell);
 return machine({startState:{k:0},transition:(s,v)=>{
  if(s.k===0)return {k:1,r:v};
  if(s.k===1){if(s.r>row||(s.r===row&&v>col))return undefined;return {k:2,self:s.r===row&&v===col};}
  if(s.k===2)return (v===1)===s.self?{k:3}:undefined;
  return undefined;
 },accept:s=>s.k===3},'region-root',[rootRow.at(cell),rootCol.at(cell),depth.at(cell)]);
});
const descentKey=Pair.fnToKey((a,b)=>a===b+1,geometry);
const descent=gridCells.map(cell=>new Or([new Given(depth.at(cell),1),...incidentAt.get(cell).map(e=>new And([
 new SameValues(2,rootRow.at(cell),rootRow.at(e.other)),new SameValues(2,rootCol.at(cell),rootCol.at(e.other)),
 new Pair(descentKey,'depth-descent',depth.at(cell),depth.at(e.other))]))]));
// Each edge compares root coordinates, labels and depths. Same labels are
// precisely the same region across an edge; distance is canonical BFS depth.
const regionEdges=steps.map(e=>machine({startState:{k:0},transition:(s,v)=>{
 switch(s.k){
 case 0:return {k:1,r:v};case 1:return {k:2,same:v===s.r};
 case 2:return {k:3,same:s.same,c:v};case 3:return {k:4,same:s.same&&v===s.c};
 case 4:return {k:5,same:s.same,n:v};case 5:if((v===s.n)!==s.same)return undefined;return {k:6,same:s.same};
 case 6:return {k:7,same:s.same,d:v};case 7:return !s.same||Math.abs(v-s.d)<=1?{k:8}:undefined;
 default:return undefined;
 }},accept:s=>s.k===8},'region-edge',[rootRow.at(e.a),rootRow.at(e.b),rootCol.at(e.a),rootCol.at(e.b),e.a,e.b,depth.at(e.a),depth.at(e.b)]));
// Each possible root has its own scan. A non-root is inactive, while a root's
// coordinate matches count all cells of its region and compare with its label.
const sizes=gridCells.map(cell=>{
 const {row,col}=coord(cell);
 return machine({startState:{k:0},transition:(s,v)=>{
  if(s.k===0)return {k:1,active:v===1};
  if(s.k===1)return s.active?{k:2,target:v,count:0}:{k:5};
  if(s.k===5)return s;
  if(s.k===2)return {...s,k:3,match:v===row};
  if(s.k===3)return {...s,k:4,match:s.match&&v===col};
  if(s.k===4){const count=s.count+Number(s.match);return count>s.target?undefined:{k:2,target:s.target,count};}
  return undefined;
 },accept:s=>s.k===5||(s.k===2&&s.count===s.target)},'region-size',
 [depth.at(cell),cell,...gridCells.flatMap(c=>[rootRow.at(c),rootCol.at(c),loop.at(c)])]);
});
const stepLabels = steps.map(s => {
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      switch (state.k) {
        case 0:
          if (value > S_MAX) return undefined;
          return { k: 1, crossing: isCrossing(value) };
        case 1: return { k: 2, crossing: state.crossing, seen: value };
        case 2:
          return { k: 3, crossing: state.crossing, sameA: value === state.seen };
        case 3:
          return { k: 4, crossing: state.crossing, sameA: state.sameA, seen: value };
        case 4: {
          const same = state.sameA && value === state.seen;
          return same === state.crossing ? undefined : { k: 5 };
        }
        default: return undefined;
      }
    },
    accept: (state) => state.k === 5,
  }, geometry);
  return new NFA(machine, 'step-cage-border',
    s.id, rootRow.at(s.a), rootRow.at(s.b), rootCol.at(s.a), rootCol.at(s.b));
});

const degrees = gridCells.map(cell => {
  const incident = incidentAt.get(cell);
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) {
        if (value > M_MAX) return undefined;
        return { k: 1, mode: value, in: 0, out: 0, crossIn: false };
      }
      const step = incident[state.k - 1];
      if (!step) return undefined;
      let { in: nIn, out: nOut, crossIn } = state;
      if (step.in.includes(value)) {
        nIn++;
        crossIn = isCrossing(value);
      } else if (step.out.includes(value)) {
        nOut++;
      } else if (value !== S_UNUSED && value !== S_UNUSED_X) {
        return undefined;
      }
      if (nIn > 1 || nOut > 1) return undefined;
      return { k: state.k + 1, mode: state.mode, in: nIn, out: nOut, crossIn };
    },
    accept: (state) => {
      if (state.k !== incident.length + 1) return false;
      if (!isOn(state.mode)) return state.in === 0 && state.out === 0;
      return state.in === 1 && state.out === 1 &&
        isEntry(state.mode) === state.crossIn;
    },
  }, geometry);
  return new NFA(machine, 'loop-degree',
    loop.at(cell), ...incident.map(step => step.id));
});

// --- The cage border rule -------------------------------------------------
// Only an unused crossing step needs checking: a used one already has both of
// its cells on the loop.
const borders = steps.map(s => {
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      switch (state.k) {
        case 0: return { k: 1, mustCover: value === S_UNUSED_X };
        case 1:
          return { k: 2, mustCover: state.mustCover && !isOn(value) };
        case 2: return state.mustCover && !isOn(value) ? undefined : { k: 3 };
        default: return undefined;
      }
    },
    accept: (state) => state.k === 3,
  }, geometry);
  return new NFA(machine, 'cage-border-visited',
    s.id, loop.at(s.a), loop.at(s.b));
});

// Count arrivals from another region separately for each possible root. A
// zero-entry run is allowed only when all loop cells belong to that region;
// this covers the one-region loop without counting the seam as a false entry.
const visits=gridCells.map(cell=>{
 const {row,col}=coord(cell);
 return machine({startState:{k:0},transition:(s,v)=>{
 if(s.k===0)return v===1?{k:1,entries:0,on:0,outside:false}:{k:4};
 if(s.k===4)return s;
 if(s.k===1)return {...s,k:2,match:v===row};
 if(s.k===2)return {...s,k:3,match:s.match&&v===col};
 if(s.k===3){const entries=s.entries+Number(s.match&&isEntry(v));if(entries>1)return undefined;
 return {k:1,entries,on:Math.min(1,s.on+Number(s.match&&isOn(v))),outside:s.outside||(!s.match&&isOn(v))};}
 return undefined;
 },accept:s=>s.k===4||(s.k===1&&s.on===1&&(s.entries===1||(s.entries===0&&!s.outside)))},'one-region-visit',
 [depth.at(cell),...gridCells.flatMap(c=>[rootRow.at(c),rootCol.at(c),loop.at(c)])]);
});
const arrowBorders=ARROWS.map(([r,c,dr,dc])=>{
 const a=makeCellId(r,c),b=makeCellId(r+dr,c+dc);
 return new Or([unequal(rootRow.at(a),rootRow.at(b)),unequal(rootCol.at(a),rootCol.at(b))]);
});
// Fixing the candidate root in each branch keeps the counting machine small;
// all 100 root coordinates remain possible, regardless of how many regions form.
const arrowCounts=ARROWS.flatMap(([r,c,dr,dc])=>{
 const a=makeCellId(r,c),b=makeCellId(r+dr,c+dc);
 return gridCells.map(root=>{
 const {row,col}=coord(root);
 const count=machine({startState:{k:0},transition:(s,v)=>{
 if(s.k===0)return {k:1,target:v,count:0};
 if(s.k===1)return {...s,k:2,match:v===row};
 if(s.k===2)return {...s,k:3,match:s.match&&v===col};
 if(s.k===3){const count=s.count+Number(s.match&&isOn(v));return count>s.target?undefined:{k:1,target:s.target,count};}
 return undefined;
 },accept:s=>s.k===1&&s.count===s.target},'arrow-visit-count',[b,...gridCells.flatMap(c=>[rootRow.at(c),rootCol.at(c),loop.at(c)])]);
 return new Or([new Given(rootRow.at(a),...Array.from({length:10},(_,i)=>i+1).filter(v=>v!==row)),
 new Given(rootCol.at(a),...Array.from({length:10},(_,i)=>i+1).filter(v=>v!==col)),count]);
 });
});
const loopConnected = new ConnectedValues(
  'VM', [M_ON, M_ENTRY, M_ON_SEAM, M_ENTRY_SEAM]);

// --- The seam -------------------------------------------------------------
// Numbering a closed loop is free to start anywhere and to run either way, an
// artifact of the counters rather than of the puzzle. The start is pinned by
// making the seam the first on-loop cell in reading order.
const seamPlacement = new NFA(NFA.encodeSpec({
  startState: { seen: false },
  transition: (state, value) => {
    if (value > M_MAX) return undefined;
    if (isSeam(value)) return state.seen ? undefined : { seen: true };
    if (!state.seen && isOn(value)) return undefined;
    return state;
  },
  accept: (state) => state.seen,
}, geometry), 'loop-seam', ...loop.at(gridCells));

// The direction is pinned by making the seam leave along the first of its steps
// in the order used by `incidentAt`. The seam has one step in and one step out,
// so exactly one of the two ways round satisfies this.
const seamDirection = gridCells.map(cell => {
  const incident = incidentAt.get(cell);
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      if (state.k === 0) return { k: 1, seam: isSeam(value), settled: false };
      const step = incident[state.k - 1];
      if (!step) return undefined;
      if (!state.seam || state.settled || !isUsed(value)) {
        return { k: state.k + 1, seam: state.seam, settled: state.settled };
      }
      if (!step.out.includes(value)) return undefined;
      return { k: state.k + 1, seam: true, settled: true };
    },
    accept: (state) =>
      state.k === incident.length + 1 && (!state.seam || state.settled),
  }, geometry);
  return new NFA(machine, 'loop-seam-direction',
    loop.at(cell), ...incident.map(step => step.id));
});

// --- Position counters ----------------------------------------------------
// Every step the loop uses moves one place on, except at the seam where the
// count restarts.
const nextPos = (value, mod) => 1 + (value % mod);
// A cell the loop misses, and the seam itself, both take position 1.
const restKey = Pair.fnToKey(
  (mode, value) => isOn(mode) && !isSeam(mode) || value === 1, geometry);
const counters = [[posP, MOD_P], [posQ, MOD_Q]].flatMap(([pos, mod]) => {
  const machine = NFA.encodeSpec({
    startState: { k: 0 },
    transition: (state, value) => {
      switch (state.k) {
        case 0:
          if (value > S_MAX) return undefined;
          return { k: 1, code: value };
        case 1: return { k: 2, code: state.code, aSeam: isSeam(value) };
        case 2: {
          const forward = state.code === S_FWD || state.code === S_FWD_X;
          const backward = state.code === S_BWD || state.code === S_BWD_X;
          const mode = forward ? (isSeam(value) ? 'free' : 'fwd')
            : backward ? (state.aSeam ? 'free' : 'bwd') : 'free';
          return { k: 3, mode };
        }
        case 3: return { k: 4, mode: state.mode, first: value };
        case 4: {
          if (state.mode === 'fwd' && value !== nextPos(state.first, mod)) {
            return undefined;
          }
          if (state.mode === 'bwd' && state.first !== nextPos(value, mod)) {
            return undefined;
          }
          return { k: 5 };
        }
        default: return undefined;
      }
    },
    accept: (state) => state.k === 5,
  }, geometry);
  return [
    ...steps.map(s => new NFA(machine, `loop-position-mod-${mod}`,
      s.id, loop.at(s.a), loop.at(s.b), pos.at(s.a), pos.at(s.b))),
    ...gridCells.map(cell => new Pair(restKey, `loop-position-rest-mod-${mod}`,
      loop.at(cell), pos.at(cell))),
  ];
});
return [shape,rootRow.toVar('region root row'),rootCol.toVar('region root column'),depth.toVar('region BFS depth plus one'),
new Var('S','directed loop edges',steps.length),loop.toVar('loop membership, entry and seam'),posP.toVar('position mod 9'),posQ.toVar('position mod 13'),
digitDomain,loopDomain,posPDomain,...coordinates,depthDomain,...roots,...descent,...regionEdges,...sizes,...stepLabels,...degrees,...borders,
...visits,...arrowBorders,...arrowCounts,loopConnected,seamPlacement,...seamDirection,...counters];
