// app/page.tsx

"use client";

import { useState } from "react";

// Define the structure of the generated kit
interface BusinessKit {
  name: string;
  tagline: string;
  description: string;
  colorPalette: { hex: string; name: string }[];
  logoIdea: string;
  websiteText: {
    about: string;
    services: string;
    contact: string;
  };
  socialMediaBio: string;
}

export default function HomePage() {
  const [businessType, setBusinessType] = useState("Handmade Jewelry");
  const [targetAudience, setTargetAudience] = useState("Young women who love minimalist style");
  const [style, setStyle] = useState("Modern & Elegant");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedKit, setGeneratedKit] = useState<BusinessKit | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedKit(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, targetAudience, style }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate business kit. Please try again.");
      }

      const data: BusinessKit = await response.json();
      setGeneratedKit(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-4xl p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">AI-Powered Micro Business Builder</h1>
        <p className="text-xl text-muted-foreground">Launch your dream side hustle in 60 seconds. For free.</p>
      </header>

      <section className="bg-card border rounded-lg p-8 shadow-sm mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-foreground mb-2">What kind of business do you want to start?</label>
            <input
              id="businessType"
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="e.g., Clothing brand, digital products, bakery..."
              className="w-full p-3 bg-input border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-foreground mb-2">Who is your target audience?</label>
            <input
              id="targetAudience"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Eco-conscious millennials, busy parents..."
              className="w-full p-3 bg-input border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-foreground mb-2">Describe the desired style/vibe.</label>
            <input
              id="style"
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g., Modern, cute, luxury, eco-friendly..."
              className="w-full p-3 bg-input border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-md hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating Your Business Kit..." : "✨ Generate My Business Kit"}
          </button>
        </form>
      </section>

      {error && <div className="text-center text-red-500 bg-destructive/10 p-4 rounded-md">{error}</div>}

      {generatedKit && (
        <section id="results" className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-center">Your Business Kit is Ready!</h2>
            
            {/* Business Name & Tagline */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl font-semibold">{generatedKit.name}</h3>
                <p className="text-lg text-muted-foreground italic">"{generatedKit.tagline}"</p>
            </div>

            {/* Brand Colors */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Brand Color Palette</h3>
                <div className="flex space-x-4">
                    {generatedKit.colorPalette.map(color => (
                        <div key={color.hex} className="text-center">
                            <div className="w-16 h-16 rounded-full shadow-inner border" style={{ backgroundColor: color.hex }}></div>
                            <p className="text-sm mt-2 font-mono">{color.hex}</p>
                            <p className="text-xs text-muted-foreground">{color.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logo Idea */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Logo Idea</h3>
                <p className="text-foreground">{generatedKit.logoIdea}</p>
            </div>
            
            {/* Website Content */}
            <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
                <h3 className="text-xl font-semibold">Website Content</h3>
                <div>
                    <h4 className="font-bold">About Us</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{generatedKit.websiteText.about}</p>
                </div>
                <div>
                    <h4 className="font-bold">Our Services / Products</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{generatedKit.websiteText.services}</p>
                </div>
                 <div>
                    <h4 className="font-bold">Contact</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{generatedKit.websiteText.contact}</p>
                </div>
            </div>
            
            {/* Social Media Bio */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Social Media Bio</h3>
                <p className="text-foreground bg-secondary p-3 rounded-md">{generatedKit.socialMediaBio}</p>
            </div>
        </section>
      )}

      <footer className="text-center mt-12 text-muted-foreground text-sm">
        <p>Built by an indie founder. Let's build together.</p>
        <p>Powered by Next.js, Vercel, Supabase, and OpenAI.</p>
      </footer>
    </main>
  );
}