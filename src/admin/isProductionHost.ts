// El admin corre en dos dominios con backends de Supabase distintos:
// fundacionundiamas.org (producción) y fundacion-dzu.pages.dev (staging).
// Detectar por hostname evita agregar una variable de entorno nueva por
// cada hosting, y sigue funcionando si el hosting de producción cambia de
// proveedor pero conserva el dominio.
const PRODUCTION_HOSTNAMES = ['fundacionundiamas.org', 'www.fundacionundiamas.org']

export function isProductionHost(): boolean {
  return PRODUCTION_HOSTNAMES.includes(window.location.hostname)
}
