import { auth, signIn, signOut } from "@/auth";

export default async function AuthTestPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
            Phase 2 Isolation Test
          </span>
          <h1 className="text-xl font-semibold mt-2 text-white">Auth.js Foundation Test</h1>
          <p className="text-xs text-slate-400 mt-1">
            Isolated server-side session verification.
          </p>
        </div>

        {session?.user ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 space-y-2 text-sm font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-semibold">Authenticated</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">User ID:</span>
                <span className="text-slate-300 truncate max-w-[200px]">{session.user.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-300 truncate max-w-[200px]">{session.user.email ?? "None"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Name:</span>
                <span className="text-slate-300 truncate max-w-[200px]">{session.user.name ?? "None"}</span>
              </div>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/auth-test" });
              }}
            >
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition"
              >
                Sign Out (Auth.js)
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 space-y-2 text-sm font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Status:</span>
                <span className="text-amber-400 font-semibold">Unauthenticated</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-2">
                No active Auth.js session detected on this request.
              </p>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server";
                const email = formData.get("email") as string;
                await signIn("resend", { email, redirectTo: "/auth-test" });
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="email" className="block text-xs text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tester@example.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
              >
                Send Magic Link (Auth.js)
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
