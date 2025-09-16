function cambiarMes(delta) {
  mesActual = (mesActual + delta + 12) % 12; // para que rote de 0 a 11
  mostrarMes(mesActual);
}




function obtenerClima() {
  const ciudad = document.getElementById("ciudad").value.trim();
  const out = document.getElementById("clima");

  if (!ciudad) {
    out.textContent = "Por favor ingresa una ciudad.";
    return;
  }

  out.textContent = "Consultando clima…";

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${apiKey}&units=metric&lang=es`)
    .then(res => res.json())
    .then(data => {
      if (data.cod === "404") {
        out.textContent = "Ciudad no encontrada.";
      } else {
        const desc = data.weather[0].description;
        const temp = Math.round(data.main.temp);
        out.textContent = `${desc}, ${temp}°C`;
      }
    })
    .catch(() => {
      out.textContent = "Error al obtener el clima.";
    });
}


