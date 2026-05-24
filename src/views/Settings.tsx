import { useEffect, useMemo, useState } from "react";
import { User, Bell, Palette, Shield, CreditCard, Save, Sun, Moon, SlidersHorizontal, Link } from "lucide-react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import { useTheme } from "@/components/ThemeProvider";
import { WorkspaceConfig } from "@/components/dashboard/WorkspaceConfig";
import { SchemaBuilder } from "@/components/dashboard/SchemaBuilder";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { APP_ID, DEFAULT_SENDER_EMAIL, updateAppNotificationPreferences, updateApiKeys } from "@/lib/userProfile";
import { sendNotificationTestEmail } from "@/lib/emailNotifications";
import { toast } from "sonner";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "workspace", label: "Workspace", icon: SlidersHorizontal },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Link },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      "relative h-5 w-9 rounded-full transition shrink-0",
      checked ? "bg-gradient-primary shadow-glow" : "bg-muted",
    )}
    aria-pressed={checked}
  >
    <span className={cn(
      "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
      checked ? "translate-x-4" : "translate-x-0.5",
    )} />
  </button>
);

const Settings = () => {
  const { theme, toggle } = useTheme();
  const [active, setActive] = useState("profile");
  const [name, setName] = useState("Thomas Wright");
  const [email, setEmail] = useState("[email protected]");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const [vercelToken, setVercelToken] = useState("");

  useEffect(() => {
    if (userProfile?.apiKeys?.vercel) {
      setVercelToken(userProfile.apiKeys.vercel);
    }
  }, [userProfile]);

  const notificationPrefs = useMemo(
    () => userProfile?.notificationPreferences?.apps?.[APP_ID],
    [userProfile],
  );

  const saveNotifications = async (updates: {
    enabled?: boolean;
    recipientEmail?: string;
    triggers?: Record<string, boolean>;
  }) => {
    if (!user) return;

    try {
      await updateAppNotificationPreferences(user.uid, updates);
      await refreshProfile();
      toast.success("Notification settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save notification settings");
    }
  };

  const runTestEmail = async () => {
    if (!notificationPrefs?.recipientEmail) {
      toast.error("Set a recipient email first");
      return;
    }

    setTestingEmail(true);
    try {
      await sendNotificationTestEmail({
        appId: APP_ID,
        appName: "Work OS",
        recipientEmail: notificationPrefs.recipientEmail,
      });
      toast.success("Test email request sent");
    } catch {
      toast.error("Email testing will work after Firebase Functions Gmail credentials are configured");
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <PageLayout
      breadcrumb="Work OS / Settings"
      title="Settings"
      action={{ label: "Save Changes", icon: <Save className="h-3.5 w-3.5" /> }}
    >
      <div className="grid grid-cols-12 gap-5">
        <aside className="col-span-12 md:col-span-3">
          <nav className="rounded-lg border border-border bg-card shadow-card p-2 sticky top-6">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="col-span-12 md:col-span-9 space-y-5">
          {active === "profile" && (
            <div className="rounded-lg border border-border bg-card shadow-card p-6">
              <h2 className="text-sm font-semibold mb-1">Profile information</h2>
              <p className="text-xs text-muted-foreground mb-5">Update your personal details and how you appear in the workspace.</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold text-lg shadow-glow">
                  TW
                </div>
                <div>
                  <button className="text-xs btn-gradient rounded-md px-3 py-1.5 font-medium">Upload new</button>
                  <p className="text-[11px] text-muted-foreground mt-1.5">PNG or JPG, max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full name" value={name} onChange={setName} />
                <Field label="Email" value={user?.email || email} onChange={setEmail} type="email" />
                <Field label="Role" value="Product designer" onChange={() => {}} />
                <Field label="Timezone" value="Europe / London" onChange={() => {}} />
              </div>
            </div>
          )}

          {active === "appearance" && (
            <div className="rounded-lg border border-border bg-card shadow-card p-6">
              <h2 className="text-sm font-semibold mb-1">Appearance</h2>
              <p className="text-xs text-muted-foreground mb-5">Customize the look and feel of your dashboard.</p>

              <div className="space-y-4">
                <Row label="Theme" desc="Switch between light and dark mode.">
                  <button onClick={toggle} className="flex items-center gap-2 text-xs border border-border rounded-md px-3 py-1.5 bg-card hover:bg-accent transition">
                    {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                    <span className="capitalize font-medium">{theme}</span>
                  </button>
                </Row>
                <Row label="Accent color" desc="Used for highlights and primary buttons.">
                  <div className="flex items-center gap-1.5">
                    {["bg-gradient-primary", "bg-primary", "bg-secondary", "bg-success", "bg-warning"].map((c, i) => (
                      <button key={i} className={cn("h-6 w-6 rounded-full border-2 border-border hover:border-foreground transition", c, i === 0 && "border-foreground shadow-glow")} />
                    ))}
                  </div>
                </Row>
                <Row label="Compact mode" desc="Reduce spacing across widgets.">
                  <Toggle checked={false} onChange={() => {}} />
                </Row>
              </div>
            </div>
          )}

          {active === "workspace" && (
            <div className="space-y-5">
              <SchemaBuilder />
              <WorkspaceConfig />
            </div>
          )}

          {active === "notifications" && (
            <div className="rounded-lg border border-border bg-card shadow-card p-6">
              <h2 className="text-sm font-semibold mb-1">Notifications</h2>
              <p className="text-xs text-muted-foreground mb-5">Choose how and when you'd like to be notified.</p>
              <div className="space-y-4">
                <Row label="Email notifications" desc="Receive task and event updates via email.">
                  <Toggle checked={notificationPrefs?.enabled ?? emailNotif} onChange={(value) => {
                    setEmailNotif(value);
                    void saveNotifications({ enabled: value });
                  }} />
                </Row>
                <Row label="Push notifications" desc="Get real-time alerts on your devices.">
                  <Toggle checked={pushNotif} onChange={setPushNotif} />
                </Row>
                <Row label="Weekly digest" desc="Summary of your week every Sunday evening.">
                  <Toggle checked={notificationPrefs?.triggers?.weeklyDigest ?? weeklyDigest} onChange={(value) => {
                    setWeeklyDigest(value);
                    void saveNotifications({ triggers: { weeklyDigest: value } });
                  }} />
                </Row>
                <Row label="Task reminders" desc="Get notified when task due dates are close.">
                  <Toggle checked={notificationPrefs?.triggers?.taskReminders ?? true} onChange={(value) => void saveNotifications({ triggers: { taskReminders: value } })} />
                </Row>
                <Row label="Calendar events" desc="Get notified for upcoming events and meetings.">
                  <Toggle checked={notificationPrefs?.triggers?.calendarEvents ?? true} onChange={(value) => void saveNotifications({ triggers: { calendarEvents: value } })} />
                </Row>
                <Row label="Project deadlines" desc="Get notified when project timelines are at risk.">
                  <Toggle checked={notificationPrefs?.triggers?.projectDeadlines ?? true} onChange={(value) => void saveNotifications({ triggers: { projectDeadlines: value } })} />
                </Row>
                <div className="rounded-md border border-border bg-background p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium">Shared email routing</p>
                    <p className="text-xs text-muted-foreground mt-1">Stored in your shared Firebase `users` profile so the same account can reuse it in the other apps.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Sender email" value={userProfile?.notificationPreferences?.senderEmail || DEFAULT_SENDER_EMAIL} onChange={() => {}} />
                    <Field
                      label="Recipient email"
                      value={notificationPrefs?.recipientEmail || ""}
                      onChange={(value) => { void saveNotifications({ recipientEmail: value }); }}
                      type="email"
                    />
                  </div>
                  <button onClick={() => void runTestEmail()} className="text-xs border border-border rounded-md px-3 py-1.5 bg-card hover:bg-accent transition font-medium" disabled={testingEmail}>
                    {testingEmail ? "Sending..." : "Send test email"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === "integrations" && (
            <div className="rounded-lg border border-border bg-card shadow-card p-6">
              <h2 className="text-sm font-semibold mb-1">Integrations</h2>
              <p className="text-xs text-muted-foreground mb-5 font-light">
                Configure API tokens to integrate with external tools and cloud providers.
              </p>
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-background p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium">Vercel Integration</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a Vercel Access Token to display live deployment status badges for linked Vercel projects.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-grow">
                      <Field
                        label="Vercel Access Token"
                        value={vercelToken}
                        onChange={setVercelToken}
                        type="password"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!user) return;
                        try {
                          await updateApiKeys(user.uid, { vercel: vercelToken });
                          await refreshProfile();
                          toast.success("Vercel token saved");
                        } catch (err) {
                          toast.error("Failed to save Vercel token");
                        }
                      }}
                      className="text-xs btn-gradient rounded-md px-4 py-2 font-medium h-9"
                    >
                      Save Vercel Token
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "security" && (
            <div className="rounded-lg border border-border bg-card shadow-card p-6">
              <h2 className="text-sm font-semibold mb-1">Security</h2>
              <p className="text-xs text-muted-foreground mb-5">Manage your password and authentication methods.</p>
              <div className="space-y-4">
                <Row label="Two-factor authentication" desc="Add an extra layer of security at sign-in.">
                  <Toggle checked={twoFA} onChange={setTwoFA} />
                </Row>
                <Row label="Password" desc="Last changed 3 months ago.">
                  <button className="text-xs border border-border rounded-md px-3 py-1.5 bg-card hover:bg-accent transition font-medium">Change</button>
                </Row>
                <Row label="Active sessions" desc="2 devices currently signed in.">
                  <button className="text-xs border border-border rounded-md px-3 py-1.5 bg-card hover:bg-accent transition font-medium">Manage</button>
                </Row>
                <Row label="Sign out" desc={user?.email || "End your current session."}>
                  <button onClick={() => void signOut()} className="text-xs border border-border rounded-md px-3 py-1.5 bg-card hover:bg-accent transition font-medium">Sign out</button>
                </Row>
              </div>
            </div>
          )}

          {active === "billing" && (
            <div className="rounded-lg border border-border bg-card shadow-card p-6">
              <h2 className="text-sm font-semibold mb-1">Billing</h2>
              <p className="text-xs text-muted-foreground mb-5">Manage your subscription and payment details.</p>
              <div className="rounded-md border border-border bg-gradient-subtle p-4 mb-4">
                <p className="text-xs font-semibold text-gradient">Free plan</p>
                <p className="text-[11px] text-muted-foreground mt-1">Upgrade to Pro for unlimited widgets, cloud sync, and AI assist.</p>
                <button className="mt-3 btn-gradient rounded-md px-3 py-1.5 text-xs font-medium">Upgrade to Pro — $9/mo</button>
              </div>
              <p className="text-[11px] text-muted-foreground">No payment methods on file.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <label className="block">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1.5 w-full text-sm rounded-md bg-background border border-border px-3 py-2 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition"
    />
  </label>
);

const Row = ({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </div>
    {children}
  </div>
);

export default Settings;
