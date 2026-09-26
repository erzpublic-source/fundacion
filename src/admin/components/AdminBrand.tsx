import Logo from '../../components/Navbar/Logo'
import './AdminBrand.css'

// Reused identically across every admin auth screen — never restyle or
// resize this per screen, so the brand stays visually consistent.
export default function AdminBrand() {
  return (
    <div className="admin-brand">
      <Logo className="admin-brand__logo" />
    </div>
  )
}
