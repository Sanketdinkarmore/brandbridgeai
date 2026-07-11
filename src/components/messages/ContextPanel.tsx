import React from "react";
import Image from "next/image";
import { UserRole } from "@/models/types";

interface ContextPanelProps {
  conversation: any;
  role: UserRole;
  onClose: () => void;
}

export default function ContextPanel({ conversation, role, onClose }: ContextPanelProps) {
  if (!conversation) return null;

  const { otherUser, relatedEntityType } = conversation;

  return (
    <div className="flex flex-col h-full bg-[#0F0F12] text-sm overflow-y-auto">
      {/* Profile Header */}
      <div className="p-6 border-b border-white/10 flex flex-col items-center text-center">
        {otherUser?.image ? (
          <Image
            src={otherUser.image}
            alt={otherUser.name || "User"}
            width={80}
            height={80}
            className="rounded-full object-cover w-20 h-20 mb-4 border-2 border-white/10"
          />
        ) : (
          <div className="w-20 h-20 bg-[#2D2D35] rounded-full flex items-center justify-center text-3xl font-semibold mb-4">
            {otherUser?.name?.charAt(0) || "?"}
          </div>
        )}
        <h3 className="text-lg font-semibold">{otherUser?.name || "Unknown User"}</h3>
        <p className="text-gray-400 capitalize">{otherUser?.role?.replace("_", " ")}</p>
      </div>

      {/* Role-specific Context & Actions */}
      <div className="p-4 flex-1">
        {role === "brand" && <BrandContextPanel conversation={conversation} />}
        {role === "freelancer" && <FreelancerContextPanel conversation={conversation} />}
        {role === "product_owner" && <ProductOwnerContextPanel conversation={conversation} />}
        {role === "hirer" && <HirerContextPanel conversation={conversation} />}
      </div>
    </div>
  );
}

function HirerContextPanel({ conversation }: { conversation: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Context</h4>
        {conversation.relatedEntityType === "freelancer_hire" && (
          <div className="bg-[#1A1A1D] p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Freelancer Hire</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-xs">Active</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">In progress.</p>
            <div className="flex flex-col gap-2">
              <button className="w-full py-2 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg font-medium transition-colors">
                Mark as Complete
              </button>
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
                View Contract/Brief
              </button>
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors border border-green-500/30 text-green-400 hover:text-green-300">
                Release Payment
              </button>
            </div>
          </div>
        )}
        {conversation.relatedEntityType === "project_proposal" && (
          <div className="bg-[#1A1A1D] p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Project Proposal</span>
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs">Reviewing</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">Awaiting your response</p>
            <div className="flex flex-col gap-2">
              <button className="w-full py-2 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg font-medium transition-colors">
                Accept Proposal
              </button>
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
                View Project
              </button>
            </div>
          </div>
        )}
        {!conversation.relatedEntityType && (
          <p className="text-gray-500 text-xs">General conversation</p>
        )}
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Shared Files</h4>
        <div className="text-gray-500 text-xs text-center py-4 bg-[#1A1A1D] rounded-xl border border-white/5">
          No files shared yet
        </div>
      </div>
    </div>
  );
}

function BrandContextPanel({ conversation }: { conversation: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Context</h4>
        {conversation.relatedEntityType === "freelancer_hire" && (
          <div className="bg-[#1A1A1D] p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Freelancer Hire</span>
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs">Pending</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">Awaiting proposal acceptance</p>
            <div className="flex flex-col gap-2">
              <button className="w-full py-2 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg font-medium transition-colors">
                Accept Proposal
              </button>
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
                View Profile
              </button>
            </div>
          </div>
        )}
        {conversation.relatedEntityType === "collaboration" && (
          <div className="bg-[#1A1A1D] p-3 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Collaboration</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-xs">Active</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">In progress. Escrow funded.</p>
            <div className="flex flex-col gap-2">
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
                View Contract
              </button>
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors border border-green-500/30 text-green-400 hover:text-green-300">
                Release Payment
              </button>
            </div>
          </div>
        )}
        {!conversation.relatedEntityType && (
          <p className="text-gray-500 text-xs">General conversation</p>
        )}
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Shared Files</h4>
        <div className="text-gray-500 text-xs text-center py-4 bg-[#1A1A1D] rounded-xl border border-white/5">
          No files shared yet
        </div>
      </div>
    </div>
  );
}

function FreelancerContextPanel({ conversation }: { conversation: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Job Details</h4>
        <div className="bg-[#1A1A1D] p-3 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Job Offer</span>
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs">Action Required</span>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <button className="w-full py-2 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg font-medium transition-colors">
              Accept Offer
            </button>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductOwnerContextPanel({ conversation }: { conversation: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Campaign Details</h4>
        <div className="bg-[#1A1A1D] p-3 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Promotion Request</span>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs">Reviewing</span>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <button className="w-full py-2 bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-lg font-medium transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
