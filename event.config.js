// Todo el contenido de la invitación vive aquí. Lo usan el front (src/) y las funciones de Vercel (api/).
// Busca "TODO" para ver lo que falta confirmar.
export default {
  evento: {
    marca: 'Huamanga Club',
    edicion: 'Edición 0',
    edicionCorta: '00',
    vol: 'Vol 0.',
    nombre: 'Majo x Adri', // dos cumpleañeras
    cumpleaneras: 'Majo x Adri',
    fechaCorta: 'Sáb 14.11',
    fechaLarga: 'Sábado 14 de noviembre',
    hora: '22:00 – late',
    inicioUTC: '20261115T030000Z', // sáb 14/11 22:00 en Lima (UTC-5)
    finUTC: '20261115T110000Z', // dom 15/11 06:00 en Lima
    direccion: 'Huamanga 419',
    distrito: 'Magdalena del Mar',
    referencia: 'Lima · límite con Pueblo Libre',
    mapsQuery: 'Huamanga 419, Magdalena del Mar, Lima, Peru', // texto para el calendario
    mapsLink: 'https://maps.app.goo.gl/nT9jMGzWufdzbKcXA', // link exacto de Google Maps
    urlPublica: 'https://TODO.vercel.app',
  },

  // Escenas 3D de Spline (letras globo cromadas)
  spline: {
    club: 'https://prod.spline.design/nCbIKyw6U5Vr-tyc/scene.splinecode',
    invitado: 'https://prod.spline.design/E7ixEusTl982zmgw/scene.splinecode',
    // TODO: activar cuando la escena se re-exporte con renderer "Both" o "WebGL 2" (hoy es solo WebGPU)
    invitadoActivo: false,
  },

  // Títulos con letras globo como IMAGEN (PNG/WebP con fondo transparente en public/images/titulos/).
  // Si hay imagen, se usa en vez de Spline (más liviano, sin sello de Spline, funciona en todos los celulares).
  titulos: {
    club: '/images/titulos/huamanga-club.webp', // 3 líneas, para celular
    invitado: '/images/titulos/estas-invitado.webp',
    // En computadora el título va en 2 líneas como la referencia: "HUAMANGA" y "CLUB" por separado.
    // Vacío = se usa el título de 3 líneas (club).
    palabraHuamanga: '', // ej. '/images/titulos/huamanga.webp'
    palabraClub: '', // ej. '/images/titulos/club.webp'
    // Composición de referencia (solo guía visual; la escena se arma por capas en ClubHero).
    clubEscena: '/images/titulos/huamanga-club-vol0.webp',
    vol: '/images/titulos/vol0.webp', // "VOL 0" en globos negros (versión vertical)
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
    // DJs (hora opcional: si se agrega, se muestra delante del nombre)
    lineup: [
      { hora: '', nombre: '@yunngfeo' },
      { hora: '', nombre: '@mathi' },
      { hora: '', nombre: '@tifu' },
    ],
    hint: 'Arrastra los globos',
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
      { id: 'museo', label: 'Museo', img: 'lifestyle-picture' },
    ],
    // Siempre gana esta. En la ruleta se ve como una carta más ("Cumpleaños") para no arruinar la sorpresa;
    // al ganar se tacha y se revela "La ocasión incorrecta".
    ganadora: { id: 'incorrecta', label: 'La ocasión incorrecta', cartaLabel: 'Cumpleaños', img: 'lifestyle-gift' },
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
    // TikToks de referencia (se muestran como videos dentro de la explicación de la temática)
    tiktoks: [
      { autor: '@kassandrabt29', id: '7578320933958454548' },
      { autor: '@aaashleyk', id: '7649091294907714847' },
      { autor: '@sarahnew', id: '7625726481930472726' },
      { autor: '@claucorreiac', id: '7552697414960942347' },
    ],
    noVale: 'No vale: gorrito de fiesta, ropa de cumpleaños ni nada que diga “happy birthday”.',
    cta: 'Confirmar asistencia',
  },

  formulario: {
    pasos: [
      { id: 'nombre', titulo: '¿Cómo te llamas?' },
      { id: 'email', titulo: '¿Cuál es tu email?', nota: 'Así te reconocemos si vuelves a entrar.' },
      { id: 'cancion', titulo: '¿Qué canción le pedirías al DJ?' },
    ],
    enviar: 'Generar mi entrada',
  },

  ticket: {
    titulo: 'Tu entrada',
    marca: 'Huamanga Club v0', // lo que dice el ticket arriba
    evento: 'Majo x Adri',
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

  // Email de confirmación (Resend). APAGADO por ahora: la entrada solo se muestra en pantalla.
  // Para activarlo: activo: true + RESEND_API_KEY en Vercel + dominio verificado en Resend.
  email: {
    activo: false,
    from: 'Huamanga Club <hola@fommo.studio>', // TODO confirmar remitente
    replyTo: '',
    asunto: 'Tu entrada para Huamanga Club · Edición 0',
    saludo: 'Ya estás en la lista. Esta es tu entrada.',
  },
};
