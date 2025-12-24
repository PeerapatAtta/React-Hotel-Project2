export default function Container({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-5xl px-4 sm:px-6 md:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  )
}

