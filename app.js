/* =====================================================================
   Gestão à Vista Comercial — Zucchi
   Protótipo Fase 7 — dados simulados, sem conexão com Salesforce.
   Em produção: DATA e CONFIG são lidos via fetch() de data/dashboard-data.json
   e config/dashboard-config.json, gerados pela rotina do Claude Cowork.
   ===================================================================== */

const FALLBACK_CONFIG = {
  refreshMinutes: 10,
  staleAfterMinutes: 45,
  screens: [
    { id: "cover", active: true, order: 1, durationSeconds: 10 },
    { id: "destaque-meta", active: false, order: 2, durationSeconds: 18 },
    { id: "destaque-container", active: false, order: 3, durationSeconds: 15 },
    { id: "v1-meta", active: true, order: 4, durationSeconds: 20 },
    { id: "v5-recebimento", active: true, order: 5, durationSeconds: 15 },
    { id: "v4-taj", active: true, order: 6, durationSeconds: 18 },
    { id: "r2-taj", active: true, order: 7, durationSeconds: 20 },
    { id: "campanha-direcionamento", active: true, order: 8, durationSeconds: 25 },
    { id: "v4-reservas", active: true, order: 9, durationSeconds: 18 },
    { id: "v2-ofertas", active: true, order: 10, durationSeconds: 20 },
    { id: "v3-containers", active: true, order: 11, durationSeconds: 15 },
    { id: "rotina-vendedor", active: true, order: 12, durationSeconds: 20 },
    { id: "r1-atividades", active: true, order: 13, durationSeconds: 15 },
    { id: "marketing", active: true, order: 14, durationSeconds: 20 }
  ]
};

// Fallback embutido para que o protótipo funcione mesmo aberto localmente
// (file://) sem servidor HTTP. Em produção isso NÃO é usado — os arquivos
// data/dashboard-data.json e config/dashboard-config.json são carregados
// via fetch normalmente, pois o site estará hospedado.
let CONFIG = FALLBACK_CONFIG;
let DATA = null;

