function mostrarAlertas(data, pronostico) {
  const alertas = document.getElementById("alertasClima");
  const temp = data.main?.temp ?? 0;
  const humidity = data.main?.humidity ?? 0;
  const windSpeed = data.wind?.speed ?? 0;
  const main = (data.weather?.[0]?.main || "").toLowerCase();
  const lluviaInfo = calcularProbabilidadLluvia(pronostico);
  
  // Activar efectos climáticos con todos los parámetros
  activarEfectosClimaticos(humidity, main, lluviaInfo.probabilidad, temp, windSpeed);

  // Generar consejo detallado
  const consejoDetallado = generarConsejoDetallado(data, pronostico);
  
  // Mostrar el consejo destacado
  const consejoCard = document.getElementById("consejoDestacadoCard");
  if (consejoCard) {
    document.getElementById("consejoDestacado").innerHTML = `
      <h3>${consejoDetallado.titulo}</h3>
      <div class="alert alert-warning">
        <strong>${consejoDetallado.mensaje}</strong>
      </div>
      <ol>
        ${consejoDetallado.pasos.map(paso => `<li><strong>"</strong>${paso}<strong>"</strong></li>`).join('')}
      </ol>
    `;
    consejoCard.style.display = 'block';
  }

  // Generar cards dinámicas
  let cardsHTML = '<div class="alertas-grid">';
  let hasAlerts = false;

  // Card 1: Lluvia
  if (main.includes("rain") || main.includes("thunderstorm") || lluviaInfo.probabilidad > 50) {
    hasAlerts = true;
    cardsHTML += `
      <div class="alerta-card lluvia">
        <div class="alerta-card-icon">🌧️</div>
        <div class="alerta-card-title">Lluvia</div>
        <div class="alerta-card-value">${lluviaInfo.probabilidad}%</div>
        <div class="alerta-card-desc">Probabilidad en 24h</div>
        ${lluviaInfo.cantidad > 0 ? `<div class="alerta-card-badge">${lluviaInfo.cantidad}mm esperados</div>` : ''}
      </div>
    `;
  }

  // Card 2: Humedad
  if (humidity > 70) {
    hasAlerts = true;
    const humedadStatus = humidity > 85 ? 'Muy Alta' : 'Alta';
    const humedadClass = humidity > 85 ? 'humedad' : 'humedad';
    cardsHTML += `
      <div class="alerta-card ${humedadClass}">
        <div class="alerta-card-icon">💧</div>
        <div class="alerta-card-title">Humedad</div>
        <div class="alerta-card-value">${humidity}%</div>
        <div class="alerta-card-desc">${humedadStatus} - Riesgo de hongos</div>
        <div class="alerta-card-badge">Ventila tus cultivos</div>
      </div>
    `;
  }

  // Card 3: Temperatura (Calor)
  if (temp > 30) {
    hasAlerts = true;
    const tempStatus = temp > 35 ? 'Extremo' : temp > 32 ? 'Muy Alto' : 'Alto';
    cardsHTML += `
      <div class="alerta-card calor">
        <div class="alerta-card-icon">🔥</div>
        <div class="alerta-card-title">Calor ${tempStatus}</div>
        <div class="alerta-card-value">${Math.round(temp)}°C</div>
        <div class="alerta-card-desc">Aumenta el riego</div>
        <div class="alerta-card-badge">Protege del sol</div>
      </div>
    `;
  }

  // Card 4: Frío/Helada
  if (temp < 10) {
    hasAlerts = true;
    const frioStatus = temp < 5 ? 'Helada' : 'Frío';
    const frioIcon = temp < 5 ? '❄️' : '🧊';
    cardsHTML += `
      <div class="alerta-card frio">
        <div class="alerta-card-icon">${frioIcon}</div>
        <div class="alerta-card-title">${frioStatus}</div>
        <div class="alerta-card-value">${Math.round(temp)}°C</div>
        <div class="alerta-card-desc">Protege plantas sensibles</div>
        <div class="alerta-card-badge">Cubre con paja/ichu</div>
      </div>
    `;
  }

  // Card 5: Viento
  if (windSpeed > 8) {
    hasAlerts = true;
    const windKmh = (windSpeed * 3.6).toFixed(0);
    const windStatus = windSpeed > 12 ? 'Muy Fuerte' : 'Fuerte';
    cardsHTML += `
      <div class="alerta-card viento">
        <div class="alerta-card-icon">💨</div>
        <div class="alerta-card-title">Viento ${windStatus}</div>
        <div class="alerta-card-value">${windKmh} km/h</div>
        <div class="alerta-card-desc">Asegura estructuras</div>
        <div class="alerta-card-badge">Planta cercos vivos</div>
      </div>
    `;
  }

  // Verificar temperaturas extremas próximas
  const tempMaxProxima = Math.max(...pronostico.list.slice(0, 16).map(item => item.main.temp_max));
  const tempMinProxima = Math.min(...pronostico.list.slice(0, 16).map(item => item.main.temp_min));
  
  if (tempMaxProxima > 35 && temp <= 35) {
    hasAlerts = true;
    cardsHTML += `
      <div class="alerta-card calor">
        <div class="alerta-card-icon">🌡️</div>
        <div class="alerta-card-title">Ola de Calor</div>
        <div class="alerta-card-value">${Math.round(tempMaxProxima)}°C</div>
        <div class="alerta-card-desc">Próximamente</div>
        <div class="alerta-card-badge">Prepara más agua</div>
      </div>
    `;
  }
  
  if (tempMinProxima < 3 && temp >= 3) {
    hasAlerts = true;
    cardsHTML += `
      <div class="alerta-card frio">
        <div class="alerta-card-icon">🧊</div>
        <div class="alerta-card-title">Helada Próxima</div>
        <div class="alerta-card-value">${Math.round(tempMinProxima)}°C</div>
        <div class="alerta-card-desc">En los próximos días</div>
        <div class="alerta-card-badge">Alerta temprana</div>
      </div>
    `;
  }

  // Si no hay alertas, mostrar condiciones favorables
  if (!hasAlerts) {
    cardsHTML += `
      <div class="alerta-card favorable">
        <div class="alerta-card-icon">✅</div>
        <div class="alerta-card-title">Condiciones</div>
        <div class="alerta-card-value">Favorables</div>
        <div class="alerta-card-desc">Buen día para trabajar</div>
        <div class="alerta-card-badge">Aprovecha el clima</div>
      </div>
    `;
  }

  cardsHTML += '</div>';
  
  alertas.innerHTML = cardsHTML;
  alertas.classList.remove("d-none");
}// === Calendario Inca ===
const calendarioInca = [
  { mes: "Camay Quilla", desc: "Mes de la creación y ritos de purificación." },
  { mes: "Hatun Poqoy", desc: "Mes de las grandes maduraciones." },
  { mes: "Pacha Poqoy", desc: "Mes de la maduración de la tierra." },
  { mes: "Aymuray", desc: "Mes de cosecha y agradecimiento a la Pachamama." },
  { mes: "Inti Raymi", desc: "Fiesta del Sol, cosecha principal." },
  { mes: "Chacra Conacuy", desc: "Época de descanso de la tierra." },
  { mes: "Chacra Yapuy", desc: "Preparación de la tierra para sembrar." },
  { mes: "Coyaraymi", desc: "Fiesta de la luna." },
  { mes: "Unu Raymi killa", desc: "Ritos al agua y limpieza de acequias." },
  { mes: "Aya Marcay", desc: "Mes de los difuntos y ancestros." },
  { mes: "Qhapaq Raymi", desc: "Mes de las ceremonias principales." },
  { mes: "Capac Inti Raymi", desc: "Gran fiesta del Sol." }
];

