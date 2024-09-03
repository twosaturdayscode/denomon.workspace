import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from './src/router.tsx'


if (!globalThis._IS_PRODUCTION_) {
  const src = new EventSource('/live-reload')
  src.addEventListener('message', (e) => {
    if (e.data === 'reload') {
      src.close()
      location.reload()
    }
  })

  src.addEventListener('open', () => {
    console.log('Live reload connected!')
  })
}

const main = () => {
  const root = document.getElementById('root')

  if (!root) {
    document.body.innerHTML = 'Render error: mount point is missing.'
    return
  }

  createRoot(root).render(
    <StrictMode>
      <Router />
    </StrictMode>,
  )
}

main()
