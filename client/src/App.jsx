import { useState, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function App() {
  const [username, setUsername] = useState('');
  const [actors, setActors] = useState([]);
  const [relations, setRelations] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('System Online');

  const fetchData = async () => {
    try {
      const actorRes = await fetch('http://localhost:8080/api/actors');
      const actorData = await actorRes.json();
      setActors(Array.isArray(actorData) ? actorData : []);

      const relationRes = await fetch('http://localhost:8080/api/relations');
      const relationData = await relationRes.json();
      setRelations(Array.isArray(relationData) ? relationData : []);
    } catch (err) {
      setStatus('Link Interrupted');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => {
    const total = actors.length;
    const highRiskActors = actors.filter(a => a.risk_score > 70);
    const criticalThreats = actors.filter(a => a.risk_score > 85);
    const avgRisk = total > 0 ? actors.reduce((acc, a) => acc + a.risk_score, 0) / total : 0;
    
    return { 
      total, 
      highRiskCount: highRiskActors.length, 
      avgRisk: avgRisk.toFixed(1),
      criticalThreats 
    };
  }, [actors]);

  const intelligenceData = useMemo(() => {
    const influenceMap = {};
    relations.forEach(rel => {
      influenceMap[rel.target_id] = (influenceMap[rel.target_id] || 0) + 1;
      influenceMap[rel.source_id] = (influenceMap[rel.source_id] || 0) + 0.5;
    });

    const nodes = actors.map(a => ({
      id: a.id,
      name: a.username,
      risk: a.risk_score,
      val: (influenceMap[a.id] || 1) * 3 + 8,
      isHighlighted: a.username.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm !== ''
    }));

    const links = relations.map(r => ({ source: r.source_id, target: r.target_id }));
    const topActorId = Object.entries(influenceMap).sort((a, b) => b[1] - a[1])[0]?.[0];
    const keyPlayer = actors.find(a => a.id === topActorId)?.username || 'N/A';

    return { nodes, links, keyPlayer };
  }, [actors, relations, searchTerm]);

  const exportCSV = () => {
    let csv = "id,username,risk_score,created_at\n" + actors.map(a => `${a.id},${a.username},${a.risk_score.toFixed(2)},${a.created_at}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GI_Intelligence_Report.csv';
    a.click();
  };

  const addActor = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8080/api/actors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, risk_score: Math.random() * 100 })
    });
    if (res.ok) { setUsername(''); fetchData(); setStatus('Node Integrated'); }
  };

  const deleteActor = async (id) => {
    const res = await fetch(`http://localhost:8080/api/actors/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchData(); setStatus('Entity Purged'); }
  };

  const addRelation = async (e) => {
    e.preventDefault();
    if (!sourceId || !targetId) return;
    const res = await fetch('http://localhost:8080/api/relations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: sourceId, target_id: targetId, relation_type: 'intel' })
    });
    if (res.ok) { setStatus('Link Verified'); fetchData(); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 antialiased selection:bg-cyan-500/30">
      <nav className="border-b border-slate-800 bg-[#020617]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center font-black text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.4)]">GI</div>
            <h1 className="text-xl font-bold tracking-tight text-white">GraphIntelligence <span className="text-cyan-400">Core</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase text-slate-500 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 tracking-widest">{status}</span>
            <button onClick={exportCSV} className="bg-white text-slate-900 px-5 py-2 rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all active:scale-95">Export Report</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Average</p>
              <h2 className="text-3xl font-black text-amber-500">{stats.avgRisk}%</h2>
            </div>
            <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">High Threats</p>
              <h2 className="text-3xl font-black text-red-500">{stats.highRiskCount}</h2>
            </div>
          </div>

          {stats.criticalThreats.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl animate-pulse">
              <h4 className="text-[10px] font-black text-red-500 uppercase mb-2">Critical Threat Alerts</h4>
              <div className="space-y-2">
                {stats.criticalThreats.map(t => (
                  <div key={t.id} className="text-xs font-bold text-red-400">🚨 NODE DETECTED: {t.username} ({t.risk_score.toFixed(1)}%)</div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-6">
            <input 
              type="text" 
              placeholder="Search Intelligence..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#020617] border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            />
            
            <form onSubmit={addActor} className="pt-6 border-t border-slate-800 flex gap-2">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Register Node" className="flex-1 bg-[#020617] border border-slate-800 rounded-2xl px-4 py-2 text-sm focus:border-cyan-500 outline-none" />
              <button className="bg-cyan-500 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs uppercase shadow-lg shadow-cyan-500/20 active:scale-95">Add</button>
            </form>

            <form onSubmit={addRelation} className="pt-6 border-t border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select onChange={(e) => setSourceId(e.target.value)} className="bg-[#020617] border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500">
                  <option value="">Source</option>
                  {actors.map(a => <option key={a.id} value={a.id}>{a.username}</option>)}
                </select>
                <select onChange={(e) => setTargetId(e.target.value)} className="bg-[#020617] border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500">
                  <option value="">Target</option>
                  {actors.map(a => <option key={a.id} value={a.id}>{a.username}</option>)}
                </select>
              </div>
              <button className="w-full bg-emerald-500 text-slate-900 font-bold py-2 rounded-xl text-xs uppercase shadow-lg shadow-emerald-500/20 active:scale-95">Establish Link</button>
            </form>
          </div>

          <div className="bg-slate-900/40 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Directory</span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-full font-bold">{actors.length} Nodes</span>
            </div>
            <div className="max-h-[250px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {actors.map(a => (
                <div key={a.id} className="flex justify-between items-center p-3 hover:bg-slate-800/40 rounded-2xl group transition-all border border-transparent hover:border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${a.risk_score > 70 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                    <span className="text-sm font-semibold text-slate-200">{a.username}</span>
                  </div>
                  <button onClick={() => deleteActor(a.id)} className="text-[10px] opacity-0 group-hover:opacity-100 text-red-500 font-bold uppercase hover:underline transition-all">Terminate</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="bg-[#020617] border border-slate-800 rounded-[2.5rem] overflow-hidden h-[750px] relative shadow-2xl group/graph">
            <div className="absolute top-8 left-8 z-10 p-5 bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl group-hover/graph:border-cyan-500/50 transition-all duration-500">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">High Influence Node</p>
               <h3 className="text-2xl font-black text-white tracking-tight">{intelligenceData.keyPlayer}</h3>
            </div>
            
            <ForceGraph2D
              graphData={intelligenceData}
              backgroundColor="#020617"
              nodeLabel={n => `${n.name} | Threat Level: ${n.risk?.toFixed(1)}%`}
              linkColor={() => '#1e293b'}
              linkDirectionalArrowLength={5}
              linkDirectionalArrowRelPos={1}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 14/globalScale;
                ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                if (node.isHighlighted) {
                  ctx.beginPath(); ctx.arc(node.x, node.y, node.val * 0.9 + 5, 0, 2 * Math.PI);
                  ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 4/globalScale; ctx.stroke();
                }

                ctx.beginPath(); ctx.arc(node.x, node.y, node.val * 0.9, 0, 2 * Math.PI);
                ctx.fillStyle = node.risk > 85 ? '#ef4444' : node.risk > 70 ? '#f87171' : node.risk > 30 ? '#f59e0b' : '#10b981';
                ctx.fill();

                ctx.fillStyle = '#f8fafc';
                ctx.fillText(label, node.x, node.y + (node.val * 0.9) + 16);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;