const mesesGreg = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

let fecha = new Date();
let mesActual = fecha.getMonth();

function mostrarMes(index = mesActual) {
  document.getElementById("mesInca").innerText = calendarioInca[index].mes;
  document.getElementById("descMes").innerText = calendarioInca[index].desc;
  document.getElementById("mesGreg").innerText = `Mes gregoriano: ${mesesGreg[index]}`;
}
mostrarMes();

// === Consejos Pachamama por Clima ===
const consejosPorClima = {
  lluvia: [
    "🌧️ ¡El cielo se abrirá sin avisar! Protege lo que has cosechado.",
    "💧 La Pachamama envía agua. Cubre tus frutos con plástico para mantenerlos secos.",
    "☔ Tiempo de lluvia: Asegura tus cultivos y revisa los canales de drenaje."
  ],
  tormenta: [
    "⚡ ¡Tormenta en camino! Refuerza las estructuras y protege tus animales.",
    "🌩️ La furia del cielo se acerca. Busca refugio y asegura tus herramientas."
  ],
  soleado: [
    "☀️ El Inti brilla con fuerza. Aprovecha para secar granos y semillas.",
    "🌞 Día perfecto para cosechar. El sol bendice tu trabajo."
  ],
  nublado: [
    "☁️ Día tranquilo bajo las nubes. Buen momento para planificar y preparar.",
    "🌥️ Las nubes protegen del sol fuerte. Trabaja sin prisa."
  ],
  frio: [
    "❄️ El frío llega. Protege tus plantas jóvenes con coberturas.",
    "🥶 Heladas posibles. Cubre tus cultivos sensibles antes del anochecer."
  ],
  viento: [
    "💨 Vientos fuertes se acercan. Asegura tus estructuras y plantas altas.",
    "🌬️ El viento puede dañar flores y frutos. Protege lo más delicado."
  ],
  calor: [
    "🔥 Calor intenso. Riega abundantemente al atardecer.",
    "🌡️ Temperatura alta: Tus plantas necesitan más agua. Revisa el suelo."
  ],
  humedo: [
    "💧 Alta humedad. Vigila hongos y plagas en tus cultivos.",
    "🌫️ Ambiente húmedo: Ventila bien tus plantas para evitar enfermedades."
  ],
  lluvia_probable: [
    "🌧️ Se acerca la lluvia. Prepara coberturas para tus cultivos delicados.",
    "💧 Lluvias próximas: Revisa que tus canales de drenaje estén limpios."
  ]
};

