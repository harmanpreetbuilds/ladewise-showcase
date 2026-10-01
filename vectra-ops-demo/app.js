const shipments = [
  {id:'VH-24118', customer:'Al Noor Medical', route:'Jebel Ali → Riyadh', stage:'Customs clearance', waiting:'Commercial invoice correction', owner:'M. Rahman', next:'Request revised invoice', status:'blocked', attention:true, area:'customs', eta:'02 Oct, 14:00', container:'MSCU 481209-7', mode:'Sea → Road', docs:'5 of 6 ready', location:'Jebel Ali Port'},
  {id:'VH-24121', customer:'Gulf Retail Co.', route:'Dubai → Doha', stage:'GCC transport', waiting:'Saudi transit permit', owner:'A. Faris', next:'Confirm permit release', status:'attention', attention:true, area:'transport', eta:'02 Oct, 19:30', container:'FTL / 24T', mode:'Road', docs:'Complete', location:'Al Ghuwaifat'},
  {id:'VH-24124', customer:'Falcon Industrial', route:'Shanghai → Dubai', stage:'Freight movement', waiting:'Carrier milestone', owner:'L. Mathew', next:'Request carrier update', status:'attention', attention:true, area:'shipments', eta:'04 Oct, 08:00', container:'TLLU 902114-3', mode:'Sea', docs:'Complete', location:'Arabian Gulf'},
  {id:'VH-24125', customer:'Nova Interiors', route:'Dubai → Abu Dhabi', stage:'Warehousing', waiting:'Put-away confirmation', owner:'S. Khan', next:'Confirm bin allocation', status:'attention', attention:true, area:'warehouse', eta:'Today, 16:00', container:'WH-DO-1189', mode:'Warehouse', docs:'Complete', location:'Dubai South'},
  {id:'VH-24127', customer:'Meridian Foods', route:'Jebel Ali → Muscat', stage:'Customs clearance', waiting:'Nothing', owner:'M. Rahman', next:'Release for transport', status:'clear', attention:false, area:'customs', eta:'03 Oct, 11:00', container:'OOLU 771032-9', mode:'Sea → Road', docs:'Complete', location:'Jebel Ali Port'},
  {id:'VH-24129', customer:'Axis Technologies', route:'Frankfurt → Dubai', stage:'Freight movement', waiting:'Nothing', owner:'L. Mathew', next:'Monitor arrival', status:'clear', attention:false, area:'shipments', eta:'02 Oct, 22:15', container:'AWB 176-88214051', mode:'Air', docs:'Complete', location:'DXB inbound'},
  {id:'VH-24131', customer:'Aria Home', route:'Dubai → Kuwait City', stage:'GCC transport', waiting:'Driver border update', owner:'A. Faris', next:'Confirm border crossing', status:'attention', attention:true, area:'transport', eta:'03 Oct, 05:30', container:'FTL / 18T', mode:'Road', docs:'Complete', location:'Saudi border'},
  {id:'VH-24133', customer:'Crescent Pharma', route:'Mumbai → Dubai', stage:'Warehousing', waiting:'Nothing', owner:'S. Khan', next:'Prepare outbound order', status:'clear', attention:false, area:'warehouse', eta:'Completed', container:'WH-IN-2044', mode:'Sea → Warehouse', docs:'Complete', location:'Dubai South'}
];

const activities = [
  ['15:04','VH-24125','Warehouse task created','System','Put-away confirmation due'],
  ['14:42','VH-24121','Permit request updated','A. Faris','Transit permit pending authority release'],
  ['14:18','VH-24118','Supplier responded','M. Rahman','Corrected invoice promised within 30 min'],
  ['13:56','VH-24124','Carrier chased','L. Mathew','Milestone update requested'],
  ['13:25','VH-24127','Customs cleared','M. Rahman','Release received'],
  ['12:48','VH-24131','Driver update received','A. Faris','Approaching border checkpoint'],
  ['11:32','VH-24118','Exception opened','System','Invoice mismatch detected'],
];

