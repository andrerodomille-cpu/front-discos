export default function SectionHeading({ children, as: Tag = 'h2', className = '' }) {
  return <Tag className={`u-sec ${className}`}>{children}</Tag>
}
