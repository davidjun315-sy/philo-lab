import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <p className="not-found__code">404</p>
        <h1>길을 잃은 생각</h1>
        <p>“나는 내가 모른다는 것을 안다.” 찾으시는 페이지가 존재하지 않습니다.</p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--gold">
            HOME으로
          </Link>
          <Link to="/philosophers" className="btn btn--outline-light">
            철학자 도감
          </Link>
        </div>
      </div>
    </section>
  )
}