let currentView = 'command';
let selectedId = shipments[0].id;
let activeFilter = 'all';

const content = document.getElementById('content');
const nav = document.getElementById('nav');

nav.addEventListener('click', e => {
  const btn = e.target.closest('[data-view]');
  if (!btn) return;
  currentView = btn.dataset.view;
  document.querySelectorAll('.nav-item').forEach(x => x.classList.toggle('active', x === btn));
  render();
});

document.getElementById('globalSearch').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  document.querySelectorAll('.ops-table tbody tr').forEach(row => {
    row.style.display = !q || row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});

function render() {
  if (currentView === 'command') renderCommand();
  else renderGeneric(currentView);
}

function renderCommand() {
  const frag = document.getElementById('command-template').content.cloneNode(true);
  content.replaceChildren(frag);
  renderMovements();
  renderAttention();
  renderDetail();
  content.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    content.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderMovements();
  }));
}

function movementMatches(s) {
  if (activeFilter === 'all') return true;
  if (activeFilter === 'attention') return s.attention;
  return s.area === activeFilter;
}

function renderMovements() {
  const tbody = document.getElementById('movementRows');
  if (!tbody) return;
  tbody.innerHTML = shipments.filter(movementMatches).map(s => `
    <tr data-id="${s.id}" class="${selectedId === s.id ? 'selected' : ''}">
      <td><span class="shipment-id">${s.id}</span></td>
      <td>${s.customer}</td>
      <td>${s.route}</td>
      <td><span class="stage-cell"><span class="status-dot ${s.status}"></span>${s.stage}</span></td>
      <td>${s.waiting}</td>
      <td>${s.owner}</td>
      <td>${s.next}</td>
    </tr>`).join('');
  tbody.querySelectorAll('tr').forEach(row => row.addEventListener('click', () => {
    selectedId = row.dataset.id;
    renderMovements();
    renderDetail();
  }));
}

function renderAttention() {
  const list = document.getElementById('attentionList');
  const items = shipments.filter(s => s.attention);
  document.getElementById('attentionCount').textContent = `${items.length} open`;
  list.innerHTML = items.map((s,i) => `
    <div class="attention-item" data-id="${s.id}">
      <div class="topline"><span class="ref">${s.id}</span><span class="age">${["3h 32m","2h 10m","1h 44m","58m","26m"][i] || 'Today'}</span></div>
      <div class="issue">${s.waiting}</div>
      <div class="next">Next: ${s.next} · ${s.owner}</div>
    </div>`).join('');
  list.querySelectorAll('.attention-item').forEach(x => x.addEventListener('click', () => {
    selectedId = x.dataset.id; renderMovements(); renderDetail();
  }));
}

function renderDetail() {
  const host = document.getElementById('shipmentDetail');
  if (!host) return;
  const s = shipments.find(x => x.id === selectedId) || shipments[0];
  host.innerHTML = `
    <div class="detail-head">
      <div class="detail-title"><strong>${s.id}</strong><span>${s.customer} · ${s.route}</span></div>
      <div class="detail-tabs"><button class="detail-tab active">Overview</button><button class="detail-tab">Documents</button><button class="detail-tab">Updates</button><button class="detail-tab">History</button></div>
    </div>
    <div class="detail-grid">
      <section class="detail-section">
        <h3>Shipment</h3>
        <div class="kv">
          <div class="k">Mode</div><div class="v">${s.mode}</div>
          <div class="k">Current location</div><div class="v">${s.location}</div>
          <div class="k">ETA / handoff</div><div class="v">${s.eta}</div>
          <div class="k">Documents</div><div class="v">${s.docs}</div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Operational progression</h3>
        <div class="timeline">
          <div class="timeline-row"><div class="time">Origin</div><div class="event">Booking and supplier documents confirmed</div></div>
          <div class="timeline-row"><div class="time">Customs</div><div class="event">${s.area==='customs' ? s.waiting : 'Clearance status recorded'}</div></div>
          <div class="timeline-row"><div class="time">GCC</div><div class="event">Transport owner and border handoff visible</div></div>
          <div class="timeline-row"><div class="time">Warehouse</div><div class="event">Inbound, put-away and outbound handoff tracked</div></div>
        </div>
      </section>
      <section class="detail-section">
        <h3>Next action</h3>
        <div class="action-box">
          <div class="issue">${s.attention ? s.waiting : 'No active blocker'}</div>
          <div class="meta">Owner: ${s.owner}<br>Next: ${s.next}<br>Customer update: ${s.attention ? 'Due after next milestone' : 'Current'}</div>
          <div class="action-row"><button class="small-btn primary">${s.attention ? 'Open action' : 'View shipment'}</button><button class="small-btn">Add note</button></div>
        </div>
      </section>
    </div>`;
}

