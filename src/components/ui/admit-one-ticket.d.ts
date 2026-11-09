import type { JSX, ReactNode } from 'react';

export interface TicketTexture {
  engine: 'generative' | 'image';
  colorBack: string;
  colorFront: string;
  colorHighlight: string;
  shape: 'simplex' | 'warp' | 'dots' | 'wave' | 'ripple' | 'swirl' | 'sphere';
  type: 'random' | '2x2' | '4x4' | '8x8';
  size: number;
  colorSteps: number;
  originalColors: boolean;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  speed: number;
}

export interface TicketLayout {
  padding: number; labelTop: number; labelSize: number; labelLead: number; labelTracking: number;
  nameTop: number; nameSize: number; nameLead: number; nameTracking: number;
  footerTop: number; footerSize: number; footerTracking: number;
  stubSize: number; stubTracking: number; stubOpacity: number;
  watermarkSize: number; watermarkOpacity: number; watermarkColor: string; inkColor: string;
}

export interface TicketGeometry { aspect: number; cornerRadius: number; notchRadius: number; perforation: number }

export interface AdmitOneTicketProps {
  name: string;
  presenter: ReactNode;
  event: ReactNode;
  venue: ReactNode;
  dates: ReactNode;
  stubText: ReactNode;
  watermark: ReactNode;
  width?: number;
  geometry?: TicketGeometry;
  layout?: TicketLayout;
  texture?: TicketTexture;
  className?: string;
  tilt?: false | { maxTilt?: number; scale?: number; glare?: number };
}

export const TICKET_GEOMETRY: TicketGeometry;
export const TICKET_LAYOUT: TicketLayout;
export const TICKET_TEXTURE: TicketTexture;
export function ticketClipPath(width: number, height: number, geometry?: TicketGeometry): string;
export function playShutterSound(opts?: { volume?: number; gap?: number }): void;
export function AdmitOneTicket(props: AdmitOneTicketProps): JSX.Element;
export default AdmitOneTicket;
