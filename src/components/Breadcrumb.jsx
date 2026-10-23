import { Link } from 'react-router-dom'

/** items: [{ to?, label }] */
export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="현재 위치">
      {items.map((item, i) => (
        <span key={i}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          {i < items.length - 1 && <span className="breadcrumb__sep" aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  )
}
