// PHDME project page interactions: math rendering, results chart, reveal-on-scroll, BibTeX copy.

// Table 1 of the paper: held-out ground-truth test trajectories.
const RESULTS = {
  string: {
    label: 'String (N = 1000)',
    rows: [
      { model: 'PHDME +proj (ours)', ours: true, relL2: 0.397, oracle: 0.121, mse: '1.47×10⁻³', econs: 0.084 },
      { model: 'PHDME (ours)', ours: true, relL2: 0.413, oracle: 0.183, mse: '1.58×10⁻³', econs: 0.093 },
      { model: 'DDPM', relL2: 0.637, oracle: 0.574, mse: '3.06×10⁻³', econs: 0.150 },
      { model: 'ConvNODE', relL2: 0.537, oracle: 0.121, mse: '2.32×10⁻³', econs: 0.025 },
      { model: 'FieldPHNN', relL2: 0.097, oracle: 0.014, mse: '4.35×10⁻⁴', econs: 0.087 },
      { model: 'GP rollout', relL2: 0.085, oracle: 0.091, mse: '7.40×10⁻⁴', econs: 0.103 },
    ],
    ref: { oracle: 0.056 },
  },
  membrane: {
    label: 'Membrane (N = 500)',
    rows: [
      { model: 'PHDME +proj (ours)', ours: true, relL2: 0.298, oracle: 0.106, mse: '7.42×10⁻³', econs: 0.018 },
      { model: 'PHDME (ours)', ours: true, relL2: 0.297, oracle: 0.116, mse: '7.36×10⁻³', econs: 0.015 },
      { model: 'DDPM', relL2: 0.380, oracle: 0.150, mse: '1.20×10⁻²', econs: 0.016 },
      { model: 'ConvNODE', relL2: 0.337, oracle: 0.114, mse: '9.29×10⁻³', econs: 0.018 },
      { model: 'FieldPHNN', relL2: 0.498, oracle: 2.784, mse: '2.24×10⁻²', econs: 0.028 },
      { model: 'GP rollout', relL2: 0.266, oracle: 0.423, mse: '6.70×10⁻³', econs: 0.014 },
    ],
    ref: { oracle: 0.045, econs: 0.013 },
  },
  spring: {
    label: 'Real-world spring (N = 250)',
    rows: [
      { model: 'PHDME +proj (ours)', ours: true, relL2: 0.1137, oracle: null, mse: '9.21×10⁻⁴', econs: 0.529 },
      { model: 'PHDME (ours)', ours: true, relL2: 0.1137, oracle: null, mse: '9.20×10⁻⁴', econs: 0.529 },
      { model: 'DDPM', relL2: 0.1144, oracle: null, mse: '9.33×10⁻⁴', econs: 0.529 },
      { model: 'ConvNODE', relL2: 0.1208, oracle: null, mse: '9.95×10⁻⁴', econs: 0.521 },
      { model: 'FieldPHNN', relL2: 0.5205, oracle: null, mse: '1.73×10⁻²', econs: 0.386 },
      { model: 'GP rollout', relL2: 0.1143, oracle: null, mse: '9.33×10⁻⁴', econs: 0.529 },
    ],
    ref: { econs: 0.527 },
  },
};

const METRICS = {
  relL2: { name: 'Relative L2 error', short: 'relL2', hint: 'lower is better' },
  oracle: { name: 'Oracle-phys (analytic PDE residual)', short: 'oracle-phys', hint: 'lower is better' },
  econs: { name: 'E-cons (energy variation)', short: 'E-cons', hint: 'lower is better' },
};

const state = { system: 'string', metric: 'relL2' };

function fmt(v) {
  return v >= 1 ? v.toFixed(3) : v < 0.1 ? v.toFixed(3) : String(+v.toFixed(4));
}

function renderChart() {
  const sys = RESULTS[state.system];
  const metric = METRICS[state.metric];
  const chart = document.getElementById('chart');
  const title = document.getElementById('chart-title');
  const note = document.getElementById('chart-note');
  const ref = sys.ref[state.metric];
  const isSpringEcons = state.system === 'spring' && state.metric === 'econs';

  title.textContent = `${metric.name} — ${sys.label}` +
    (isSpringEcons ? ' · should match ground truth 0.527' : ` · ${metric.hint}`);

  const rows = sys.rows.filter(r => r[state.metric] != null);
  if (!rows.length) {
    chart.innerHTML = '<p class="chart-empty">Not available: the real spring has no closed-form governing equations.</p>';
    note.textContent = '';
    return;
  }

  const max = Math.max(...rows.map(r => r[state.metric]), ref || 0) * 1.04;
  chart.innerHTML = rows.map(r => {
    const v = r[state.metric];
    const refLine = ref ? `<span class="ref-line" style="--x:${(ref / max) * 100}%"></span>` : '';
    return `<div class="bar-row${r.ours ? ' ours' : ''}" data-model="${r.model}" data-value="${fmt(v)}" tabindex="0">
      <span class="bar-label" title="${r.model}">${r.model}</span>
      <span class="bar-track"><span class="bar" style="--w:0%" data-w="${(v / max) * 100}%"></span>${refLine}</span>
      <span class="bar-value">${fmt(v)}</span>
    </div>`;
  }).join('');

  // animate from 0 on the next frame
  requestAnimationFrame(() => requestAnimationFrame(() => {
    chart.querySelectorAll('.bar').forEach(b => b.style.setProperty('--w', b.dataset.w));
  }));

  note.innerHTML = ref
    ? `<span class="ref-key"></span>Ground-truth level: ${ref}` +
      (state.metric === 'oracle' ? ' (finite-difference floor; values below it mean agreement with the discretized equations, not better physics)' : '')
    : '';
}

