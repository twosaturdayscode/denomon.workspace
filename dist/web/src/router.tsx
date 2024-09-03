import { Signpost } from '@duesabati/rome'
import { HelloView } from '../playground/hello.tsx'

export function Router() {
  const signpost = Signpost.create()

  signpost.route('/:msg', HelloView)

  return (
    <div>
      <h1>Hello</h1>
    </div>
  )
}
