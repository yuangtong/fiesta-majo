// Todo el contenido de la invitación vive aquí. Lo usan el front (src/) y las funciones de Vercel (api/).
// Busca "TODO" para ver lo que falta confirmar.
export default {
  evento: {
    marca: 'Huamanga Club',
    edicion: 'Edición 0',
    edicionCorta: '00',
    nombre: 'El cumple de Majo',
    cumpleanera: 'Majo',
    fechaCorta: 'TODO DD.MM',
    fechaLarga: 'TODO Sábado DD de mes',
    hora: '21:00 – late',
    inicioUTC: '20270101T020000Z', // TODO fecha real (hora de Lima + 5 h)
    finUTC: '20270101T110000Z',
    direccion: 'Huamanga 419',
    referencia: 'Magdalena del Mar, Lima · límite con Pueblo Libre', // TODO confirmar
    mapsQuery: 'Huamanga 419, Magdalena del Mar, Lima, Peru',
    urlPublica: 'https://TODO.vercel.app',
  },

  // Escenas 3D de Spline (letras globo cromadas)
  spline: {
    club: 'https://prod.spline.design/nCbIKyw6U5Vr-tyc/scene.splinecode',
    invitado: 'https://prod.spline.design/E7ixEusTl982zmgw/scene.splinecode',
    // TODO: activar cuando la escena se re-exporte con renderer "Both" o "WebGL 2" (hoy es solo WebGPU)
    invitadoActivo: false,
  },

  // Música de fondo (archivo en public/audio/). Vacío = sin música, solo efectos.
  musica: '',

  intro: {
    cta: 'Toca para abrir',
    para: 'Para ti',
    titulo: 'Estás invitado',
    subtitulo: 'a la fiesta más hot del año',
    cta2: 'Ver quién organiza',
  },

  club: {
    presenta: 'presenta',
    lineup: [
      // TODO: quién pone música y a qué hora
      { hora: '21:00', nombre: 'TODO DJ 1' },
      { hora: '23:00', nombre: 'TODO DJ 2' },
      { hora: '01:00', nombre: '+ invitado sorpresa' },
    ],
    nota: 'Primera fiesta organizada por nosotros, con consola propia.',
    cta: 'Toca para saber la temática',
  },

  ruleta: {
    titulo: 'La temática',
    subtitulo: 'Que decida la ruleta',
    cta: 'Girar',
    opciones: [
      { id: 'boda', label: 'Boda', img: 'lifestyle-heels' },
      { id: 'quince', label: 'Quinceañero', img: 'shapes-crown' },
      { id: 'playa', label: 'Playa', img: 'nature-palm-tree' },
      { id: 'pijamada', label: 'Pijamada', img: 'nature-moon' },
      { id: 'graduacion', label: 'Graduación', img: 'lifestyle-book' },
      { id: 'concierto', label: 'Concierto', img: 'lifestyle-guitar' },
      { id: 'turista', label: 'Turista', img: 'lifestyle-globe' },
      { id: 'desfile', label: 'Desfile escolar', img: 'lifestyle-trumpet' },
      { id: 'cumple', label: 'Cumpleaños', img: 'lifestyle-gift' },
    ],
    // Siempre gana esta. Se dibuja con el regalo tachado.
    ganadora: { id: 'incorrecta', label: 'La ocasión incorrecta', img: 'lifestyle-gift' },
  },

  tematica: {
    titulo: 'La ocasión incorrecta',
    texto: 'Ven vestido para cualquier ocasión… menos para un cumpleaños.',
    ejemplos: [
      { label: 'Boda', img: 'lifestyle-heels' },
      { label: 'Playa', img: 'nature-palm-tree' },
      { label: 'Pijamada', img: 'nature-moon' },
      { label: 'Graduación', img: 'lifestyle-book' },
      { label: 'Concierto', img: 'lifestyle-guitar' },
      { label: 'Turista', img: 'lifestyle-globe' },
    ],
    noVale: 'No vale: gorrito de fiesta, ropa de cumpleaños ni nada que diga “happy birthday”.',
    cta: 'Confirmar asistencia',
  },

  formulario: {
    pasos: [
      { id: 'nombre', titulo: '¿Cómo te llamas?' },
      { id: 'email', titulo: '¿A qué email te mandamos la entrada?' },
      { id: 'cancion', titulo: '¿Qué canción le pedirías al DJ?' },
    ],
    enviar: 'Generar mi entrada',
  },

  ticket: {
    titulo: 'Tu entrada',
    stub: 'Admit one',
    dressCode: 'Dress code: la ocasión incorrecta',
  },

  info: {
    reglas: [
      'Vístete para la ocasión incorrecta (ver arriba).',
      'TODO Regla 2',
      'TODO Regla 3',
    ],
    playlist: { nombre: 'Playlist de la noche', url: '' }, // TODO
    yape: { texto: '¿Quieres colaborar?', qrImagen: '' }, // TODO
  },

  email: {
    from: 'Huamanga Club <hola@fommo.studio>', // TODO confirmar remitente
    replyTo: '',
    asunto: 'Tu entrada para Huamanga Club · Edición 0',
    saludo: 'Ya estás en la lista. Esta es tu entrada.',
  },
};
