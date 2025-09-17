// === Calendario Inca ===
const calendarioInca = [
  { mes: "Camay Quilla", desc: "Mes de la creación y ritos de purificación." }, // Enero
  { mes: "Hatun Poqoy", desc: "Mes de las grandes maduraciones." },             // Febrero
  { mes: "Pacha Poqoy", desc: "Mes de la maduración de la tierra." },           // Marzo
  { mes: "Aymuray", desc: "Mes de cosecha y agradecimiento a la Pachamama." },  // Abril
  { mes: "Inti Raymi", desc: "Fiesta del Sol, cosecha principal." },            // Mayo
  { mes: "Chacra Conacuy", desc: "Época de descanso de la tierra." },           // Junio
  { mes: "Chacra Yapuy", desc: "Preparación de la tierra para sembrar." },      // Julio
  { mes: "Coyaraymi", desc: "Fiesta de la luna." },                             // Agosto
  { mes: "Unu Raymi killa", desc: "Ritos al agua y limpieza de acequias." },          // Septiembre
  { mes: "Aya Marcay", desc: "Mes de los difuntos y ancestros." },              // Octubre
  { mes: "Qhapaq Raymi", desc: "Mes de las ceremonias principales." },          // Noviembre
  { mes: "Capac Inti Raymi", desc: "Gran fiesta del Sol." }                     // Diciembre
];

const mesesGreg = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

let fecha = new Date();
let mesActual = fecha.getMonth(); // 0 = enero, 1 = febrero, etc.

function mostrarMes(index = mesActual) {
  document.getElementById("mesInca").innerText = calendarioInca[index].mes;
  document.getElementById("descMes").innerText = calendarioInca[index].desc;
  document.getElementById("mesGreg").innerText = `Mes gregoriano: ${mesesGreg[index]}`;
}
mostrarMes();

// === Consejos Pachamama ===
const consejos = [
  "Amigo agricultor, siembra con gratitud y cosecharás abundancia.",
  "Riega tus plantas al amanecer, la Pachamama bendecirá tus cultivos.",
  "Respeta la tierra y ella te devolverá vida.",
  "Hoy es buen día para agradecer al sol y la lluvia.",
  "En Aymuray, prepara la tierra con gratitud; en Inti Raymi, agradece al sol con alegría.",
  "Cada mes del calendario inca trae un mensaje: escucha la voz de tus ancestros.",
  "En Ccatac, la cosecha es abundancia; comparte con tu comunidad.",
  "En Kapak Raymi, celebra la vida y guarda semillas para el próximo ciclo.",
  "Así como el calendario inca honra la luna y el sol, honra tú tus cultivos con paciencia."
];

window.darConsejo = function () {
  const random = Math.floor(Math.random() * consejos.length);
  document.getElementById("consejo").innerText = consejos[random];
};

// === API Clima + Animación ===
const apiKey = "a09e64f2fef539a2ba0df7d7fa3adbb1"; // tu API key de OpenWeatherMap

// Skycons (iconos animados)
const skycons = new Skycons({ color: "#2e7d32" });
let currentIcon = null;

// Skycons (iconos animados) — ya los tienes arriba
// const skycons = new Skycons({ color: "#2e7d32" });
// let currentIcon = null;

function setSkyconByWeather(data) {
  const mainEn   = (data.weather?.[0]?.main || "").toLowerCase();   // "clouds", "rain", ...
  const descEs   = (data.weather?.[0]?.description || "").toLowerCase(); // "muy nuboso", ...
  const iconCode = (data.weather?.[0]?.icon || "");                 // "10d", "01n"...
  const clouds   = data.clouds?.all ?? null;                         // 0..100
  const isNight  = iconCode.includes("n");

  // 1) Mapeo por 'main' (inglés)
  let name = null;
  if (mainEn.includes("thunderstorm")) name = "RAIN";
  else if (mainEn.includes("drizzle")) name = "RAIN";
  else if (mainEn.includes("rain"))    name = "RAIN";
  else if (mainEn.includes("snow"))    name = "SNOW";
  else if (mainEn.includes("sleet"))   name = "SLEET";
  else if (["mist","fog","haze","smoke","dust","sand","ash"].some(k => mainEn.includes(k))) name = "FOG";
  else if (mainEn.includes("squall") || mainEn.includes("tornado")) name = "WIND";
  else if (mainEn.includes("clear"))   name = isNight ? "CLEAR_NIGHT" : "CLEAR_DAY";
  else if (mainEn.includes("cloud")) {
    name = (clouds !== null && clouds < 60)
      ? (isNight ? "PARTLY_CLOUDY_NIGHT" : "PARTLY_CLOUDY_DAY")
      : "CLOUDY";
  }

  // 2) Si no se pudo con 'main', caemos al español (description)
  if (!name) {
    if (/(tormenta|chubasco)/.test(descEs)) name = "RAIN";
    else if (/(llovizna|lluvia)/.test(descEs)) name = "RAIN";
    else if (/nieve/.test(descEs)) name = "SNOW";
    else if (/(niebla|neblina|bruma|humo)/.test(descEs)) name = "FOG";
    else if (/(vendaval|borrasca|tornado|viento)/.test(descEs)) name = "WIND";
    else if (/(despejado|cielo claro|claro)/.test(descEs)) name = isNight ? "CLEAR_NIGHT" : "CLEAR_DAY";
    else if (/(nublado|nuboso|nubes|muy nuboso|parcialmente nublado)/.test(descEs)) {
      name = (clouds !== null && clouds < 60)
        ? (isNight ? "PARTLY_CLOUDY_NIGHT" : "PARTLY_CLOUDY_DAY")
        : "CLOUDY";
    }
  }

  // 3) Último recurso: siempre muestra algo
  if (!name) name = isNight ? "PARTLY_CLOUDY_NIGHT" : "PARTLY_CLOUDY_DAY";

  const canvas = document.getElementById("skycon");
  if (!canvas) return;

  canvas.classList.remove("d-none");
  if (currentIcon) skycons.remove(canvas);

  // Si por alguna razón la constante no existe, caemos a CLOUDY
  skycons.set(canvas, Skycons[name] || Skycons.CLOUDY);
  skycons.play();
  currentIcon = name;
}

window.obtenerClima = function () {
  const ciudad = (document.getElementById("ciudad")?.value || "").trim();
  const out = document.getElementById("clima");
  const canvas = document.getElementById("skycon");
  if (!out) return;

  if (!ciudad) {
    out.textContent = "Por favor ingresa una ciudad";
    canvas?.classList.add("d-none");
    return;
  }

  out.textContent = "Consultando clima…";

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${apiKey}&units=metric&lang=es`)
    .then(res => res.json())
    .then(data => {
      if (String(data.cod) === "404") {
        out.textContent = "Ciudad no encontrada";
        canvas?.classList.add("d-none");
        return;
      }
      const desc = data.weather?.[0]?.description || "Clima";
      const temp = Math.round(data.main?.temp ?? 0);
      out.textContent = `${desc}, ${temp}°C`;

      // pinta la animación (sin más llamadas a la API)
      setSkyconByWeather(data);
    })
    .catch(() => {
      out.textContent = "Error al obtener el clima";
      canvas?.classList.add("d-none");
    });
};
