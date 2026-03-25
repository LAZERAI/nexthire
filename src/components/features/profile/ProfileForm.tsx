"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { UploadCloud, X, Save, Loader2, User, MapPin, Briefcase, FileText, Github, Linkedin, Phone, Building2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  experience_years: number | null;
  skills: string[] | null;
  resume_url: string | null;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  current_company: string | null;
  current_role: string | null;
  avatar_url: string | null;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    headline: profile?.headline || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    experience_years: profile?.experience_years || 0,
    skills: profile?.skills || [],
    phone: profile?.phone || "",
    linkedin_url: profile?.linkedin_url || "",
    github_url: profile?.github_url || "",
    current_company: profile?.current_company || "",
    current_role: profile?.current_role || "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      // @ts-ignore
      if (!formData.skills.includes(skillInput.trim())) {
        // @ts-ignore
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    // @ts-ignore
    setFormData({ ...formData, skills: formData.skills.filter((s: string) => s !== skillToRemove) });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let resume_url = profile?.resume_url;

      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(fileName);
        resume_url = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          resume_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      router.refresh();
      // Optional: Add a toast notification here
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
      {/* Profile Header Card */}
      <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
          {profile?.full_name ? profile.full_name[0] : "U"}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-foreground">{profile?.full_name || "New Candidate"}</h2>
          <p className="text-muted-foreground">{profile?.headline || "Add a headline to stand out"}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-muted-foreground">
            {profile?.location && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>}
            {profile?.current_company && <span className="flex items-center gap-1"><Building2 size={14} /> {profile.current_role} at {profile.current_company}</span>}
          </div>
        </div>
      </div>

      {/* Left Column: Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="text-primary" size={20} /> Basic Info
          </h3>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Full Name</label>
              <input 
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Headline</label>
              <input 
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                placeholder="e.g. Senior React Developer | AI Enthusiast"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Bio</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all resize-none"
                placeholder="Tell us about your professional journey..."
              />
            </div>
          </div>
        </div>

        {/* Contact & Social */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Phone className="text-primary" size={20} /> Contact & Social
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
                <input 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-secondary/30 border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                  placeholder="e.g. Kochi, Kerala"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
                <input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-secondary/30 border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
                <input 
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  className="w-full bg-secondary/30 border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">GitHub URL</label>
              <div className="relative">
                <Github className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
                <input 
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  className="w-full bg-secondary/30 border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                  placeholder="github.com/username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Briefcase className="text-primary" size={20} /> Professional
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Current Company</label>
              <input 
                name="current_company"
                value={formData.current_company}
                onChange={handleChange}
                className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Current Role</label>
              <input 
                name="current_role"
                value={formData.current_role}
                onChange={handleChange}
                className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Years of Experience</label>
              <select
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all appearance-none"
              >
                <option value="0">0-1 Years</option>
                <option value="2">2-4 Years</option>
                <option value="5">5-8 Years</option>
                <option value="9">9+ Years</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Skills & Resume */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-primary" size={20} /> Skills
          </h3>
          <div className="space-y-4">
            <input 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              className="w-full bg-secondary/30 border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all"
              placeholder="Type a skill and press Enter..."
            />
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {/* @ts-ignore */}
              {formData.skills.map((skill: string) => (
                <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors"><X size={14} /></button>
                </span>
              ))}
              {/* @ts-ignore */}
              {formData.skills.length === 0 && (
                <span className="text-sm text-muted-foreground italic">No skills added yet.</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText className="text-primary" size={20} /> Resume
          </h3>
          
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer relative">
            <input 
              type="file" 
              accept=".pdf,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">
              {resumeFile ? resumeFile.name : "Click to upload or drag & drop"}
            </p>
            <p className="text-xs text-muted-foreground">PDF or DOCX up to 5MB</p>
          </div>

          {profile?.resume_url && !resumeFile && (
            <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border flex items-center gap-3">
              <FileText size={16} className="text-primary" />
              <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-foreground hover:underline truncate flex-1">
                Current Resume
              </a>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
