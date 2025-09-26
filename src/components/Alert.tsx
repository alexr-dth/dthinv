import { Link, LucideAlertTriangle } from "lucide-react";

export default function Alert() {
  return (
    <div
      role="alert"
      className="relative items-center flex gap-3 rounded border border-red-300/70 bg-red-50 px-4 py-3 text-red-900 shadow"
    >
      <LucideAlertTriangle size={64} />

      <div className="leading-relaxed">
        The selected requested items seems to be empty. Go to{' '}
        <Link
          to="/requests"
          className="font-medium text-red-800 underline underline-offset-4 hover:text-red-900 focus:outline-none focus:ring-red-500/50 "
        >
          /requests
        </Link>{' '}
        to add items to an order.
      </div>
    </div>
  )
}
