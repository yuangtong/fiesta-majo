export type Screen = 'intro' | 'club' | 'ruleta' | 'tematica' | 'form' | 'ticket' | 'info';

export interface Guest {
  nombre: string;
  apellido: string;
  email: string;
  canciones: string[]; // hasta 5 (MAX_CANCIONES)
  numero: number | null;
}
