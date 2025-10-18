// Set this to your deployed API endpoint (e.g., from Vercel)
const API_URL = 'https://wedding-seating-api-neaq.vercel.app/api/lookup';
// Optional: if you add a shared passcode on the API, put it here and on signage
const SHARED_PASSCODE = 'kiraj2025'; // e.g., 'wedding2025'

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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lookup-form');
  const input = document.getElementById('name-input');
  const result = document.getElementById('result');
  const suggestions = document.getElementById('suggestions');
  const status = document.getElementById('status');

  // Fetch all names/aliases for suggestions
  let allNames = [];
  async function fetchNames() {
    try {
      const res = await fetch(API_URL, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        allNames = data.names || [];
      }
    } catch (err) {
      console.error('Failed to fetch names:', err);
    }
  }
  fetchNames();

  // Show suggestions as user types
  input.addEventListener('input', () => {
    const query = normalize(input.value);
    suggestions.innerHTML = '';
    if (!query || allNames.length === 0) return;
    const matches = allNames.filter(n => normalize(n).includes(query));
    matches.slice(0, 8).forEach(name => {
      const div = document.createElement('div');
      div.className = 'suggestion';
      div.textContent = name;
      div.onclick = () => {
        input.value = name;
        suggestions.innerHTML = '';
      };
      suggestions.appendChild(div);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    suggestions.innerHTML = '';
    result.innerHTML = '';
    const name = input.value;
    const query = normalize(name);
    if (!query) return;

    status.textContent = 'Looking up seat…';
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, passcode: SHARED_PASSCODE || undefined }),
      });

      if (res.status === 404) {
        status.textContent = 'Not found.';
        result.innerHTML = `
          <div class="card warn">
            <h2>We couldn't find that name.</h2>
            <p>Please try the full name as it appears on your invitation.</p>
          </div>
        `;
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const entry = await res.json(); // { name, table, seat?, note? }
      status.textContent = 'Found.';
      const seatText = entry.seat !== undefined && entry.seat !== null
        ? ` (Seat ${escapeHtml(entry.seat)})`
        : '';
      result.innerHTML = `
        <div class="card success">
          <h2>Welcome, ${escapeHtml(entry.name)}!</h2>
          <h3> We are delighted you are here. </h3>
          <p>Your seat: <strong>${escapeHtml(entry.table || 'TBD')}</strong>${seatText}</p>
          ${entry.note ? `<p class="note">${escapeHtml(entry.note)}</p>` : ''}
          <p><em>Much love, Kira and Ronakraj (Kiraj)</em></p>
        </div>
      `;
    } catch (err) {
      status.textContent = 'Error contacting the server.';
      result.innerHTML = `
        <div class="card warn">
          <h2>Sorry, something went wrong.</h2>
          <p>Please try again in a moment or ask a host.</p>
        </div>
      `;
      console.error(err);
    }
  });
});