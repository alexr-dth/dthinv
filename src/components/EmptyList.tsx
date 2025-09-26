export default function EmptyList({ iterable=[], nonEmpty: NonEmpty }) {
  return iterable?.length < 1 ? (
    <div className="empty-list mt-5">Empty</div>
  ) : (
    NonEmpty
  )
}
