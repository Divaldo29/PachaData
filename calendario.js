function cambiarMes(delta) {
  mesActual = (mesActual + delta + 12) % 12; // para que rote de 0 a 11
  mostrarMes(mesActual);
}






