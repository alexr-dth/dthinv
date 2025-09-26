export default function InlineLoader({ waitFor: waiting }) {
  if (!waiting) return <></>
  return (
    <div className="grid place-content-center p-5 text-gray-400 animate-pulse w-full h-full">
      Fetching data...
    </div>
  )
}