async function loadJSON(path, fallback){
  try{
    const res = await fetch(path, {cache:"no-store"});
    if(!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  }catch(e){
    console.warn("Falha ao carregar " + path + " — usando fallback embutido.", e);
    return fallback;
  }
}

function fmtPct(v, casas=1){ return (v*100).toFixed(casas).replace(".", ",") + "%"; }
function fmtInt(v){ return Number(v).toLocaleString("pt-BR"); }
function fmtM2(v){ return Number(v).toLocaleString("pt-BR", {maximumFractionDigits:2}) + " m²"; }

function barColor(pct){
  if(pct <= 0.5) return "danger";
  if(pct <= 0.85) return "warn";
  return "";
}

function renderBars(container, rows, opts={}){
  container.classList.add("bars-list");
  container.innerHTML = "";
  rows.forEach(r=>{
    const row = document.createElement("div");
    row.className = "bar-row";
    const cls = opts.qtde ? "" : barColor(r.pct);
    row.innerHTML = `
      <div class="name">${r.vendedor}</div>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:${opts.qtde ? Math.min(100, (r.qtde/opts.maxQtde)*100) : (r.pct*100)}%"></div></div>
      <div class="pct">${opts.qtde ? fmtInt(r.qtde) : fmtPct(r.pct)}</div>
    `;
    container.appendChild(row);
  });
}

function metaBarColor(pct){
  if(pct < 0.5) return "danger";
  if(pct < 1.0) return "warn";
  return ""; // >=100% da meta: verde (classe padrão)
}

function renderMetaBars(container, rows){
  container.classList.add("bars-list");
  container.innerHTML = "";
  rows.forEach(r=>{
    const row = document.createElement("div");
    row.className = "bar-row";
    const cls = metaBarColor(r.pct);
    const width = Math.min(100, r.pct*100);
    row.innerHTML = `
      <div class="name">${r.vendedor}</div>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:${width}%"></div></div>
      <div class="pct">${fmtPct(r.pct)}</div>
    `;
    container.appendChild(row);
  });
}

function renderScreenV1(){
  renderBars(document.getElementById("v1-ano"), DATA.v1MetaVendedor.ano);
  renderBars(document.getElementById("v1-mes"), DATA.v1MetaVendedor.mesAtual);
}

function renderScreenV2(){
  const maxQ = Math.max(...DATA.v2Ofertas.porVendedor.map(r=>r.qtde));
  renderBars(document.getElementById("v2-bars"), DATA.v2Ofertas.porVendedor, {qtde:true, maxQtde:maxQ});
  document.getElementById("v2-total").textContent = fmtInt(DATA.v2Ofertas.totalMes);
}

function renderScreenV3(){
  document.getElementById("v3-qtde").textContent = fmtInt(DATA.v3Containers.qtdeSemana);
  const wrap = document.getElementById("v3-cols");
  wrap.innerHTML = "";
  const max = Math.max(...DATA.v3Containers.porDia.map(d=>d.qtde), 1);
  DATA.v3Containers.porDia.forEach(d=>{
    const h = 4 + (d.qtde/max)*70;
    const col = document.createElement("div");
    col.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:flex-end;flex:1;height:100%;";
    col.innerHTML = `
      <div style="font-family:'Barlow Condensed';font-weight:800;font-size:1.6vw;color:var(--green-dark);">${d.qtde}</div>
      <div style="width:60%;height:${h}%;background:var(--green-dark);border-radius:8px 8px 0 0;"></div>
      <div style="margin-top:.6vh;font-size:.85vw;color:var(--ink-soft);">${d.dia}</div>
    `;
    wrap.appendChild(col);
  });
}

function renderScreenV4Reservas(){
  document.getElementById("v4-qtde").textContent = fmtInt(DATA.v4Reservas.anoQtdeItens);
  document.getElementById("v4-m2").textContent = fmtM2(DATA.v4Reservas.anoM2);
  renderMetaBars(document.getElementById("v4-bars"), DATA.v4Reservas.porVendedorPctMetaMes);
}

function renderTajTable(elId, rows){
  const table = document.getElementById(elId);
  let html = "<thead><tr><th>Vendedor</th><th class='num'>% Valor</th><th class='num'>% Qtde</th></tr></thead><tbody>";
  rows.forEach(r=>{
    html += `<tr><td>${r.vendedor}</td><td class="num">${fmtPct(r.pctValor)}</td><td class="num">${fmtPct(r.pctQtde)}</td></tr>`;
  });
  html += "</tbody>";
  table.innerHTML = html;
}

function renderScreenV4Taj(){
  renderTajTable("v4taj-table-ano", DATA.v4Taj.ano);
  renderTajTable("v4taj-table-mes", DATA.v4Taj.mesAtual);
}

function fmtUsd(v){ return "US$ " + Number(v).toLocaleString("pt-BR", {maximumFractionDigits:0}); }

function renderScreenV5(){
  const d = DATA.v5Recebimento;
  const pctReal = d.pctMeta;
  const pctEsperado = d.ritmo ? d.ritmo.pctEsperado : null;

  const corReal = pctReal < pctEsperado ? "#9C4A3E" : pctReal <= pctEsperado*1.05 ? "#A68B5B" : "#3F493B";

  document.getElementById("v5-esperado-pct").textContent = pctEsperado!==null ? fmtPct(pctEsperado) : "—";
  document.getElementById("v5-realizado-pct").textContent = fmtPct(pctReal);
  document.getElementById("v5-realizado-pct").style.color = corReal;

  const wrap = document.getElementById("v5-bullet");
  const scaleMax = Math.max(pctReal, pctEsperado||0, 1) * 100 * 1.1; // folga de 10%
  const realWidth = Math.min(100, (pctReal*100/scaleMax)*100);
  const espPos = pctEsperado!==null ? Math.min(100, (pctEsperado*100/scaleMax)*100) : null;

  wrap.innerHTML = `
    <div class="bullet-track">
      <div class="bullet-fill" style="width:${realWidth}%;background:${corReal};"></div>
      ${espPos!==null ? `
        <div class="bullet-marker" style="left:${espPos}%;"></div>
        <div class="bullet-marker-label" style="left:${espPos}%;">Esperado</div>
      ` : ""}
    </div>
    <div class="bullet-scale"><span>0%</span><span>${Math.round(scaleMax)}%</span></div>
  `;
}

function renderScreenR1(){
  document.getElementById("r1-pend").textContent = fmtInt(DATA.r1Atividades.pendentes);
  document.getElementById("r1-atr").textContent = fmtInt(DATA.r1Atividades.atrasadas);
  const list = document.getElementById("r1-list");
  list.innerHTML = "";
  DATA.r1Atividades.porVendedor.forEach(r=>{
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="name">${r.vendedor}</div>
      <div style="font-size:.95vw;color:var(--ink-soft);">${r.pendentes} pendentes</div>
      <div class="pct" style="color:${r.atrasadas>0?'var(--red)':'var(--ink-soft)'};">${r.atrasadas} atrasadas</div>
    `;
    list.appendChild(row);
  });
}

function renderScreenR2(){
  document.getElementById("r2-qtde").textContent = fmtInt(DATA.r2Taj.qtdeItens);
  document.getElementById("r2-media").textContent = DATA.r2Taj.mediaDias + " dias";

  const rows = DATA.r2Taj.porVendedor;
  const totalDias = rows.reduce((a,r)=>a+r.mediaDias,0);
  const totalQtde = rows.reduce((a,r)=>a+r.qtde,0);
  const mediaGeral = Math.round(totalDias/rows.length);

  const table = document.getElementById("r2-table");
  let html = "<thead><tr><th>Vendedores</th><th class='num'>Média Dias desde Direc.</th><th class='num'>Qtde Itens Direc.</th></tr></thead><tbody>";
  rows.forEach(r=>{
    html += `<tr><td>${r.vendedor}</td><td class="num">${r.mediaDias}</td><td class="num">${r.qtde}</td></tr>`;
  });
  html += `<tr class="total"><td>Total</td><td class="num">${mediaGeral}</td><td class="num">${totalQtde}</td></tr>`;
  html += "</tbody>";
  table.innerHTML = html;
}

/* ---------- Rotina do Vendedor ---------- */
function renderScreenRotinaVendedor(){
  const rv = DATA.rotinaVendedor;
  const table = document.getElementById("rotina-table");
  if(!rv || !rv.vendedores || !rv.vendedores.length){
    table.outerHTML = `<div class="pending-banner">Aguardando dados reais do Salesforce.</div>`;
    return;
  }
  const etapas = rv.etapas;
  let html = "<thead><tr><th>Vendedor</th>";
  etapas.forEach(e=> html += `<th class="num">${e}</th>`);
  html += `<th class="num">Total</th></tr></thead><tbody>`;

  const vendedoresOrdenados = [...rv.vendedores].sort((a,b)=> b.total - a.total);
  vendedoresOrdenados.forEach(v=>{
    html += `<tr><td>${v.vendedor}</td>`;
    v.qtdes.forEach(q=> html += `<td class="num">${q}</td>`);
    html += `<td class="num">${v.total}</td></tr>`;
  });

  const totaisEtapa = etapas.map((_,i)=> rv.vendedores.reduce((a,v)=>a+v.qtdes[i],0));
  const totalGeral = totaisEtapa.reduce((a,b)=>a+b,0);
  html += `<tr class="total"><td>Total</td>`;
  totaisEtapa.forEach(t=> html += `<td class="num">${t}</td>`);
  html += `<td class="num">${totalGeral}</td></tr>`;

  html += "</tbody>";
  table.innerHTML = html;
}

/* ---------- Marketing ---------- */
const DONUT_COLORS = ["#3F493B","#A68B5B","#66705A","#C8B89E","#30302E","#8C9185","#B4A58C","#6F6E69"];

function renderScreenMarketing(){
  const mkt = DATA.marketing;
  document.getElementById("mkt-total").textContent = mkt ? fmtInt(mkt.totalSemFoto) : "—";

  const donutEl = document.getElementById("mkt-donut");
  const tableEl = document.getElementById("mkt-table");
  if(!mkt || !mkt.porProduto || !mkt.porProduto.length){
    donutEl.innerHTML = "";
    tableEl.outerHTML = `<div class="pending-banner">Aguardando dados reais do Salesforce.</div>`;
    return;
  }

  const dados = [...mkt.porProduto].sort((a,b)=> b.qtde - a.qtde);
  const total = dados.reduce((a,d)=>a+d.qtde,0);

  // SVG donut via stroke-dasharray
  const size = 220, r = 80, stroke = 34, circ = 2*Math.PI*r;
  let offset = 0;
  let arcs = "";
  dados.forEach((d,i)=>{
    const frac = d.qtde/total;
    const len = frac*circ;
    const color = DONUT_COLORS[i % DONUT_COLORS.length];
    arcs += `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}"
              stroke-width="${stroke}" stroke-dasharray="${len} ${circ-len}"
              stroke-dashoffset="${-offset}" transform="rotate(-90 ${size/2} ${size/2})"/>`;
    offset += len;
  });
  donutEl.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${arcs}
      <text x="${size/2}" y="${size/2-6}" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="30" fill="var(--ink)">${total}</text>
      <text x="${size/2}" y="${size/2+16}" text-anchor="middle" font-family="Inter" font-size="10" fill="var(--gray-mid)">SEM FOTO</text>
    </svg>
    <div class="donut-legend">
      ${dados.map((d,i)=>`
        <div class="donut-legend-row">
          <span class="donut-legend-dot" style="background:${DONUT_COLORS[i % DONUT_COLORS.length]}"></span>
          <span class="donut-legend-label">${d.produto}</span>
          <span class="donut-legend-value">${d.qtde}</span>
        </div>`).join("")}
    </div>
  `;

  let html = "<thead><tr><th>Product Name</th><th>Block</th><th>Code</th><th>Location</th><th>Situation</th><th>Created Date</th></tr></thead><tbody>";
  mkt.registros.forEach(r=>{
    html += `<tr><td>${r.produto}</td><td>${r.bloco}</td><td>${r.code}</td><td>${r.localizacao}</td><td>${r.situacao}</td><td>${r.dataCriacao}</td></tr>`;
  });
  html += "</tbody>";
  tableEl.innerHTML = html;
}

const RENDERERS = {
  "v1-meta": renderScreenV1,
  "v2-ofertas": renderScreenV2,
  "v3-containers": renderScreenV3,
  "v4-reservas": renderScreenV4Reservas,
  "v4-taj": renderScreenV4Taj,
  "v5-recebimento": renderScreenV5,
  "r1-atividades": renderScreenR1,
  "r2-taj": renderScreenR2,
};

function renderAll(){
  Object.keys(RENDERERS).forEach(id => RENDERERS[id]());
  updateMetaStrips();
}

function updateMetaStrips(){
  const generated = new Date(DATA.meta.generatedAt);
  const now = new Date();
  const minutesAgo = (now - generated) / 60000;
  const stale = minutesAgo > (CONFIG.staleAfterMinutes || 45);
  const timeStr = generated.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"});

  document.querySelectorAll(".meta-strip").forEach(el=>{
    el.innerHTML = `<span><span class="dot"></span>atualizado às ${timeStr}</span>`;
    el.classList.toggle("stale", stale);
  });
}

/* ---------------- rotação automática ---------------- */
let activeIndex = 0;
let activeScreens = [];
let rotationTimer = null;

function buildRotationList(){
  activeScreens = CONFIG.screens
    .filter(s => s.active)
    .sort((a,b)=> a.order - b.order);
}

function paintDots(){
  document.querySelectorAll("[data-dots]").forEach(dotsEl=>{
    dotsEl.innerHTML = activeScreens.map((s,i)=>
      `<span class="${i===activeIndex ? 'on':''}"></span>`
    ).join("");
  });
}

function showScreen(index){
  const target = activeScreens[index];
  document.querySelectorAll(".screen").forEach(el=>{
    el.classList.toggle("is-active", el.dataset.screen === target.id);
  });
  activeIndex = index;
  paintDots();

  clearTimeout(rotationTimer);
  const duration = (target.durationSeconds || 20) * 1000;
  rotationTimer = setTimeout(()=>{
    const next = (activeIndex + 1) % activeScreens.length;
    showScreen(next);
  }, duration);
}

/* ---------- helpers de foto ---------- */
function slugifyName(name){
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g,"-");
}
function photoTag(vendedor, cls){
  const src = (window.VENDOR_PHOTOS && window.VENDOR_PHOTOS[vendedor]) || null;
  if(src){
    return `<img class="${cls}" src="${src}" alt="${vendedor}">`;
  }
  const inicial = vendedor.split(" ")[0][0];
  return `<div class="${cls} placeholder">${inicial}</div>`;
}

/* ---------- Destaque: Metas Batidas ---------- */
function renderScreenDestaqueMeta(){
  const el = document.getElementById("destaque-meta-grid");
  const lista = DATA.destaqueMeta;
  if(!lista || !lista.length){
    el.outerHTML = `<div class="pending-banner">Nenhum vendedor atingiu 100% da meta no mês anterior.</div>`;
    return;
  }
  el.innerHTML = "";
  lista.forEach((r,i)=>{
    const primeiroNome = r.vendedor.split(" ")[0];
    const card = document.createElement("div");
    card.className = "vendor-card" + (i===0 ? " top" : "");
    card.innerHTML = `
      ${photoTag(r.vendedor, "photo")}
      <div class="first-name">${primeiroNome}</div>
      <div class="pct">${fmtPct(r.pct)}</div>
    `;
    el.appendChild(card);
  });
}

/* ---------- Destaque: Top 3 Containers ---------- */
function renderScreenDestaqueContainer(){
  const el = document.getElementById("destaque-container-podium");
  const lista = DATA.destaqueContainerTop3;
  if(!lista || lista.length < 3){
    el.innerHTML = `<div class="pending-banner">Aguardando dados reais do Salesforce — top 3 containers do mês anterior ainda não confirmado.</div>`;
    return;
  }
  // ordem visual: 2º, 1º, 3º
  const ordem = [lista[1], lista[0], lista[2]];
  const classes = ["second","first","third"];
  el.innerHTML = "";
  ordem.forEach((d,i)=>{
    const slot = document.createElement("div");
    slot.className = "podium-slot " + classes[i];
    slot.innerHTML = `
      ${photoTag(d.vendedor, "photo")}
      <div class="value">${d.valorFmt}</div>
      <div class="name">${d.vendedor}</div>
      <div class="podium-base">${d.posicao}</div>
    `;
    el.appendChild(slot);
  });
}

/* ---------- Campanha Direcionamento ---------- */
function renderScreenCampanhaDirecionamento(){
  const cd = DATA.campanhaDirecionamento;
  const table = document.getElementById("cd-table");
  if(!cd || !cd.vendedores || !cd.vendedores.length){
    table.outerHTML = `<div class="pending-banner">Aguardando dados reais do Salesforce — tela estrutural pronta, cálculo da campanha pendente de conexão.</div>`;
    document.getElementById("cd-total").textContent = "—";
    document.getElementById("cd-available").textContent = "—";
    document.getElementById("cd-accepted").textContent = "—";
    document.getElementById("cd-approval").textContent = "—";
    document.getElementById("cd-sold").textContent = "—";
    document.getElementById("cd-ativacao").textContent = "—";
    return;
  }
  document.getElementById("cd-total").textContent = fmtInt(cd.totalDirecionados);
  document.getElementById("cd-available").textContent = fmtInt(cd.totalAvailable);
  document.getElementById("cd-accepted").textContent = fmtInt(cd.totalAccepted);
  document.getElementById("cd-approval").textContent = fmtInt(cd.totalApproval);
  document.getElementById("cd-sold").textContent = fmtInt(cd.totalSold);
  document.getElementById("cd-ativacao").textContent = fmtPct(cd.pctAtivacao);

  const statusClass = {
    "Sem resultado": "status-sem-resultado",
    "Em andamento": "status-no-ritmo",
    "Com resultado": "status-meta-atingida"
  };

  let html = `<thead><tr><th>Vendedor</th><th class="num">Available</th><th class="num">Accepted</th><th class="num">Approval</th><th class="num">Sold</th><th class="num">Total</th><th class="num">Qtd Contas Ofertas</th><th class="num">Qtd Bundles Ofertados</th><th>Status</th></tr></thead><tbody>`;
  cd.vendedores.forEach(v=>{
    const cls = statusClass[v.status] || "status-sem-resultado";
    html += `<tr><td>${v.vendedor}</td><td class="num">${v.available}</td><td class="num">${v.accepted}</td><td class="num">${v.approval}</td><td class="num">${v.sold}</td><td class="num">${v.total}</td><td class="num">${fmtInt(v.qtdContasOfertas||0)}</td><td class="num">${fmtInt(v.qtdBundlesOfertados||0)}</td><td><span class="status-badge ${cls}">${v.status}</span></td></tr>`;
  });
  html += "</tbody>";
  table.innerHTML = html;
}

RENDERERS["destaque-meta"] = renderScreenDestaqueMeta;
RENDERERS["destaque-container"] = renderScreenDestaqueContainer;
RENDERERS["campanha-direcionamento"] = renderScreenCampanhaDirecionamento;
RENDERERS["rotina-vendedor"] = renderScreenRotinaVendedor;
RENDERERS["marketing"] = renderScreenMarketing;

async function init(){
  CONFIG = await loadJSON("config/dashboard-config.json", FALLBACK_CONFIG);
  DATA = await loadJSON("data/dashboard-data.json", null);
  if(typeof window.VENDOR_PHOTOS === "undefined"){
    window.VENDOR_PHOTOS = await loadJSON("data/vendor-photos.json", null);
  }

  if(!DATA){
    document.body.innerHTML = "<div style='padding:4vh;font-family:Inter;font-size:1.4vw;color:#9C4A3E;'>Falha ao carregar dados — nenhuma versão válida disponível.</div>";
    return;
  }

  buildRotationList();
  renderAll();
  showScreen(0);

  // reavalia "desatualizado" a cada minuto, sem re-renderizar tudo
  setInterval(updateMetaStrips, 60000);
}

init();
