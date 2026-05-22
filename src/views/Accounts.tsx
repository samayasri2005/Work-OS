import { useMemo, useState } from "react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KeyRound, Plus, Mail, Tag, FolderKanban, Trash2, Pencil, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useSchema, schemaApi } from "@/lib/schemaStore";
import { useProjects } from "@/lib/projectsStore";

const Accounts = () => {
  const schema = useSchema();
  const projects = useProjects();
  const accounts = schema.projects.accounts;
  const [adding, setAdding] = useState(false);
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ email: "", label: "" });

  const usage = useMemo(() => {
    const m = new Map<string, { id: string; name: string }[]>();
    for (const a of accounts) m.set(a.id, []);
    for (const p of projects) {
      for (const acc of p.accounts) {
        const matched = accounts.find((a) => a.email.toLowerCase() === acc.email.toLowerCase());
        if (matched) m.get(matched.id)!.push({ id: p.id, name: p.name });
      }
    }
    return m;
  }, [accounts, projects]);

  const save = () => {
    if (!email.trim()) return;
    schemaApi.addAccount(email, label);
    setEmail("");
    setLabel("");
    setAdding(false);
  };

  return (
    <PageLayout
      breadcrumb="Work OS / Accounts"
      title="Accounts Center"
      action={null}
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground max-w-xl">
          Every account, key, and identity you use to build. Track which projects each one powers.
        </p>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 p-10 text-center">
          <KeyRound className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No accounts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((a) => {
            const used = usage.get(a.id) ?? [];
            const isEditing = editing === a.id;
            return (
              <div
                key={a.id}
                className="rounded-lg border border-border bg-card shadow-card p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-gradient-primary/20 border border-primary/30 grid place-items-center shrink-0">
                    <KeyRound className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <Input
                          value={draft.email}
                          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                          className="h-8 text-xs"
                        />
                        <Input
                          value={draft.label}
                          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                          className="h-8 text-xs"
                          placeholder="Label"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {a.email}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Tag className="h-3 w-3" /> {a.label}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {isEditing ? (
                      <button
                        onClick={() => {
                          schemaApi.patchAccount(a.id, draft);
                          setEditing(null);
                        }}
                        className="p-1.5 rounded-md hover:bg-accent text-success"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditing(a.id);
                          setDraft({ email: a.email, label: a.label });
                        }}
                        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => schemaApi.removeAccount(a.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                    Used in ({used.length})
                  </p>
                  {used.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Not linked to any project yet.</p>
                  ) : (
                    <ul className="space-y-1">
                      {used.map((u) => (
                        <li key={u.id}>
                          <Link
                            to={`/projects/${u.id}`}
                            className="flex items-center gap-1.5 text-xs text-foreground/80 hover:text-primary transition group"
                          >
                            <FolderKanban className="h-3 w-3" />
                            <span className="group-hover:underline">{u.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add account</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="[email protected]"
            />
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (Personal, Work, Client X…)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!email.trim()}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Accounts;