function renderTable() {
  const sys = RESULTS[state.system];
  const cols = ['relL2', 'oracle', 'econs'];
  const best = {};
  if (state.system !== 'spring') {
    cols.forEach(c => { best[c] = Math.min(...sys.rows.map(r => r[c])); });
  } else {
    best.relL2 = Math.min(...sys.rows.map(r => r.relL2));
  }
  const cell = (r, c) => {
    if (r[c] == null) return '<td>—</td>';
    return `<td class="${best[c] === r[c] ? 'best' : ''}">${fmt(r[c])}</td>`;
  };
  document.getElementById('table').innerHTML = `
    <table class="data">
      <thead><tr><th>Model</th><th>relL2</th><th>oracle-phys</th><th>MSE</th><th>E-cons</th></tr></thead>
      <tbody>${sys.rows.map(r => `<tr class="${r.ours ? 'ours' : ''}"><td>${r.model}</td>${cell(r, 'relL2')}${cell(r, 'oracle')}<td>${r.mse}</td>${cell(r, 'econs')}</tr>`).join('')}</tbody>
    </table>`;
}

function syncControls() {
  document.querySelectorAll('[data-system]').forEach(b => b.setAttribute('aria-selected', b.dataset.system === state.system));
  document.querySelectorAll('[data-metric]').forEach(b => {
    b.setAttribute('aria-selected', b.dataset.metric === state.metric);
    b.disabled = state.system === 'spring' && b.dataset.metric === 'oracle';
  });
}

function update() {
  if (state.system === 'spring' && state.metric === 'oracle') state.metric = 'relL2';
  syncControls();
  renderChart();
  renderTable();
}

function initResults() {
  document.querySelectorAll('[data-system]').forEach(b => b.addEventListener('click', () => { state.system = b.dataset.system; update(); }));
  document.querySelectorAll('[data-metric]').forEach(b => b.addEventListener('click', () => { state.metric = b.dataset.metric; update(); }));

  const panel = document.querySelector('.results-panel');
  const tip = document.getElementById('tooltip');
  const show = (row, x, y) => {
    tip.innerHTML = `<b>${row.dataset.model}</b><br><span class="tt-k">${METRICS[state.metric].short}:</span> ${row.dataset.value}`;
    const pr = panel.getBoundingClientRect();
    const left = Math.min(x - pr.left + 14, pr.width - tip.offsetWidth - 8);
    tip.style.left = `${Math.max(8, left)}px`;
    tip.style.top = `${y - pr.top - tip.offsetHeight - 10}px`;
    tip.classList.add('show');
  };
  const chart = document.getElementById('chart');
  chart.addEventListener('mousemove', e => {
    const row = e.target.closest('.bar-row');
    row ? show(row, e.clientX, e.clientY) : tip.classList.remove('show');
  });
  chart.addEventListener('mouseleave', () => tip.classList.remove('show'));
  chart.addEventListener('focusin', e => {
    const row = e.target.closest('.bar-row');
    if (!row) return;
    const r = row.querySelector('.bar').getBoundingClientRect();
    show(row, r.right, r.top);
  });
  chart.addEventListener('focusout', () => tip.classList.remove('show'));

  update();
}

function initMath() {
  if (!window.katex) return;
  document.querySelectorAll('[data-tex]').forEach(el => {
    katex.render(el.dataset.tex, el, { displayMode: el.classList.contains('eq'), throwOnError: false });
  });
}

function initReveal() {
  const targets = document.querySelectorAll('.card, .step, .figure, .finding, .equation-block, .results-panel, .speed');
  targets.forEach(t => { if (!t.classList.contains('speed')) t.classList.add('reveal'); });
  if (!('IntersectionObserver' in window)) { targets.forEach(t => t.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  targets.forEach(t => io.observe(t));
}

function initCopy() {
  document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const text = document.querySelector(btn.dataset.copy).textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
    } catch {
      btn.textContent = 'Select & copy';
    }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  initMath();
  initResults();
  initReveal();
  initCopy();
});
