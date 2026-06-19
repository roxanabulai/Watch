import Link from "next/link";
import { Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-serif text-2xl font-semibold">
          Horologe
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/auctions">Auctions</Link>
          <Link href="/dashboard">Dashboard</Link>
          {user?.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Search auctions">
            <Link href="/auctions">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <ThemeToggle />
          {user ? (
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/dashboard">{user.name}</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
