"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/onboarding/page-transition";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setDocuments } from "@/lib/store/slices/onboardingSlice";
import type { DocumentInfo } from "@/app/types/onboarding";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const dispatch = useAppDispatch();
  const storedDocuments = useAppSelector((state) => state.onboarding.documents);

  const [files, setFiles] = useState<DocumentInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  // Initialize from Redux state
  useEffect(() => {
    if (storedDocuments.length > 0) {
      setFiles(storedDocuments);
    }
  }, [storedDocuments]);

  const handleBack = () => {
    router.push("/onboarding/website");
  };

  const handleSkip = () => {
    router.push("/onboarding/competitors");
  };

  const handleContinue = () => {
    dispatch(setDocuments(files));
    router.push("/onboarding/competitors");
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });

    setFiles((prev) => [...prev, ...validFiles.map((f) => ({ name: f.name, size: f.size }))]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles.map((f) => ({ name: f.name, size: f.size }))]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <PageTransition>
      <div className="w-full max-w-lg mx-auto px-6">
        <h1 className="text-2xl font-normal text-neutral-950 mb-3">رفع مستندات العمل</h1>

        <p className="text-sm text-gray-500 mb-6">اختياري - شارك ملفاتك التعريفية أو العروض التقديمية أو أي مستندات تساعدنا على فهم عملك بشكل أفضل.</p>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? "border-black bg-gray-100" : "border-gray-300 hover:border-gray-400"}`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input id="file-input" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileSelect} className="hidden" />
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-neutral-950 mb-2">اسحب الملفات وأفلتها هنا، أو انقر للتصفح</p>
          <p className="text-sm text-gray-500">PDF, DOC, DOCX, PPT, PPTX (بحد أقصى 10 ميجابايت لكل ملف)</p>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-neutral-950">الملفات المرفوعة:</p>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-neutral-950">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="p-1 hover:bg-gray-200 rounded transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <Button variant="outline" onClick={handleBack} className="h-12 px-6 rounded-lg">
            رجوع
          </Button>
          <Button variant="ghost" onClick={handleSkip} className="h-12 px-6 rounded-lg">
            تخطي
          </Button>
          <Button onClick={handleContinue} className="flex-1 h-12 rounded-lg">
            متابعة
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
