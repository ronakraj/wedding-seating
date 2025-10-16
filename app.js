// Set this to your deployed API endpoint (e.g., from Vercel)
const API_URL = 'https://wedding-seating-api.vercel.app/api/lookup';
// Optional: if you add a shared passcode on the API, put it here and on signage
const SHARED_PASSCODE = ''; // e.g., 'wedding2025'

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
          <p>Your seat: <strong>${escapeHtml(entry.table || 'TBD')}</strong>${seatText}</p>
          ${entry.note ? `<p class="note">${escapeHtml(entry.note)}</p>` : ''}
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