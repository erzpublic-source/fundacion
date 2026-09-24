import type { AdminEvent } from './adminEventsTypes'
import lanzamientoImg from '../assets/images/eventos-featured.jpg'
import escuchaActivaImg from '../assets/images/eventos-escucha-activa.jpg'
import aireLibreImg from '../assets/images/eventos-aire-libre.jpg'
import circulosApoyoImg from '../assets/images/eventos-circulos-apoyo.jpg'

function daysFromNow(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

let seedCounter = 0
function seedId(prefix: string): string {
  seedCounter += 1
  return `${prefix}-seed-${seedCounter}`
}

// Demo data only — every date is relative to "now" so the dashboard always
// reads as live (an "activo" event stays activo run after run) instead of
// drifting into "finalizado" the day after this file was written.
export function createSeedEvents(): AdminEvent[] {
  return [
    {
      id: seedId('evt'),
      title: 'Lanzamiento Fundación Un Día Más',
      description: 'Encuentro para celebrar el inicio de un camino hacia el bienestar emocional compartido.',
      date: daysFromNow(3),
      time: '18:00',
      place: 'Sede Central, Calle de la Calma 123',
      imageUrl: lanzamientoImg,
      kind: 'pago',
      price: 25000,
      capacity: 100,
      reservedCount: 45,
      published: true,
      discountCodes: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    },
    {
      id: seedId('evt'),
      title: 'Talleres de Escucha Activa',
      description: 'Un espacio para aprender técnicas de comunicación empática y fortalecer vínculos comunitarios.',
      date: null,
      time: null,
      place: 'Calle de la Calma 123, Bogotá',
      imageUrl: escuchaActivaImg,
      kind: 'gratis',
      price: null,
      capacity: 50,
      reservedCount: 0,
      published: false,
      discountCodes: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
      id: seedId('evt'),
      title: 'Jornadas al Aire Libre',
      description: 'Conectamos con la naturaleza y la comunidad en una mañana de actividades recreativas.',
      date: daysFromNow(6),
      time: '10:00',
      place: 'Parque de Fenón Núñez, Ibagué',
      imageUrl: aireLibreImg,
      kind: 'gratis',
      price: null,
      capacity: 30,
      reservedCount: 30,
      published: true,
      discountCodes: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
    },
    {
      id: seedId('evt'),
      title: 'Círculos de Apoyo',
      description: 'Un encuentro íntimo para compartir experiencias y encontrar consuelo en la compañía de otros.',
      date: daysFromNow(-5),
      time: '18:00',
      place: 'Centro Comunitario Av. la Esperanza 45',
      imageUrl: circulosApoyoImg,
      kind: 'gratis',
      price: null,
      capacity: 25,
      reservedCount: 18,
      published: true,
      discountCodes: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    },
    {
      id: seedId('evt'),
      title: 'Conversatorio Virtual: Salud Mental en el Trabajo',
      description: 'Panel híbrido con especialistas sobre bienestar emocional en entornos laborales.',
      date: daysFromNow(20),
      time: '17:30',
      place: 'Virtual (enlace enviado por correo)',
      imageUrl: null,
      kind: 'hibrido',
      price: 20000,
      capacity: 200,
      reservedCount: 60,
      published: true,
      discountCodes: [
        { id: seedId('code'), code: 'AMIGOS2024', kind: 'percent', value: 50, maxUses: 10, usedCount: 3 },
        { id: seedId('code'), code: 'VIP100', kind: 'free', value: 0, maxUses: 5, usedCount: 1 },
      ],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    },
    {
      id: seedId('evt'),
      title: 'Taller de Respiración Consciente',
      description: 'Práctica guiada de respiración y relajación para el manejo del estrés cotidiano.',
      date: daysFromNow(1),
      time: '07:30',
      place: 'Sede Central, Calle de la Calma 123',
      imageUrl: null,
      kind: 'pago',
      price: 15000,
      capacity: 40,
      reservedCount: 10,
      published: false,
      discountCodes: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
    {
      id: seedId('evt'),
      title: 'Conversatorio: Fecha por Confirmar',
      description: 'Segunda edición del conversatorio comunitario — la fecha se anunciará próximamente.',
      date: null,
      time: null,
      place: 'Por definir',
      imageUrl: null,
      kind: 'gratis',
      price: null,
      capacity: 60,
      reservedCount: 5,
      published: true,
      discountCodes: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
  ]
}
