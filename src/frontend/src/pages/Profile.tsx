import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { shortenPrincipal } from "@/lib/format";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, User } from "lucide-react";

export function Profile() {
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const principal = identity?.getPrincipal().toText() ?? "";

  const handleSignOut = () => {
    clear();
    void navigate({ to: "/" });
  };

  return (
    <Layout title="Profile" subtitle="Your FarmPath account">
      <section
        data-ocid="profile.card"
        className="rounded-3xl border border-border bg-card p-5 shadow-subtle"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <User className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-foreground">
              Pepper Farmer
            </p>
            <p className="text-sm text-muted-foreground">
              Signed in with Internet Identity
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm text-muted-foreground">Principal</dt>
            <dd
              data-ocid="profile.principal"
              className="numeral min-w-0 truncate text-sm font-medium text-foreground"
              title={principal}
            >
              {principal ? shortenPrincipal(principal) : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm text-muted-foreground">Session</dt>
            <dd className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Active
            </dd>
          </div>
        </dl>
      </section>

      <Button
        type="button"
        variant="outline"
        data-ocid="profile.signout_button"
        onClick={handleSignOut}
        className="mt-5 h-12 w-full rounded-full border-destructive/30 text-base font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-5" />
        Sign out
      </Button>
    </Layout>
  );
}
