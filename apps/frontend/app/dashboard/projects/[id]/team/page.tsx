"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  UserPlus,
  Mail,
  Trash2,
  ChevronDown,
  Loader2,
  X,
  Shield,
  Check,
  RotateCw,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  projectApi,
  userApi,
  Project,
  ProjectMember,
  ProjectInvitation,
  UserSearchResult,
} from "@/lib/api";
import { useTranslations } from "next-intl";

const ROLES = ["MANAGER", "REVIEWER", "VALIDATOR", "VIEWER"] as const;
type Role = (typeof ROLES)[number];

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
  MANAGER: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  REVIEWER: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  VALIDATOR: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  VIEWER: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const invitationStatusStyles: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  ACCEPTED: "bg-green-500/15 text-green-400 border-green-500/30",
  DECLINED: "bg-red-500/15 text-red-400 border-red-500/30",
  EXPIRED: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  REVOKED: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function formatRelative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const absMin = Math.round(Math.abs(diff) / 60000);
  if (absMin < 60) return diff > 0 ? `in ${absMin}m` : `${absMin}m ago`;
  const absHr = Math.round(absMin / 60);
  if (absHr < 24) return diff > 0 ? `in ${absHr}h` : `${absHr}h ago`;
  const absDay = Math.round(absHr / 24);
  return diff > 0 ? `in ${absDay}d` : `${absDay}d ago`;
}

