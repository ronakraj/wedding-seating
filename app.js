document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lookup-form');
  const input = document.getElementById('name-input');
  const result = document.getElementById('result');
  const suggestions = document.getElementById('suggestions');
  const status = document.getElementById('status');

  let seating = [];
  const byName = new Map();

  const normalize = (s) =>
    String(s || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (s) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    }[s]));

  async function loadSeating() {
    try {
      status.textContent = 'Loading seating…';
      const res = await fetch('seating.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      seating = await res.json();

      byName.clear();
      seating.forEach((entry) => {
        if (!entry || !entry.name) return;
        byName.set(normalize(entry.name), entry);
        if (Array.isArray(entry.aliases)) {
          entry.aliases.forEach((alias) => byName.set(normalize(alias), entry));
        }
      });

      status.textContent = `Loaded ${byName.size} guests.`;
      input.disabled = false;
      input.focus();
    } catch (err) {
      console.error(err);
      status.textContent = 'Could not load seating list. Ensure seating.json is present.';
      input.disabled = true;
    }
  }

  loadSeating();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    suggestions.innerHTML = '';
    const query = normalize(input.value);
    if (!query) return;

    const entry = byName.get(query);
    if (entry) {
      const seatText =
        entry.seat !== undefined && entry.seat !== null ? ` (Seat ${escapeHtml(entry.seat)})` : '';
      result.innerHTML = `
        <div class="card success">
          <h2>Welcome, ${escapeHtml(entry.name)}!</h2>
          <p>Your seat: <strong>${escapeHtml(entry.table || 'TBD')}</strong>${seatText}</p>
          ${entry.note ? `<p class="note">${escapeHtml(entry.note)}</p>` : ''}
        </div>
      `;
    } else {
      result.innerHTML = `
        <div class="card warn">
          <h2>We couldn't find that name.</h2>
          <p>Please try the full name as it appears on your invitation.</p>
        </div>
      `;

      // Lightweight suggestions (substring match)
      const matches = seating
        .map((e) => e.name)
        .filter(Boolean)
        .map((n) => ({ raw: n, norm: normalize(n) }))
        .filter((c) => c.norm.includes(query) || query.includes(c.norm))
        .slice(0, 5);

      if (matches.length) {
        const p = document.createElement('p');
        p.textContent = 'Did you mean:';
        const ul = document.createElement('ul');
        ul.className = 'suggestions-list';
        matches.forEach((m) => {
          const li = document.createElement('li');
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'suggestion';
          btn.textContent = m.raw;
          btn.addEventListener('click', () => {
            input.value = m.raw;
            form.requestSubmit();
          });
          li.appendChild(btn);
          ul.appendChild(li);
        });
        suggestions.appendChild(p);
        suggestions.appendChild(ul);
      }
    }
  });
});