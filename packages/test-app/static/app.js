const trackerList = document.getElementById('tracker-list');
const petList = document.getElementById('pet-list');
const statusEl = document.getElementById('status');
const summaryEl = document.getElementById('tracker-summary');
const eventsEl = document.getElementById('events');
const titleEl = document.getElementById('tracker-title');
const trackerChip = document.getElementById('tracker-chip');
const overviewEl = document.getElementById('tracker-overview');
const detailsDialog = document.getElementById('details-dialog');
const detailsTab = document.getElementById('details-tab');
const closeDetails = document.getElementById('close-details');
const controlStatus = document.getElementById('control-status');

const map = L.map('map').setView([42.41724, -71.16994], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
const marker = L.marker([42.41724, -71.16994]).addTo(map);

let currentSource;
let currentTrackerPayload = null;
let currentTrackerId = null;

closeDetails.onclick = () => detailsDialog.close();
detailsTab.onclick = () => detailsDialog.showModal();

document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    if (!currentTrackerId) {
      controlStatus.textContent = 'Select a tracker first.';
      return;
    }
    const action = btn.getAttribute('data-action');
    controlStatus.textContent = `Sending ${action}…`;
    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackerId: currentTrackerId, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Control failed');
      controlStatus.textContent = `${action} sent successfully.`;
      eventsEl.textContent = `${JSON.stringify({ type: 'control_result', payload: data }, null, 2)}\n\n${eventsEl.textContent}`.slice(0, 20000);
    } catch (err) {
      controlStatus.textContent = `Error: ${err.message}`;
    }
  });
});

async function loadSummary() {
  const res = await fetch('/api/summary');
  const data = await res.json();
  statusEl.textContent = `User ${data.userId}`;

  trackerList.innerHTML = '';
  for (const tracker of data.trackers) {
    const li = document.createElement('li');
    const label = tracker.model_number || tracker.details?.model_number || 'tracker';
    li.innerHTML = `<strong>${tracker._id}</strong><br><span>${label}</span>`;
    li.onclick = () => selectTracker(tracker._id, li);
    trackerList.appendChild(li);
  }

  petList.innerHTML = '';
  for (const pet of data.pets) {
    const li = document.createElement('li');
    const name = pet.details?.name || pet._id;
    const type = pet.details?.pet_type || pet._type || 'pet';
    li.innerHTML = `<strong>${name}</strong><br><span>${type}</span>`;
    petList.appendChild(li);
  }

  if (data.trackers[0]?._id) {
    const first = trackerList.querySelector('li');
    if (first) first.classList.add('active');
    await selectTracker(data.trackers[0]._id, first);
  }
}

async function selectTracker(trackerId, li) {
  currentTrackerId = trackerId;
  controlStatus.textContent = '';
  for (const el of trackerList.querySelectorAll('li')) el.classList.remove('active');
  if (li) li.classList.add('active');

  const res = await fetch(`/api/tracker/${trackerId}`);
  const data = await res.json();
  currentTrackerPayload = data;
  titleEl.textContent = `Tracker ${trackerId} details`;
  summaryEl.textContent = JSON.stringify(data, null, 2);
  trackerChip.textContent = `${trackerId} · ${data.tracker?.model_number || 'tracker'}`;
  overviewEl.innerHTML = renderOverview(data);

  const latlong = data.positionReport?.latlong;
  if (Array.isArray(latlong) && latlong.length === 2) {
    marker.setLatLng([latlong[0], latlong[1]]);
    map.setView([latlong[0], latlong[1]], 15);
  }

  if (currentSource) currentSource.close();
  currentSource = new EventSource(`/api/stream?trackerId=${encodeURIComponent(trackerId)}`);
  currentSource.onmessage = (event) => {
    const parsed = JSON.parse(event.data);
    eventsEl.textContent = `${JSON.stringify(parsed, null, 2)}\n\n${eventsEl.textContent}`.slice(0, 20000);
    const payload = parsed.payload;
    if (parsed.type === 'tracker_status' && currentTrackerPayload) {
      currentTrackerPayload.tracker = {
        ...currentTrackerPayload.tracker,
        state: payload.tracker_state,
        state_reason: payload.tracker_state_reason,
        charging_state: payload.charging_state,
        battery_state: payload.battery_state,
      };
      currentTrackerPayload.positionReport = payload.position || currentTrackerPayload.positionReport;
      currentTrackerPayload.hardwareReport = payload.hardware || currentTrackerPayload.hardwareReport;
      summaryEl.textContent = JSON.stringify(currentTrackerPayload, null, 2);
      overviewEl.innerHTML = renderOverview(currentTrackerPayload);
    }
    const liveLatLong = payload?.position?.latlong;
    if (Array.isArray(liveLatLong) && liveLatLong.length === 2) {
      marker.setLatLng([liveLatLong[0], liveLatLong[1]]);
      map.setView([liveLatLong[0], liveLatLong[1]], map.getZoom());
    }
  };
}

function renderOverview(data) {
  const tracker = data.tracker || {};
  const pos = data.positionReport || {};
  const hw = data.hardwareReport || {};
  const lat = pos?.latlong?.[0];
  const lng = pos?.latlong?.[1];
  return [
    row('Model', tracker.model_number || 'unknown'),
    row('State', tracker.state || tracker.tracker_state || 'unknown'),
    row('Reason', tracker.state_reason || tracker.tracker_state_reason || '—'),
    row('Battery', hw.battery_level ?? tracker.battery_level ?? 'n/a'),
    row('Charging', tracker.charging_state || 'unknown'),
    row('Firmware', tracker.fw_version || 'unknown'),
    row('Coordinates', lat != null && lng != null ? `${lat}, ${lng}` : 'n/a'),
  ].join('');
}

function row(label, value) {
  return `<div class="overview-row"><strong>${escapeHtml(String(label))}</strong><span>${escapeHtml(String(value))}</span></div>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

loadSummary().catch((err) => {
  statusEl.textContent = `Error: ${err.message}`;
});