export default function TeamManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Mode switch
  const [addMode, setAddMode] = useState<"search" | "email">("email");

  // Email-invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("REVIEWER");
  const [isInviting, setIsInviting] = useState(false);

  // User-search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  // Role edit / remove
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // Invitation actions
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Feedback
  const [successMessage, setSuccessMessage] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentMember = members.find((m) => m.userId === user?.id);
  const canManage =
    currentMember?.role === "ADMIN" ||
    currentMember?.role === "MANAGER" ||
    project?.creator?.id === user?.id;

  const t = useTranslations("projects.team");
  const tErr = useTranslations("errors");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !projectId) return;
    setIsLoading(true);

    const [projectRes, membersRes, invitationsRes] = await Promise.all([
      projectApi.get(projectId),
      projectApi.getMembers(projectId),
      projectApi.getInvitations(projectId).catch(() => null),
    ]);

    if (projectRes.error) {
      setError(projectRes.error.message);
    } else if (projectRes.data) {
      setProject(projectRes.data.project);
    }
    if (membersRes.data) {
      setMembers(membersRes.data.members);
    }
    if (invitationsRes?.data) {
      setInvitations(invitationsRes.data.invitations);
    }

    setIsLoading(false);
  }, [isAuthenticated, projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const existingUserIds = members.map((m) => m.userId);
      const res = await userApi.search(searchQuery, existingUserIds);
      if (res.data) {
        setSearchResults(res.data.users);
        setShowDropdown(true);
      }
      setIsSearching(false);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, members]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleInviteByEmail = async () => {
    const email = inviteEmail.trim();
    if (!isValidEmail(email)) {
      setError(t("invalidEmail"));
      return;
    }
    setIsInviting(true);
    setError("");
    const res = await projectApi.inviteMember(projectId, {
      email,
      role: selectedRole,
    });
    if (res.error) {
      setError(res.error.message);
    } else {
      showSuccess(t("inviteSent", { email }));
      setInviteEmail("");
      await fetchData();
    }
    setIsInviting(false);
  };

  const handleAddExistingMember = async (userResult: UserSearchResult) => {
    setAddingUserId(userResult.id);
    const res = await projectApi.addMember(projectId, {
      userId: userResult.id,
      role: selectedRole,
    });
    if (res.error) {
      setError(res.error.message);
    } else {
      showSuccess(t("addedAs", { name: userResult.name, role: selectedRole }));
      setSearchQuery("");
      setShowDropdown(false);
      await fetchData();
    }
    setAddingUserId(null);
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    const res = await projectApi.updateMemberRole(projectId, memberId, newRole);
    if (res.error) {
      setError(res.error.message);
    } else {
      showSuccess(t("roleUpdated"));
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
    }
    setEditingMemberId(null);
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMemberId(memberId);
    const res = await projectApi.removeMember(projectId, memberId);
    if (res.error) {
      setError(res.error.message);
    } else {
      showSuccess(t("memberRemoved"));
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
    setRemovingMemberId(null);
  };

  const handleResendInvitation = async (invitationId: string) => {
    setResendingId(invitationId);
    const res = await projectApi.resendInvitation(projectId, invitationId);
    if (res.error) {
      setError(res.error.message);
    } else {
      showSuccess(t("inviteResent"));
      await fetchData();
    }
    setResendingId(null);
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    setRevokingId(invitationId);
    const res = await projectApi.revokeInvitation(projectId, invitationId);
    if (res.error) {
      setError(res.error.message);
    } else {
      showSuccess(t("inviteRevoked"));
      await fetchData();
    }
    setRevokingId(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t("backToProject")}
        </Link>
        <div className="p-12 bg-[#1A1D21] border border-[#262626] rounded-xl text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            {tErr("projectNotFoundOrNoAccess")}
          </h2>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const pendingInvitations = invitations.filter((i) => i.status === "PENDING");
  const pastInvitations = invitations.filter((i) => i.status !== "PENDING");

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {t("backToProject")}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-bold text-white">
              {t("teamMembers")}
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            {project?.title} — {members.length}{" "}
            {members.length !== 1 ? t("members") : t("member")}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {error && project && (
        <div className="mb-6 flex items-center justify-between px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <span>{error}</span>
          <button onClick={() => setError("")} className="hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {canManage && (
        <div className="bg-[#1A1D21] border border-[#262626] rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {t("addMembers")}
          </h2>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-4 text-xs">
            <button
              onClick={() => setAddMode("email")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                addMode === "email"
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                  : "border-[#333] text-gray-500 hover:border-gray-400 hover:text-gray-300"
              }`}
            >
              <Mail className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              {t("inviteByEmail")}
            </button>
            <button
              onClick={() => setAddMode("search")}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                addMode === "search"
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                  : "border-[#333] text-gray-500 hover:border-gray-400 hover:text-gray-300"
              }`}
            >
              <Search className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              {t("addExistingUser")}
            </button>
          </div>

          {addMode === "email" ? (
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="appearance-none h-11 pl-4 pr-9 rounded-lg bg-[#0A0A0A] border border-[#333] text-white text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInviteByEmail();
                  }}
                  disabled={isInviting}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#0A0A0A] border border-[#333] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                />
              </div>

              <button
                onClick={handleInviteByEmail}
                disabled={isInviting || !isValidEmail(inviteEmail)}
                className="h-11 px-5 rounded-lg bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isInviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {t("sendInvitation")}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="appearance-none h-11 pl-4 pr-9 rounded-lg bg-[#0A0A0A] border border-[#333] text-white text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div ref={searchRef} className="relative flex-1">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchResults.length > 0 && setShowDropdown(true)
                  }
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#0A0A0A] border border-[#333] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-cyan-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}

                {showDropdown && (
                  <div className="absolute z-50 top-full mt-2 w-full bg-[#1A1D21] border border-[#333] rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        {searchQuery.length < 2
                          ? t("typeAtLeast2Chars")
                          : t("noUsersFound")}
                      </div>
                    ) : (
                      searchResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleAddExistingMember(u)}
                          disabled={addingUserId === u.id}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#262626] transition-colors text-left disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-black text-xs font-bold shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {u.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                @{u.username}
                                {u.email && ` · ${u.email}`}
                              </p>
                            </div>
                          </div>
                          {addingUserId === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                          ) : (
                            <span className="text-xs text-cyan-500 font-medium shrink-0">
                              {t("addAs", { role: selectedRole })}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{t("inviteHint")}</span>
          </p>
        </div>
      )}

      {/* Pending Invitations */}
      {canManage && pendingInvitations.length > 0 && (
        <div className="bg-[#1A1D21] border border-[#262626] rounded-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              {t("pendingInvitations")}
            </h2>
            <span className="text-xs text-gray-600">
              {pendingInvitations.length}
            </span>
          </div>
          <div className="divide-y divide-[#262626]">
            {pendingInvitations.map((inv) => {
              const isResending = resendingId === inv.id;
              const isRevoking = revokingId === inv.id;
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-6 py-4 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#333] flex items-center justify-center text-gray-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {inv.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("invitedBy", {
                          name: inv.invitedBy.name,
                          when: formatRelative(inv.createdAt),
                        })}{" "}
                        ·{" "}
                        {t("expiresIn", {
                          when: formatRelative(inv.expiresAt),
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                        roleColors[inv.role] || roleColors.VIEWER
                      }`}
                    >
                      {inv.role}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        invitationStatusStyles[inv.status]
                      }`}
                    >
                      {inv.status}
                    </span>
                    <button
                      onClick={() => handleResendInvitation(inv.id)}
                      disabled={isResending}
                      className="text-gray-600 hover:text-cyan-400 transition-colors disabled:opacity-50"
                      title={t("resend")}
                    >
                      {isResending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCw className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRevokeInvitation(inv.id)}
                      disabled={isRevoking}
                      className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
                      title={t("revoke")}
                    >
                      {isRevoking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="bg-[#1A1D21] border border-[#262626] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {t("currentMembers")}
          </h2>
          <span className="text-xs text-gray-600">
            {members.length} {members.length !== 1 ? t("members") : t("member")}
          </span>
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">
            {t("noTeamMembersYet")}
          </div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {members.map((member) => {
              const isCreator = member.userId === project?.creator?.id;
              const isSelf = member.userId === user?.id;
              const isEditing = editingMemberId === member.id;
              const isRemoving = removingMemberId === member.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-6 py-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-black text-sm font-bold shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {member.name}
                        </p>
                        {isCreator && (
                          <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/30">
                            {t("creator")}
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                            {t("you")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        @{member.username}
                        {member.email && ` · ${member.email}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        {ROLES.map((role) => (
                          <button
                            key={role}
                            onClick={() => handleUpdateRole(member.id, role)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                              member.role === role
                                ? roleColors[role]
                                : "border-[#333] text-gray-500 hover:border-gray-400 hover:text-gray-300"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                        <button
                          onClick={() => setEditingMemberId(null)}
                          className="text-gray-500 hover:text-white ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          canManage && !isCreator
                            ? setEditingMemberId(member.id)
                            : undefined
                        }
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                          roleColors[member.role] || roleColors.VIEWER
                        } ${
                          canManage && !isCreator
                            ? "cursor-pointer hover:opacity-80"
                            : "cursor-default"
                        }`}
                        title={
                          canManage && !isCreator
                            ? t("clickToChangeRole")
                            : undefined
                        }
                      >
                        {member.role}
                      </button>
                    )}

                    {canManage && !isCreator && !isSelf && !isEditing && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isRemoving}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all disabled:opacity-50"
                        title="Remove member"
                      >
                        {isRemoving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History of past invitations */}
      {canManage && pastInvitations.length > 0 && (
        <div className="bg-[#1A1D21] border border-[#262626] rounded-xl overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {t("invitationHistory")}
            </h2>
            <span className="text-xs text-gray-600">
              {pastInvitations.length}
            </span>
          </div>
          <div className="divide-y divide-[#262626]">
            {pastInvitations.slice(0, 10).map((inv) => {
              const StatusIcon =
                inv.status === "ACCEPTED"
                  ? CheckCircle2
                  : inv.status === "DECLINED"
                    ? XCircle
                    : Ban;
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-6 py-3 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon
                      className={`w-4 h-4 shrink-0 ${
                        inv.status === "ACCEPTED"
                          ? "text-green-400"
                          : inv.status === "DECLINED"
                            ? "text-red-400"
                            : "text-gray-500"
                      }`}
                    />
                    <span className="text-white truncate">{inv.email}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        invitationStatusStyles[inv.status]
                      }`}
                    >
                      {inv.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelative(
                        inv.acceptedAt || inv.declinedAt || inv.createdAt,
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!canManage && (
        <div className="mt-6 flex items-center gap-2 text-gray-600 text-xs">
          <Shield className="w-4 h-4" />
          {t("onlyManagersCanManage")}
        </div>
      )}
    </div>
  );
}
