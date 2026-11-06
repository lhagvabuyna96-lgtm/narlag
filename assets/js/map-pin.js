(function () {
  var el = document.getElementById("order-map");
  var label = document.getElementById("pin-label");
  var button = document.getElementById("locate-me");
  var marker = null;

  window.NarlagPin = {
    get: function () {
      if (!marker) return null;
      var point = marker.getLatLng();
      return { lat: point.lat, lng: point.lng };
    }
  };

  if (!el) return;
  var key = el.getAttribute("data-map-key") || "";
  if (!key || !window.L) {
    el.textContent = "Газрын зураг ачаалсангүй.";
    return;
  }

  fixIcons();
  var map = L.map(el, { scrollWheelZoom: false }).setView([47.92, 106.91], 11);
  tiles(key).addTo(map);
  setTimeout(function () { map.invalidateSize(); }, 200);

  function show(lat, lng) {
    if (label) label.textContent = "Pin: " + lat.toFixed(5) + ", " + lng.toFixed(5);
  }

  function setPin(lat, lng, zoom) {
    if (!marker) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", function () {
        var point = marker.getLatLng();
        show(point.lat, point.lng);
      });
    } else {
      marker.setLatLng([lat, lng]);
    }
    map.setView([lat, lng], zoom || Math.max(map.getZoom(), 15));
    show(lat, lng);
  }

  map.on("click", function (event) {
    setPin(event.latlng.lat, event.latlng.lng);
  });

  if (button) {
    button.addEventListener("click", function () {
      if (!navigator.geolocation) {
        if (label) label.textContent = "Энэ төхөөрөмж байршил өгөхгүй. Зураг дээр дарна уу.";
        return;
      }
      button.disabled = true;
      navigator.geolocation.getCurrentPosition(function (pos) {
        button.disabled = false;
        setPin(pos.coords.latitude, pos.coords.longitude, 16);
      }, function () {
        button.disabled = false;
        if (label) label.textContent = "Байршил авагдсангүй. Зураг дээр дарна уу.";
      }, { enableHighAccuracy: true, timeout: 10000 });
    });
  }

  function tiles(token) {
    return L.tileLayer("https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=" + encodeURIComponent(token), {
      tileSize: 512,
      zoomOffset: -1,
      minZoom: 1,
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      crossOrigin: true
    });
  }

  function fixIcons() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
    });
  }
})();
