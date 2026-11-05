// El admin corre en dos dominios con backends de Supabase distintos:
// fundacionundiamas.org (producción) y fundacion-dzu.pages.dev (staging).
// Detectar por hostname evita agregar una variable de entorno nueva por
// cada hosting, y sigue funcionando si alguno de los dos cambia de
// proveedor pero conserva su dominio.
const STAGING_HOSTNAMES = ['fundacion-dzu.pages.dev']

export function isStagingHost(): boolean {
  return STAGING_HOSTNAMES.includes(window.location.hostname)
}
