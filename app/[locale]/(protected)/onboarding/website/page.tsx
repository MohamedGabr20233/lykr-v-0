"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Linkedin, Facebook, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/onboarding/page-transition";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setWebsiteInfo } from "@/lib/store/slices/onboardingSlice";

export default function WebsitePage() {
  const dispatch = useAppDispatch();
  const storedWebsite = useAppSelector((state) => state.onboarding.website);

  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");
  const router = useRouter();

  // Initialize from Redux state
  useEffect(() => {
    setWebsite(storedWebsite.url);
    setLinkedin(storedWebsite.linkedin);
    setFacebook(storedWebsite.facebook);
    setTwitter(storedWebsite.twitter);
    setYoutube(storedWebsite.youtube);
  }, [storedWebsite]);

  const handleBack = () => {
    router.push("/onboarding/business-info");
  };

  const isValid = website.trim().length > 0 && linkedin.trim().length > 0;

  const handleContinue = () => {
    if (isValid) {
      dispatch(
        setWebsiteInfo({
          url: website.trim(),
          linkedin: linkedin.trim(),
          facebook: facebook.trim(),
          twitter: twitter.trim(),
          youtube: youtube.trim(),
        })
      );
      router.push("/onboarding/documents");
    }
  };

  return (
    <PageTransition>
      <div className="w-full max-w-lg mx-auto px-6">
        <h1 className="text-2xl font-normal text-neutral-950 mb-3">
          ما هو موقعك الإلكتروني؟
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          سنستخدم هذا لفهم عملك بشكل أفضل وتقديم رؤى مخصصة.
        </p>

        <div className="space-y-3">
          {/* Website Input */}
          <div className="relative">
            <Globe className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="url"
              placeholder="رابط الموقع الإلكتروني"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="h-12 bg-[#f3f3f5] border-transparent rounded-lg text-start pe-10"
            />
          </div>

          {/* LinkedIn Input */}
          <div className="relative">
            <Linkedin className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="url"
              placeholder="رابط LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="h-12 bg-[#f3f3f5] border-transparent rounded-lg text-start pe-10"
            />
          </div>

          {/* Facebook Input */}
          <div className="relative">
            <Facebook className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="url"
              placeholder="رابط Facebook (اختياري)"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="h-12 bg-[#f3f3f5] border-transparent rounded-lg text-start pe-10"
            />
          </div>

          {/* Twitter Input */}
          <div className="relative">
            <svg
              className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <Input
              type="url"
              placeholder="رابط X/Twitter (اختياري)"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="h-12 bg-[#f3f3f5] border-transparent rounded-lg text-start pe-10"
            />
          </div>

          {/* YouTube Input */}
          <div className="relative">
            <Youtube className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="url"
              placeholder="رابط YouTube (اختياري)"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="h-12 bg-[#f3f3f5] border-transparent rounded-lg text-start pe-10"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-12 px-6 rounded-lg"
            >
              رجوع
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!isValid}
              className="flex-1 h-12 rounded-lg"
            >
              متابعة
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