function generarConsejoPachamama(climaActual, pronostico = null) {
  const desc = (climaActual.weather?.[0]?.main || "").toLowerCase();
  const temp = climaActual.main?.temp || 0;
  const humidity = climaActual.main?.humidity || 0;
  const windSpeed = climaActual.wind?.speed || 0;
  
  let lluviaProxima = false;
  if (pronostico && pronostico.list) {
    lluviaProxima = pronostico.list.slice(0, 8).some(item => {
      const main = (item.weather?.[0]?.main || "").toLowerCase();
      return main.includes("rain") || main.includes("drizzle");
    });
  }
  
  let categoria = "nublado";
  
  if (desc.includes("thunderstorm")) categoria = "tormenta";
  else if (desc.includes("rain") || desc.includes("drizzle")) categoria = "lluvia";
  else if (desc.includes("snow")) categoria = "frio";
  else if (lluviaProxima) categoria = "lluvia_probable";
  else if (temp < 10) categoria = "frio";
  else if (temp > 30) categoria = "calor";
  else if (windSpeed > 8) categoria = "viento";
  else if (humidity > 80) categoria = "humedo";
  else if (desc.includes("clear")) categoria = "soleado";
  else if (desc.includes("cloud")) categoria = "nublado";
  
  const consejos = consejosPorClima[categoria] || consejosPorClima.nublado;
  const random = Math.floor(Math.random() * consejos.length);
  
  return consejos[random];
}

window.darConsejo = function () {
  const consejo = document.getElementById("consejo");
  if (window.ultimoClima && window.ultimoPronostico) {
    consejo.innerText = generarConsejoPachamama(window.ultimoClima, window.ultimoPronostico);
  } else if (window.ultimoClima) {
    consejo.innerText = generarConsejoPachamama(window.ultimoClima);
  } else {
    const consejoGeneral = [
      "Amigo agricultor, siembra con gratitud y cosecharás abundancia.",
      "Riega tus plantas al amanecer, la Pachamama bendecirá tus cultivos.",
      "Respeta la tierra y ella te devolverá vida."
    ];
    const random = Math.floor(Math.random() * consejoGeneral.length);
    consejo.innerText = consejoGeneral[random];
  }
};

// === API Clima ===
const apiKey = "a09e64f2fef539a2ba0df7d7fa3adbb1";
const skycons = new Skycons({ color: "#2e7d32" });
let currentIcon = null;

function setSkyconByWeather(data) {
  const mainEn = (data.weather?.[0]?.main || "").toLowerCase();
  const iconCode = (data.weather?.[0]?.icon || "");
  const clouds = data.clouds?.all ?? null;
  const isNight = iconCode.includes("n");

  let name = null;
  if (mainEn.includes("thunderstorm")) name = "RAIN";
  else if (mainEn.includes("drizzle")) name = "RAIN";
  else if (mainEn.includes("rain")) name = "RAIN";
  else if (mainEn.includes("snow")) name = "SNOW";
  else if (["mist","fog","haze"].some(k => mainEn.includes(k))) name = "FOG";
  else if (mainEn.includes("clear")) name = isNight ? "CLEAR_NIGHT" : "CLEAR_DAY";
  else if (mainEn.includes("cloud")) {
    name = (clouds !== null && clouds < 60)
      ? (isNight ? "PARTLY_CLOUDY_NIGHT" : "PARTLY_CLOUDY_DAY")
      : "CLOUDY";
  }

  if (!name) name = isNight ? "PARTLY_CLOUDY_NIGHT" : "PARTLY_CLOUDY_DAY";

  const canvas = document.getElementById("skycon");
  if (!canvas) return;

  canvas.classList.remove("d-none");
  if (currentIcon) skycons.remove(canvas);

  skycons.set(canvas, Skycons[name] || Skycons.CLOUDY);
  skycons.play();
  currentIcon = name;
}

