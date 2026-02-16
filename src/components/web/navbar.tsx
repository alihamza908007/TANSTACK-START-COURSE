import { Link } from '@tanstack/react-router'
import { Button, buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession()
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('Signed out successfully')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    })
  }
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
          <ThemeToggle />
          {isPending ? null : session ? (
            <>
              <Button variant={'secondary'} onClick={handleSignOut}>
                Logout
              </Button>
              <Link to="/dashboard" className={buttonVariants()}>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className={buttonVariants()} to="/login">
                Login
              </Link>
              <Link className={buttonVariants()} to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
