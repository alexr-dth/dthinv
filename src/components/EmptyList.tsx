export default function EmptyList({ iterable=[], nonEmpty: NonEmpty }) {
  return iterable?.length < 1 ? (
    <div className="empty-list">Empty</div>
  ) : (
    NonEmpty
  )
}