function calcularFaseLunar() {
  const date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  
  let c = 0, e = 0, jd = 0, b = 0;
  
  if (month < 3) {
    year--;
    month += 12;
  }
  
  ++month;
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  b = parseInt(jd);
  jd -= b;
  b = Math.round(jd * 8);
  
  if (b >= 8) b = 0;
  
  const fases = [
    { emoji: "🌑", nombre: "Luna Nueva" },
    { emoji: "🌒", nombre: "Creciente" },
    { emoji: "🌓", nombre: "Cuarto Creciente" },
    { emoji: "🌔", nombre: "Gibosa Creciente" },
    { emoji: "🌕", nombre: "Luna Llena" },
    { emoji: "🌖", nombre: "Gibosa Menguante" },
    { emoji: "🌗", nombre: "Cuarto Menguante" },
    { emoji: "🌘", nombre: "Menguante" }
  ];
  
  return fases[b];
}

function calcularProbabilidadLluvia(pronostico) {
  const proximas24h = pronostico.list.slice(0, 8);
  let totalLluvia = 0;
  let countLluvia = 0;
  
  proximas24h.forEach(item => {
    const main = (item.weather?.[0]?.main || "").toLowerCase();
    if (main.includes("rain") || main.includes("drizzle")) {
      countLluvia++;
      if (item.rain && item.rain['3h']) {
        totalLluvia += item.rain['3h'];
      }
    }
  });
  
  const probabilidad = Math.round((countLluvia / proximas24h.length) * 100);
  return { probabilidad, cantidad: totalLluvia.toFixed(1) };
}

function mostrarDetallesClima(data, pronostico) {
  const temp = Math.round(data.main?.temp ?? 0);
  const feelsLike = Math.round(data.main?.feels_like ?? 0);
  const humidity = data.main?.humidity ?? 0;
  const pressure = data.main?.pressure ?? 0;
  const windSpeed = ((data.wind?.speed ?? 0) * 3.6).toFixed(1);
  const visibility = ((data.visibility ?? 0) / 1000).toFixed(1);
  const desc = data.weather?.[0]?.description || "Clima";
  
  const hora = new Date().getHours();
  const clouds = data.clouds?.all ?? 0;
  let uvEstimado = 0;
  
  if (hora >= 10 && hora <= 16) {
    uvEstimado = Math.max(0, 11 - (clouds / 10)) * (1 - Math.abs(hora - 13) / 6);
  }
  
  let uvColor = "#4caf50", uvEmoji = "🟢", uvText = "Bajo";
  if (uvEstimado > 2) { uvColor = "#ffeb3b"; uvEmoji = "🟡"; uvText = "Moderado"; }
  if (uvEstimado > 5) { uvColor = "#ff9800"; uvEmoji = "🟠"; uvText = "Alto"; }
  if (uvEstimado > 7) { uvColor = "#f44336"; uvEmoji = "🔴"; uvText = "Muy Alto"; }

  document.getElementById("climaTemp").innerHTML = `
    <div class="display-4 fw-bold">${temp}°C</div>
    <div class="text-muted">${desc}</div>
  `;

  document.getElementById("climaDetalles").innerHTML = `
    <div class="d-flex justify-content-between mb-2">
      <span>🌡️ Sensación:</span>
      <strong>${feelsLike}°C</strong>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span>💧 Humedad:</span>
      <strong>${humidity}%</strong>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span>💨 Viento:</span>
      <strong>${windSpeed} km/h</strong>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span>🔽 Presión:</span>
      <strong>${pressure} hPa</strong>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span>👁️ Visibilidad:</span>
      <strong>${visibility} km</strong>
    </div>
    <div class="d-flex justify-content-between">
      <span>${uvEmoji} UV Estimado:</span>
      <strong style="color: ${uvColor}">${uvEstimado.toFixed(1)} (${uvText})</strong>
    </div>
  `;

  mostrarAlertas(data, pronostico);
  mostrarDatosExtra(data, pronostico);
}

function mostrarDatosExtra(data, pronostico) {
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  const faseLunar = calcularFaseLunar();
  const lluviaInfo = calcularProbabilidadLluvia(pronostico);

  document.getElementById("datosExtra").innerHTML = `
    <h5 class="mb-3">🌅 Datos Astronómicos y Pronóstico</h5>
    <div class="row text-center g-3">
      <div class="col-6 col-md-3">
        <div class="p-3 bg-light rounded">
          <div class="fs-4">🌅</div>
          <div class="small text-muted">Amanecer</div>
          <div class="fw-bold">${sunrise}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 bg-light rounded">
          <div class="fs-4">🌇</div>
          <div class="small text-muted">Atardecer</div>
          <div class="fw-bold">${sunset}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 bg-light rounded">
          <div class="fs-4">${faseLunar.emoji}</div>
          <div class="small text-muted">Fase Lunar</div>
          <div class="fw-bold small">${faseLunar.nombre}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 bg-light rounded">
          <div class="fs-4">💧</div>
          <div class="small text-muted">Prob. Lluvia 24h</div>
          <div class="fw-bold">${lluviaInfo.probabilidad}%</div>
          ${lluviaInfo.cantidad > 0 ? `<small class="text-info">${lluviaInfo.cantidad}mm</small>` : ''}
        </div>
      </div>
    </div>
  `;
  document.getElementById("datosExtra").classList.remove("d-none");
}

