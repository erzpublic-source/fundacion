import type { Reservation, ReservationStatus } from './reservationsTypes'

const NAMES = [
  'Mariana Gómez R.',
  'Juan Felipe Gómez',
  'Carlos Mendoza S.',
  'Patricia Restrepo',
  'Diana Carolina Díaz',
  'Esteban Jaramillo',
  'Laura Beltrán',
  'Andrés Felipe Ruiz',
  'Camila Torres',
  'Santiago Vargas',
  'Valentina Cárdenas',
  'Julián Herrera',
  'Natalia Peña',
  'Ricardo Salazar',
  'Gabriela Ospina',
  'Felipe Montoya',
  'Sofía Ramírez',
  'Daniel Castaño',
  'Isabella Quintero',
  'Miguel Ángel Rojas',
  'Alejandra Duarte',
  'Tomás Escobar',
  'Valeria Correa',
  'Sebastián Londoño',
]

// 4 pendiente / 18 aprobado / 2 rechazado — matches the reference mockup's
// tab counts (Todas 24) exactly, so cards/tabs/table stay internally
// consistent and update live as the admin approves/rejects.
const STATUS_PATTERN: ReservationStatus[] = [
  'pendiente',
  'pendiente',
  'aprobado',
  'aprobado',
  'aprobado',
  'rechazado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'aprobado',
  'pendiente',
  'aprobado',
  'aprobado',
  'pendiente',
  'rechazado',
]

const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com']

function slug(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()
}

function emailFor(name: string, index: number): string {
  const local = name
    .split(' ')
    .map(slug)
    .filter((part) => part.length > 1)
    .slice(0, 2)
    .join('.')
  return `${local}@${DOMAINS[index % DOMAINS.length]}`
}

let reservationSeq = 0
function reservationId(): string {
  reservationSeq += 1
  return `res-seed-${reservationSeq}`
}

let ticketSeq = 4820
export function nextTicketCode(): string {
  ticketSeq += 1
  return `#ENT-${ticketSeq}`
}

// Demo data only — 24 reservations tied to one event, seeded lazily the
// first time its "Reservas" screen is opened. `unitPrice` comes from the
// event's own price so "Valor Pagado" reads consistently with the event.
export function createSeedReservations(eventId: string, unitPrice: number): Reservation[] {
  return NAMES.map((name, index) => {
    const status = STATUS_PATTERN[index]
    return {
      id: reservationId(),
      eventId,
      attendeeName: name,
      email: emailFor(name, index),
      amountPaid: unitPrice,
      status,
      ticketCode: status === 'aprobado' ? nextTicketCode() : null,
      createdAt: Date.now() - 1000 * 60 * 60 * (24 * 4 - index * 3),
    }
  })
}
