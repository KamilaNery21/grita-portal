// GRITA! — Motor do dashboard
// Lê planilha Google Sheets via CSV público e renderiza dados filtrados por cliente

const SHEET_ID = '1gXB8hbOPRQgAnm-k8bqKS4BwHlPwEn6OiX6vi7E5JFo';

async function carregarAba(nomeAba) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(nomeAba)}`;
  const res = await fetch(url);
  const txt = await res.text();
  const json = JSON.parse(txt.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);?\s*$/)[1]);
  const cols = json.table.cols.map(c => c.label);
  const rows = json.table.rows.map(row =>
    Object.fromEntries(cols.map((col, i) => [col, row.c[i]?.v ?? row.c[i]?.f ?? '']))
  );
  return rows.filter(r => r[cols[0]]);
}

function getMes(dataStr) {
  if (!dataStr) return '';
  const parts = String(dataStr).split('/');
  if (parts.length >= 2) {
    const meses = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${meses[parseInt(parts[1])]}/${parts[2] || '2026'}`;
  }
  return '';
}

function getSemana(dataStr) {
  if (!dataStr) return '';
  const dia = parseInt(String(dataStr).split('/')[0]);
  if (dia <= 7)  return 'Sem 1';
  if (dia <= 14) return 'Sem 2';
  if (dia <= 21) return 'Sem 3';
  return 'Sem 4+';
}

function barChart(entries, cores) {
  const max = Math.max(...entries.map(e => e[1]), 1);
  const paleta = cores || ['#003ff9','#dbe700','#f60000','#00c875','#ff6b35'];
  return entries.map(([lbl, val], i) => `
    <div class="bar-row">
      <div class="bar-lbl" title="${lbl}">${lbl}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(val/max*100)}%;background:${paleta[i % paleta.length]}"></div></div>
      <div class="bar-num">${val}</div>
    </div>`).join('');
}

window.GRITA = { carregarAba, getMes, getSemana, barChart };