function activarEfectosClimaticos(humidity, condicion, probLluvia, temp, windSpeed) {
  let contenedor = document.getElementById("weatherEffects");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "weatherEffects";
    contenedor.className = "weather-effects";
    document.body.appendChild(contenedor);
  }
  contenedor.innerHTML = "";

  document.querySelectorAll(".card").forEach(card => {
    card.classList.remove("high-humidity-pulse");
  });

  if (temp < 5 && !condicion.includes("rain")) {
    const copos = ['❄', '❅', '❆'];
    for (let i = 0; i < 30; i++) {
      const copo = document.createElement("div");
      copo.className = "snowflake";
      copo.textContent = copos[Math.floor(Math.random() * copos.length)];
      copo.style.left = `${Math.random() * 100}%`;
      copo.style.fontSize = `${1 + Math.random() * 1.5}rem`;
      copo.style.animationDuration = `${3 + Math.random() * 4}s`;
      copo.style.animationDelay = `${Math.random() * 3}s`;
      contenedor.appendChild(copo);
    }
  }
  else if (humidity > 80 && !condicion.includes("rain")) {
    for (let i = 0; i < 3; i++) {
      const fogLayer = document.createElement("div");
      fogLayer.className = "fog-layer";
      contenedor.appendChild(fogLayer);
    }

    const overlay = document.createElement("div");
    overlay.className = "humidity-overlay";
    contenedor.appendChild(overlay);

    document.querySelectorAll(".card").forEach(card => {
      card.classList.add("high-humidity-pulse");
    });
  }
  else if (condicion.includes("rain") || probLluvia > 70) {
    const numGotas = probLluvia > 90 ? 50 : 30;
    
    for (let i = 0; i < numGotas; i++) {
      const gota = document.createElement("div");
      gota.className = "raindrop";
      gota.style.left = `${Math.random() * 100}%`;
      gota.style.animationDuration = `${0.5 + Math.random() * 1}s`;
      gota.style.animationDelay = `${Math.random() * 2}s`;
      contenedor.appendChild(gota);
    }

    if (condicion.includes("thunderstorm")) {
      setInterval(() => {
        if (Math.random() > 0.7) {
          const rayo = document.createElement("div");
          rayo.className = "lightning";
          contenedor.appendChild(rayo);
          setTimeout(() => rayo.remove(), 300);
        }
      }, 3000);
    }
  }
  else if (windSpeed > 8) {
    const hojas = ['🍂', '🍃', '🌿'];
    for (let i = 0; i < 15; i++) {
      const hoja = document.createElement("div");
      hoja.className = "leaf";
      hoja.textContent = hojas[Math.floor(Math.random() * hojas.length)];
      hoja.style.top = `${Math.random() * 100}%`;
      hoja.style.animationDuration = `${3 + Math.random() * 3}s`;
      hoja.style.animationDelay = `${Math.random() * 2}s`;
      contenedor.appendChild(hoja);
    }
  }
  else if (condicion.includes("clear") && temp > 20) {
    for (let i = 0; i < 8; i++) {
      const rayo = document.createElement("div");
      rayo.className = "sun-ray";
      rayo.style.left = `${10 + i * 12}%`;
      rayo.style.animationDelay = `${i * 0.5}s`;
      contenedor.appendChild(rayo);
    }
  }
  else if (humidity >= 70 && humidity <= 80 && !condicion.includes("rain")) {
    for (let i = 0; i < 20; i++) {
      const particula = document.createElement("div");
      particula.className = "humidity-particle";
      particula.style.left = `${Math.random() * 100}%`;
      particula.style.animationDuration = `${8 + Math.random() * 6}s`;
      particula.style.animationDelay = `${Math.random() * 5}s`;
      contenedor.appendChild(particula);
    }
  }
}

window.limpiarAnimaciones = function() {
  const contenedor = document.getElementById("weatherEffects");
  if (contenedor) {
    contenedor.innerHTML = "";
  }
  document.querySelectorAll(".card").forEach(card => {
    card.classList.remove("high-humidity-pulse");
  });
};

