/** 작은 라벨. tone: navy | gold | green | rose | muted | outline */
export default function Badge({ children, tone = 'muted', className = '' }) {
  return <span className={`badge badge--${tone} ${className}`}>{children}</span>
}
