import { useState, useEffect } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement
      const pos = el.scrollTop
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? (pos / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-0.5 bg-cream-200">
      <div
        className="h-full bg-terra-400 transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