const views = {
  shipments: {
    eyebrow:'Operations', title:'Shipments', subtitle:'Every live movement from customs entry through GCC transport and warehouse handoff.', tableTitle:'Live shipments', tableSubtitle:'Operational status, owner and next action.',
    head:['Shipment','Customer','Route','Stage','Owner','ETA','Next action'],
    rows: shipments.map(s => [s.id,s.customer,s.route,s.stage,s.owner,s.eta,s.next]),
    inspector: s => inspectorShipment(s)
  },
  customs: {
    eyebrow:'Clearance', title:'Customs', subtitle:'Clearance cases, document readiness and unresolved blockers.', tableTitle:'Clearance queue', tableSubtitle:'Cases requiring review before release.',
    head:['Shipment','Customer','Clearance state','Documents','Waiting on','Owner','Next action'],
    rows: shipments.filter(s=>['customs','shipments'].includes(s.area)).map(s => [s.id,s.customer,s.stage,s.docs,s.waiting,s.owner,s.next]),
    inspector: s => `<div class="inspector-title">${s?.id || 'VH-24118'}</div><div class="inspector-sub">Clearance control</div>${kvBlock([['Status',s?.stage||'Customs clearance'],['Waiting on',s?.waiting||'Commercial invoice correction'],['Documents',s?.docs||'5 of 6 ready'],['Owner',s?.owner||'M. Rahman']])}<div class="inspector-section"><h4>Next action</h4><div class="action-box"><div class="issue">${s?.next||'Request revised invoice'}</div><div class="meta">Keep the shipment visible until clearance can move.</div></div></div>${buttons('Open case','Request document')}`
  },
  transport: {
    eyebrow:'GCC transport', title:'Transport', subtitle:'Cross-border loads, border handoffs and driver exceptions.', tableTitle:'Road movements', tableSubtitle:'Current position, border state and next operational check.',
    head:['Shipment','Customer','Route','Location','Waiting on','Owner','Next action'],
    rows: shipments.filter(s=>s.area==='transport').map(s => [s.id,s.customer,s.route,s.location,s.waiting,s.owner,s.next]),
    inspector: s => inspectorShipment(s)
  },
  warehouse: {
    eyebrow:'Warehouse', title:'Warehouse', subtitle:'Inbound receipts, put-away and outbound readiness.', tableTitle:'Warehouse handoffs', tableSubtitle:'Work waiting between arrival and dispatch.',
    head:['Reference','Customer','Location','Stage','Waiting on','Owner','Next action'],
    rows: shipments.filter(s=>s.area==='warehouse').map(s => [s.id,s.customer,s.location,s.stage,s.waiting,s.owner,s.next]),
    inspector: s => inspectorShipment(s)
  },
  exceptions: {
    eyebrow:'Intervention', title:'Exceptions', subtitle:'Only shipments that need someone to act.', tableTitle:'Open exceptions', tableSubtitle:'Blocker, age, owner and next action in one place.',
    head:['Shipment','Customer','Issue','Stage','Owner','Age','Next action'],
    rows: shipments.filter(s=>s.attention).map((s,i) => [s.id,s.customer,s.waiting,s.stage,s.owner,['3h 32m','2h 10m','1h 44m','58m','26m'][i]||'Today',s.next]),
    inspector: s => `<div class="inspector-title">${s?.waiting || 'Commercial invoice correction'}</div><div class="inspector-sub">${s?.id || 'VH-24118'} · ${s?.customer || 'Al Noor Medical'}</div>${kvBlock([['Blocking',s?.stage||'Customs clearance'],['Owner',s?.owner||'M. Rahman'],['Current location',s?.location||'Jebel Ali Port'],['Next action',s?.next||'Request revised invoice']])}<div class="inspector-section"><h4>Operational note</h4><div class="action-box"><div class="issue">Keep this visible until the blocker is closed.</div><div class="meta">Customer update should follow the next confirmed milestone.</div></div></div>${buttons('Open exception','Add note')}`
  },
  activity: {
    eyebrow:'Records', title:'Activity', subtitle:'A clean operational history across customs, transport, freight and warehouse.', tableTitle:'Recent activity', tableSubtitle:'Who changed what, and when.',
    head:['Time','Shipment','Event','Actor','Details'], rows: activities,
    inspector: () => `<div class="inspector-title">Operational history</div><div class="inspector-sub">Immutable working context</div>${kvBlock([['Coverage','Customs → warehouse'],['Newest event','15:04'],['Open actions','5'],['Last sync','2 min ago']])}<div class="inspector-section"><h4>Why it matters</h4><div class="action-box"><div class="issue">No chasing old chats for context.</div><div class="meta">Every handoff stays attached to the shipment record.</div></div></div>`
  }
};

