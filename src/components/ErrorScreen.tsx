export default function ErrorScreen({ error }) {
  return (
    <div className="text-xl grid place-content-center p-5  w-lvw h-lvh">
      <div className="flex flex-col justify-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-red-400 mb-6 text-center">{error.message}</p>
        <button onClick={() => window.location.reload()} className="btn">
          Reload
        </button>
      </div>
    </div>
  )
}