function generarConsejoDetallado(clima, pronostico) {
  const temp = clima.main?.temp || 0;
  const humidity = clima.main?.humidity || 0;
  const windSpeed = clima.wind?.speed || 0;
  const main = (clima.weather?.[0]?.main || "").toLowerCase();
  const lluviaInfo = calcularProbabilidadLluvia(pronostico);

  let titulo = "";
  let mensaje = "";
  let pasos = [];

  if (temp < 5) {
    titulo = "🧊 Cuando Anuncie Helada";
    mensaje = "¡Atención, hijos! Se viene una helada para vuestros cultivos.";
    pasos = [
      'Debes encender pequeñas fogatas para hacer humo. Es el método más popular y el que más me gusta. Ese calor directo y el manto de humo son como una manta para mis plantas tiernas.',
      'Si la helada se acerca, riega con aspersión antes del frío. Esa humedad las protege como un escudo de hielo, pero usa solo el agua necesaria.',
      'No olvides el poder de mis propias fibras: cubre a tus plantas con paja o ichu. Es el abrigo natural más efectivo que tengo para ofrecerte.'
    ];
  }
  else if (main.includes("thunderstorm")) {
    titulo = "⚡ Cuando Anuncie Granizo";
    mensaje = "¡Alerta! Hijo(a) agricultor(a) prepárate para el granizo.";
    pasos = [
      'Mi consejo principal es el techado rústico. Una cubierta simple pero fuerte detendrá el granizo.',
      'Siembra plantas barrera. Ellas son como mis escudos vivos. Recuerda, ¡nunca te quedes sin protección!',
      'También puedes usar tejidos o mallas si están a tu alcance. Son un buen resguardo cuando el granizo es fuerte.'
    ];
  }
  else if (windSpeed > 8) {
    titulo = "💨 Cuando Anuncie Fuertes Vientos";
    mensaje = "Hijo(a) agricultor(a) ¡Prepárate, el viento soplará con fuerza!";
    pasos = [
      'Planta cercos vivos (árboles y arbustos). Son tus mejores guerreros, detienen el viento y me dan vida a mí también. ¡Son la técnica más dominante!',
      'Usa barreras de piedra. Son sólidas y permanentes, un muro protector muy eficaz.',
      'A las plantas más jóvenes o débiles, sujétalas con palos. Dales apoyo hasta que crezcan fuertes y resistan por sí mismas.'
    ];
  }
  else if (humidity < 40 && lluviaInfo.probabilidad < 20) {
    titulo = "☀️ Cuando Anuncie Falta de Lluvia / Sequía";
    mensaje = "¡Mi sed es grande! Cuidemos hasta la última gota de mi sangre.";
    pasos = [
      'Honra a tus abuelos y usa los canales tradicionales. Ellos saben cómo llevar agua a cada rincón de la tierra. Es el método más usado.',
      'Aprende también las nuevas formas: implementa el riego por aspersión o goteo. Así me ayudas a no desperdiciar ni una sola gota.',
      'Crea qochas o reservorios. Haz que mi agua descanse y esté lista para cuando más la necesites. ¡Guarda el agua!'
    ];
  }
  else if (main.includes("rain") || lluviaInfo.probabilidad > 70) {
    titulo = "🌧️ Cuando Anuncie Lluvias Inesperadas";
    mensaje = "¡El cielo se abrirá sin avisar! Protege lo que has cosechado.";
    pasos = [
      'Una vez que recojas mis frutos, la opción más usada es cubrirlos con plástico. Protégelos de inmediato para mantenerlos secos.',
      'Construye canales de desvío de agua. Ayúdame a que el exceso de agua siga su camino y no arruine tus áreas de trabajo o cosecha.',
      'Puedes usar techos rústicos para almacenar, pero recuerda que las primeras dos opciones son más populares y rápidas de implementar en el campo.'
    ];
  }
  else if (humidity > 80) {
    titulo = "💧 Cuando Hay Alta Humedad";
    mensaje = "La humedad está muy alta, hijo(a). Cuida tus plantas del moho y los hongos.";
    pasos = [
      'Ventila bien tus cultivos. El aire debe circular para que la humedad no se quede atrapada.',
      'Revisa diariamente las hojas por manchas o signos de hongos. La prevención es tu mejor arma.',
      'Reduce el riego. Con tanta humedad en el aire, la tierra no necesita más agua.'
    ];
  }
  else {
    titulo = "🌱 Condiciones Favorables";
    mensaje = "Hijo(a), hoy es un buen día para trabajar en la chacra.";
    pasos = [
      'Aprovecha este clima para sembrar o cosechar con tranquilidad.',
      'Revisa tus cultivos y planifica el trabajo de los próximos días.',
      'Agradece a la Pachamama por este día perfecto y trabaja con amor.'
    ];
  }

  return { titulo, mensaje, pasos };
}

