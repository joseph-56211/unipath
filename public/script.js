const state = { places: [], markers: new Map(), activeCategory: 'all', userLocation: null, selected: null, campus: 'main' };
const campusCenter = [-0.00695, 34.59559];
const campusCenters = {main:[-0.00695,34.59559],siriba:[-0.00552,34.60691]};
const map = L.map('map', { scrollWheelZoom: false }).setView(campusCenter, 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 20, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
}).addTo(map);
const placeIcon = L.divIcon({className:'wayuni-marker',html:'<span>●</span>',iconSize:[22,22],iconAnchor:[11,11]});
const youIcon = L.divIcon({className:'you-marker',html:'<span></span>',iconSize:[20,20],iconAnchor:[10,10]});
const $ = (id) => document.getElementById(id);
function toast(message) { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),3200); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function categoryLabel(c) { return ({academic:'Academic',hostel:'Hostel',service:'Services'})[c] || 'Campus'; }
function renderPlaces(query='') {
  const list=$('placesList'); const q=query.trim().toLowerCase();
  const matches=state.places.filter(p => (state.campus==='all'||p.campus===state.campus) && (state.activeCategory==='all'||p.category===state.activeCategory) && (!q || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q)));
  $('placeCount').textContent=`${matches.length} places`;
  if(!matches.length){list.innerHTML='<div class="loading">No matches yet. Try another search term.</div>';return;}
  list.innerHTML=matches.map(p=>`<button class="place-item ${state.selected===p.id?'selected':''}" data-id="${escapeHtml(p.id)}"><span class="place-icon">${p.icon}</span><span class="place-info"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(categoryLabel(p.category))} · ${p.verified?'Reference point':'Pin needs verification'}</span></span><span class="place-arrow">›</span></button>`).join('');
  list.querySelectorAll('[data-id]').forEach(btn=>btn.addEventListener('click',()=>selectPlace(btn.dataset.id)));
}
function addMarkers() {
  state.places.forEach(p=>{
    const marker=L.marker([p.lat,p.lng],{icon:placeIcon}).addTo(map);
    marker.bindPopup(`<strong>${escapeHtml(p.name)}</strong><br><small>${escapeHtml(p.description)}</small><br><small>${p.verified?'Reference point':'Approximate pin — verify on campus'}</small>`);
    marker.on('click',()=>showRoute(p));
    if(p.campus!==state.campus) marker.setOpacity(0); state.markers.set(p.id,marker);
  });
}
function selectPlace(id) {
  const p=state.places.find(x=>x.id===id); if(!p)return;
  state.selected=id; renderPlaces($('searchInput').value);
  map.setView([p.lat,p.lng],17); state.markers.get(id)?.setOpacity(1); state.markers.get(id)?.openPopup(); showRoute(p);
  if(window.innerWidth<700) $('map').scrollIntoView({behavior:'smooth',block:'center'});
}
function showRoute(p) {
  state.selected=p.id;
  const from=state.userLocation ? `${state.userLocation.lat},${state.userLocation.lng}` : '';
  const directionsUrl=from
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(`${p.lat},${p.lng}`)}&travelmode=walking`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${p.lat},${p.lng}`)}&travelmode=walking`;
  const warning=p.verified?'Campus reference location.':'This is an approximate starter pin, not a surveyed building coordinate. Confirm the exact place with campus staff before relying on the route.';
  $('routePanel').classList.remove('hidden');
  $('routePanel').innerHTML=`<div><strong>${p.icon} ${escapeHtml(p.name)}</strong><p>${escapeHtml(p.description)}<br>${escapeHtml(warning)}</p></div><div class="route-actions"><a href="${directionsUrl}" target="_blank" rel="noreferrer">Walking directions ↗</a><button id="closeRoute">Close</button></div>`;
  $('closeRoute').addEventListener('click',()=>$('routePanel').classList.add('hidden'));
}
async function loadPlaces() {
  try {
    const response=await fetch('/api/places');
    if(!response.ok)throw new Error('Could not load place data');
    state.places=await response.json();
    addMarkers(); renderPlaces();
  } catch(e) {
    $('placesList').innerHTML='<div class="loading">Could not load campus places. Check that the WayUni server is running.</div>';
    toast('Could not load places. Please restart the server.');
  }
}
function runSearch(query=$('searchInput').value) {
  $('searchInput').value=query; state.activeCategory='all';
  document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.category==='all'));
  renderPlaces(query);
  const q=query.trim().toLowerCase();
  const match=state.places.find(p=>(state.campus==='all'||p.campus===state.campus) && `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q));
  if(match) selectPlace(match.id); else if(q) toast('No saved place matched. Try “library”, “hostel”, or “administration”.');
}
$('searchBtn').addEventListener('click',()=>runSearch());
$('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')runSearch();});
document.querySelectorAll('[data-query]').forEach(btn=>btn.addEventListener('click',()=>runSearch(btn.dataset.query)));
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{state.activeCategory=btn.dataset.category;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===btn));renderPlaces($('searchInput').value);}));
$('campusSelect').addEventListener('change',e=>{
  state.campus=e.target.value;
  state.selected=null;
  state.markers.forEach((marker,id)=>{
    const p=state.places.find(x=>x.id===id);
    if(state.campus==='all'||p.campus===state.campus) marker.setOpacity(1);
    else marker.setOpacity(0);
  });
  renderPlaces($('searchInput').value);
  if(state.campus==='all') {
    const visible=state.places.filter(p=>state.markers.has(p.id));
    if(visible.length) map.fitBounds(L.latLngBounds(visible.map(p=>[p.lat,p.lng])),{padding:[25,25]});
  } else map.setView(campusCenters[state.campus]||campusCenter,16);
});
$('locateBtn').addEventListener('click',()=>{
  if(!navigator.geolocation){toast('Your browser does not support location.');return;}
  toast('Requesting your location…');
  navigator.geolocation.getCurrentPosition(pos=>{
    state.userLocation={lat:pos.coords.latitude,lng:pos.coords.longitude};
    if(window.userMarker)map.removeLayer(window.userMarker);
    window.userMarker=L.marker([state.userLocation.lat,state.userLocation.lng],{icon:youIcon}).addTo(map).bindPopup('You are here (device GPS)').openPopup();
    map.setView([state.userLocation.lat,state.userLocation.lng],17);
    $('locateBtn').textContent='✓ Location found';
    toast('Location found. Choose a destination to get directions.');
  },err=>toast(err.code===1?'Location permission was denied. Allow it in your browser settings.':'Could not get your location. Try outdoors or use the map manually.'),{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
});
$('startHelp').addEventListener('click',()=>{runSearch('administration');$('explore').scrollIntoView({behavior:'smooth'});});
document.querySelectorAll('.jump-search').forEach(btn=>btn.addEventListener('click',()=>{runSearch(btn.dataset.query);$('explore').scrollIntoView({behavior:'smooth'});}));
loadPlaces();

if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
