import { Info } from "lucide-react";
import AuthForm from "./AuthForm";
import { AuthShell } from "./AuthShell";

/** Shown at /admin to anyone who is not a signed-in admin. */
export function AdminSignIn({ signedInAs }: { signedInAs?: string | null }) {
  return (
    <AuthShell role="admin" title="Admin sign in" subtitle="For the Wellthyfy team only.">
      {signedInAs && (
        <p className="mb-5 flex items-start gap-2.5 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-ink-soft">
          <Info className="mt-0.5 size-4.5 shrink-0 text-gold-700" />
          <span>
            You are signed in as <span className="font-semibold text-ink">{signedInAs}</span>,
            which is not an admin account. Sign in below with an admin account to switch.
          </span>
        </p>
      )}
      <AuthForm mode="login" role="admin" />
    </AuthShell>
  );
}