function mostrarAlertas(data, pronostico) {
  const alertas = document.getElementById("alertasClima");
  const temp = data.main?.temp ?? 0;
  const humidity = data.main?.humidity ?? 0;
  const windSpeed = data.wind?.speed ?? 0;
  const main = (data.weather?.[0]?.main || "").toLowerCase();
  const lluviaInfo = calcularProbabilidadLluvia(pronostico);
  
  let alertasHTML = "";

  activarEfectosClimaticos(humidity, main, lluviaInfo.probabilidad, temp, windSpeed);

  const consejoDetallado = generarConsejoDetallado(data, pronostico);
  
  const consejoCard = document.getElementById("consejoDestacadoCard");
  if (consejoCard) {
    document.getElementById("consejoDestacado").innerHTML = `
      <h3>${consejoDetallado.titulo}</h3>
      <div class="alert alert-warning">
        <strong>${consejoDetallado.mensaje}</strong>
      </div>
      <ol>
        ${consejoDetallado.pasos.map(paso => `<li><strong>"</strong>${paso}<strong>"</strong></li>`).join('')}
      </ol>
    `;
    consejoCard.style.display = 'block';
  }

  if (main.includes("rain") || main.includes("thunderstorm") || lluviaInfo.probabilidad > 50) {
    alertasHTML += `
      <div class="alert alert-warning mb-2">
        <strong>⚠️ Alerta de Lluvia:</strong> ${lluviaInfo.probabilidad}% probabilidad en las próximas 24h. Protege tus cultivos.
        ${lluviaInfo.cantidad > 0 ? `<br><small>Precipitación esperada: ${lluviaInfo.cantidad}mm</small>` : ''}
      </div>
    `;
  }

  if (temp > 32) {
    alertasHTML += `
      <div class="alert alert-danger mb-2">
        <strong>🔥 Alerta de Calor:</strong> Temperatura muy alta (${Math.round(temp)}°C). Aumenta el riego.
      </div>
    `;
  }

  if (temp < 5) {
    alertasHTML += `
      <div class="alert alert-info mb-2">
        <strong>❄️ Alerta de Frío:</strong> Posible helada (${Math.round(temp)}°C). Protege plantas sensibles.
      </div>
    `;
  }

  if (windSpeed > 10) {
    alertasHTML += `
      <div class="alert alert-warning mb-2">
        <strong>💨 Alerta de Viento:</strong> Vientos fuertes (${(windSpeed * 3.6).toFixed(0)} km/h). Asegura estructuras.
      </div>
    `;
  }

  if (humidity > 85) {
    alertasHTML += `
      <div class="alert alert-info mb-2">
        <strong>💧 Alta Humedad:</strong> ${humidity}% - Riesgo de hongos. Vigila tus cultivos.
      </div>
    `;
  }

  const tempMaxProxima = Math.max(...pronostico.list.slice(0, 16).map(item => item.main.temp_max));
  const tempMinProxima = Math.min(...pronostico.list.slice(0, 16).map(item => item.main.temp_min));
  
  if (tempMaxProxima > 35) {
    alertasHTML += `
      <div class="alert alert-danger mb-2">
        <strong>🔥 Ola de Calor:</strong> Temperaturas hasta ${Math.round(tempMaxProxima)}°C próximamente.
      </div>
    `;
  }
  
  if (tempMinProxima < 3) {
    alertasHTML += `
      <div class="alert alert-info mb-2">
        <strong>❄️ Helada Próxima:</strong> Temperatura mínima de ${Math.round(tempMinProxima)}°C en los próximos días.
      </div>
    `;
  }

  if (alertasHTML) {
    alertas.innerHTML = alertasHTML;
    alertas.classList.remove("d-none");
  } else {
    alertas.innerHTML = `
      <div class="alert alert-success">
        <strong>✅ Condiciones Favorables:</strong> Buen día para trabajar en el campo.
      </div>
    `;
    alertas.classList.remove("d-none");
  }
}

