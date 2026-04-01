"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { Building2, Globe2, ImagePlus, Loader2, Save, Sparkles, BadgeCheck, ArrowRight } from "lucide-react";

type CompanyRecord = {
  id: string;
  name: string | null;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  owner_id: string;
};

export default function CompanyProfileForm({
  company,
  ownerId,
}: {
  company: CompanyRecord | null;
  ownerId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: company?.name ?? "",
    logo_url: company?.logo_url ?? "",
    website: company?.website ?? "",
    description: company?.description ?? "",
  });

  const completionScore = [formData.name, formData.logo_url, formData.website, formData.description]
    .filter((value) => value && value.trim().length > 0)
    .length * 25;

  const companyName = formData.name.trim() || "Your company";
  const websiteLabel = formData.website.trim() || "website will appear here";
  const descriptionPreview = formData.description.trim()
    ? formData.description.trim()
    : "Tell candidates what makes your team worth joining, and why your work matters.";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const payload = {
        name: formData.name.trim(),
        logo_url: formData.logo_url.trim() || null,
        website: formData.website.trim() || null,
        description: formData.description.trim() || null,
      };

      if (!payload.name) {
        throw new Error("Company name is required");
      }

      if (company) {
        const { error } = await supabase
          .from("companies")
          .update(payload)
          .eq("id", company.id);

        if (error) throw error;

        setStatusMessage("Company profile saved. Your recruiter brand is updated.");
        router.refresh();
      } else {
        const { error } = await supabase
          .from("companies")
          .insert({
            ...payload,
            owner_id: ownerId,
          });

        if (error) throw error;

        setStatusMessage("Company profile created. Next, publish your first role.");
        router.push("/recruiter/post-job");
      }
    } catch (error: unknown) {
      console.error("Error saving company profile:", error);
      setStatusMessage(error instanceof Error ? error.message : "Unable to save company profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <Building2 size={14} /> Company profile
              </div>
              <h2 className="text-2xl font-bold text-foreground">Brand your hiring presence</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Candidates trust companies that feel complete, specific, and easy to understand.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Completion</div>
              <div className="text-lg font-bold text-foreground">{completionScore}%</div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Company name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Coderzon Labs"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Website</label>
                <div className="relative">
                  <Globe2 className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Logo URL</label>
                <div className="relative">
                  <ImagePlus className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
                  <input
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-10 pr-4 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                    placeholder="https://.../logo.png"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Company description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={8}
                className="w-full resize-none rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Describe your mission, team culture, work style, product focus, and why candidates should pay attention."
              />
            </div>
          </div>

          {statusMessage && (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{company ? "Save Company Profile" : "Create Company Profile"}</span>
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-muted-foreground">
            <Sparkles size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Live preview</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="relative flex min-h-[180px] items-center gap-4 bg-gradient-to-br from-primary/10 via-background to-secondary/40 p-6">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {formData.logo_url.trim() ? (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${formData.logo_url.trim()})` }}
                    role="img"
                    aria-label={companyName}
                  />
                ) : (
                  <Building2 size={32} className="text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  <BadgeCheck size={12} /> Candidate-facing profile
                </div>
                <h3 className="mt-3 truncate text-2xl font-bold text-foreground">{companyName}</h3>
                <div className="mt-1 text-sm text-muted-foreground">{websiteLabel}</div>
                <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-muted-foreground">
                  {descriptionPreview}
                </p>
              </div>
            </div>

            <div className="grid gap-3 border-t border-border p-5 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trust signal</div>
                <div className="mt-1 text-sm font-bold text-foreground">
                  {formData.website.trim() ? "Public website" : "Add a website"}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brand clarity</div>
                <div className="mt-1 text-sm font-bold text-foreground">
                  {formData.description.trim() ? "Mission explained" : "Tell your story"}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visual identity</div>
                <div className="mt-1 text-sm font-bold text-foreground">
                  {formData.logo_url.trim() ? "Logo provided" : "Use a strong logo"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ArrowRight className="text-primary" size={18} />
            <h3 className="text-lg font-bold text-foreground">What this unlocks</h3>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Better recruiter credibility when candidates inspect your roles.</p>
            <p>• Cleaner job previews across the recruiter dashboard and candidate views.</p>
            <p>• Faster move from brand setup to posting and matching jobs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
