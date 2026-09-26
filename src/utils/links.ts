// Builds a link to a section on the Home page that works regardless of the
// deployed base path (e.g. "/fundacion/#donar"), for use from any page.
export function homeAnchor(id: string): string {
  return `${import.meta.env.BASE_URL}#${id}`
}
