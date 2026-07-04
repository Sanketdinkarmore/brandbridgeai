"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

interface OutreachEmailModalProps {
  open: boolean;
  loading: boolean;
  targetBrandName: string;
  emailDraft: string;
  onClose: () => void;
}

export default function OutreachEmailModal({
  open,
  loading,
  targetBrandName,
  emailDraft,
  onClose,
}: OutreachEmailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(val) => !val && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <Dialog.Title className="bb-display flex items-center gap-2 text-xl font-medium">
                <Sparkles size={20} className="text-purple-400" />
                AI Outreach Draft
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-white/50">
                Generated cold email for {targetBrandName}
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="py-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                <p className="text-sm text-white/60">Crafting personalized outreach for {targetBrandName}...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/80">
                    {emailDraft || "No draft available."}
                  </pre>
                </div>
                
                <div className="flex items-start gap-3 rounded-lg bg-yellow-500/10 p-3 text-yellow-200/80">
                  <div className="mt-0.5 text-yellow-400">⚠️</div>
                  <p className="text-xs leading-relaxed">
                    <strong>Action Required:</strong> This is a draft intended for off-platform outreach. Please review the content, fill in any missing details, and send this manually via LinkedIn or Email. BrandBridge does not have contact information for this brand.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              disabled={loading || !emailDraft}
              className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check size={16} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy to Clipboard
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