function renderGeneric(view) {
  const v = views[view];
  const frag = document.getElementById('generic-template').content.cloneNode(true);
  content.replaceChildren(frag);
  document.getElementById('genericEyebrow').textContent = v.eyebrow;
  document.getElementById('genericTitle').textContent = v.title;
  document.getElementById('genericSubtitle').textContent = v.subtitle;
  document.getElementById('genericTableTitle').textContent = v.tableTitle;
  document.getElementById('genericTableSubtitle').textContent = v.tableSubtitle;
  document.getElementById('genericPrimary').textContent = view==='exceptions' ? 'Add exception' : view==='activity' ? 'Export activity' : 'Add record';
  document.getElementById('genericHead').innerHTML = `<tr>${v.head.map(h=>`<th>${h}</th>`).join('')}</tr>`;
  const body = document.getElementById('genericBody');
  body.innerHTML = v.rows.map((row,i)=>`<tr data-index="${i}" class="${i===0?'selected':''}">${row.map((x,j)=>`<td class="${j===0?'shipment-id':''}">${x}</td>`).join('')}</tr>`).join('');
  const select = i => {
    body.querySelectorAll('tr').forEach((r,k)=>r.classList.toggle('selected',k===i));
    const ref = v.rows[i]?.[0];
    const shipment = shipments.find(s=>s.id===ref);
    document.getElementById('genericInspector').innerHTML = v.inspector(shipment);
  };
  body.querySelectorAll('tr').forEach((r,i)=>r.addEventListener('click',()=>select(i)));
  select(0);
}

function kvBlock(entries) {
  return `<div class="inspector-section"><h4>Context</h4><div class="kv">${entries.map(([k,v])=>`<div class="k">${k}</div><div class="v">${v}</div>`).join('')}</div></div>`;
}
function buttons(primary, secondary) {
  return `<div class="inspector-actions"><button class="small-btn primary">${primary}</button><button class="small-btn">${secondary}</button></div>`;
}
function inspectorShipment(s=shipments[0]) {
  return `<div class="inspector-title">${s.id}</div><div class="inspector-sub">${s.customer} · ${s.route}</div>${kvBlock([['Stage',s.stage],['Location',s.location],['Waiting on',s.waiting],['Owner',s.owner],['ETA',s.eta]])}<div class="inspector-section"><h4>Next action</h4><div class="action-box"><div class="issue">${s.next}</div><div class="meta">Keep ownership and the next handoff visible until the movement progresses.</div></div></div>${buttons('Open shipment','Add note')}`;
}

render();