function obtenerPronostico(pronostico) {
  const container = document.getElementById("pronosticoExtendido");
  let html = "<h5 class='mb-3'>📅 Pronóstico 5 días</h5><div class='row g-2'>";
  
  const diasUnicos = {};
  
  pronostico.list.forEach(item => {
    const fecha = new Date(item.dt * 1000);
    const diaKey = fecha.toLocaleDateString('es');
    
    if (!diasUnicos[diaKey]) {
      diasUnicos[diaKey] = {
        fecha: fecha,
        temps: [],
        weather: item.weather[0],
        lluvia: false
      };
    }
    
    diasUnicos[diaKey].temps.push(item.main.temp);
    
    const main = (item.weather?.[0]?.main || "").toLowerCase();
    if (main.includes("rain") || main.includes("drizzle")) {
      diasUnicos[diaKey].lluvia = true;
    }
  });
  
  const dias = Object.values(diasUnicos).slice(0, 5);
  
  dias.forEach((dia, index) => {
    const diaTexto = index === 0 ? "Hoy" : dia.fecha.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
    const tempMax = Math.round(Math.max(...dia.temps));
    const tempMin = Math.round(Math.min(...dia.temps));
    const desc = dia.weather.description;
    const icon = dia.weather.icon;
    
    html += `
      <div class="col-6 col-md-4 col-lg">
        <div class="card text-center p-2 h-100">
          <small class="text-muted fw-bold">${diaTexto}</small>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" class="mx-auto" style="width:60px">
          <div>
            <strong class="text-danger">${tempMax}°</strong>
            <span class="text-muted"> / ${tempMin}°</span>
          </div>
          <small class="text-muted">${desc}</small>
          ${dia.lluvia ? '<small class="text-info">💧 Lluvia</small>' : ''}
        </div>
      </div>
    `;
  });
  
  html += "</div>";
  container.innerHTML = html;
  container.classList.remove("d-none");
}

window.obtenerClima = function () {
  const ciudad = (document.getElementById("ciudad")?.value || "").trim();
  const canvas = document.getElementById("skycon");

  if (!ciudad) {
    document.getElementById("climaTemp").innerHTML = '<p class="text-muted">Ingresa una ciudad</p>';
    document.getElementById("climaDetalles").innerHTML = "";
    document.getElementById("alertasClima").classList.add("d-none");
    document.getElementById("pronosticoExtendido").classList.add("d-none");
    document.getElementById("datosExtra").classList.add("d-none");
    const consejoCard = document.getElementById("consejoDestacadoCard");
    if (consejoCard) consejoCard.style.display = 'none';
    canvas?.classList.add("d-none");
    return;
  }

  document.getElementById("climaTemp").innerHTML = '<div class="spinner-border text-success" role="status"><span class="visually-hidden">Cargando...</span></div>';

  console.log("🔍 Buscando clima para:", ciudad);
  console.log("🔑 API Key (primeros 8 chars):", apiKey.substring(0, 8) + "...");

  const currentWeatherPromise = fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${apiKey}&units=metric&lang=es`)
    .then(res => {
      console.log("📡 Respuesta Clima Actual - Status:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("✅ Datos Clima Actual:", data);
      if (String(data.cod) === "401") {
        throw new Error("API Key inválida o no activada");
      }
      if (String(data.cod) === "404") {
        throw new Error("Ciudad no encontrada");
      }
      if (String(data.cod) !== "200") {
        throw new Error(`Error API: ${data.message || 'Desconocido'}`);
      }
      return data;
    });

  const forecastPromise = fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(ciudad)}&appid=${apiKey}&units=metric&lang=es`)
    .then(res => {
      console.log("📡 Respuesta Pronóstico - Status:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("✅ Datos Pronóstico:", data);
      if (String(data.cod) === "401") {
        throw new Error("API Key inválida para pronóstico");
      }
      if (String(data.cod) === "404") {
        throw new Error("Ciudad no encontrada en pronóstico");
      }
      if (String(data.cod) !== "200") {
        throw new Error(`Error API Pronóstico: ${data.message || 'Desconocido'}`);
      }
      return data;
    });

  Promise.all([currentWeatherPromise, forecastPromise])
    .then(([currentData, forecastData]) => {
      console.log("✅ Todo OK, mostrando datos");
      
      window.ultimoClima = currentData;
      window.ultimoPronostico = forecastData;
      
      mostrarDetallesClima(currentData, forecastData);
      setSkyconByWeather(currentData);
      obtenerPronostico(forecastData);
      
      document.getElementById("consejo").innerText = generarConsejoPachamama(currentData, forecastData);
    })
    .catch(err => {
      console.error("❌ ERROR COMPLETO:", err);
      
      let mensajeError = "Error al obtener el clima";
      
      if (err.message.includes("API Key")) {
        mensajeError = "⚠️ API Key inválida o no activada. Espera hasta 2 horas después de crearla.";
      } else if (err.message.includes("Ciudad no encontrada")) {
        mensajeError = "❌ Ciudad no encontrada. Intenta con: NombreCiudad,PE";
      } else if (err.message.includes("Failed to fetch")) {
        mensajeError = "🌐 Error de conexión. Revisa tu internet.";
      } else {
        mensajeError = `❌ ${err.message}`;
      }
      
      document.getElementById("climaTemp").innerHTML = `<p class="text-danger small">${mensajeError}</p>`;
      canvas?.classList.add("d-none");
    });
};