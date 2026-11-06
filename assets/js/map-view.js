(function () {
  var nodes = document.querySelectorAll("[data-map-view]");
  if (!nodes.length || !window.L) return;
  var root = document.querySelector("[data-map-key]");
  var key = root ? root.getAttribute("data-map-key") : "";
  if (!key) return;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
  });

  nodes.forEach(function (el) {
    var lat = Number(el.getAttribute("data-lat"));
    var lng = Number(el.getAttribute("data-lng"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    var map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 15);
    L.tileLayer("https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=" + encodeURIComponent(key), {
      tileSize: 512,
      zoomOffset: -1,
      minZoom: 1,
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      crossOrigin: true
    }).addTo(map);
    L.marker([lat, lng]).addTo(map);
    setTimeout(function () { map.invalidateSize(); }, 200);
  });
})();
