export type Screen = 'intro' | 'club' | 'ruleta' | 'tematica' | 'form' | 'ticket' | 'info';

export interface Guest {
  nombre: string;
  apellido: string;
  email: string;
  cancion: string;
  numero: number | null;
}
