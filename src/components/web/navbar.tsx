import { Link } from '@tanstack/react-router'
import { buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6qxTaEXSg7-seBDJVkdvrvRPT7RoYBl12lw&s"
            alt="Tanstack start logo"
            className="size-8"
          />
          <h1 className="text-lg font-semibold">TanStack Start</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link className={buttonVariants()} to="/login">
            Login
          </Link>
          <Link className={buttonVariants()} to="/signup">
            Sign Up
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
