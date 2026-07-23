import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <header className="h-14 border-b flex items-center justify-between px-6 sticky top-0 bg-background z-10">
      <div className="md:hidden font-semibold">Lost Leads</div>
      <div className="ml-auto flex items-center gap-4">
        <UserButton />
      </div>
    </header>
  );
}