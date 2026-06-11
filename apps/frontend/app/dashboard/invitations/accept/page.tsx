"use client";

import { Suspense, useEffect, useReducer } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { invitationApi, type InvitationPreview } from "@/lib/api";
import { useTranslations } from "next-intl";

type PageState =
  | { kind: "loading" }
  | { kind: "invalid-token" }
  | { kind: "preview"; preview: InvitationPreview }
  | { kind: "needs-login"; preview: InvitationPreview }
  | { kind: "email-mismatch"; preview: InvitationPreview }
  | { kind: "accepting" }
  | { kind: "accepted"; projectId: string; projectTitle: string }
  | { kind: "declining" }
  | { kind: "declined" }
  | {
      kind: "error"
      title: string
      message: string
    };

type Action =
  | { type: "invalid-token" }
  | { type: "preview-loaded"; preview: InvitationPreview }
  | { type: "preview-failed"; title: string; message: string }
  | { type: "needs-login"; preview: InvitationPreview }
  | { type: "accepting" }
  | { type: "accepted"; projectId: string; projectTitle: string }
  | { type: "declining" }
  | { type: "declined" }
  | { type: "error"; title: string; message: string };

function reducer(state: PageState, action: Action): PageState {
  switch (action.type) {
    case "invalid-token":
      return { kind: "invalid-token" };
    case "preview-loaded":
      return { kind: "preview", preview: action.preview };
    case "preview-failed":
      return { kind: "error", title: action.title, message: action.message };
    case "needs-login":
      return { kind: "needs-login", preview: action.preview };
    case "accepting":
      return { kind: "accepting" };
    case "accepted":
      return {
        kind: "accepted",
        projectId: action.projectId,
        projectTitle: action.projectTitle,
      };
    case "declining":
      return { kind: "declining" };
    case "declined":
      return { kind: "declined" };
    case "error":
      return { kind: "error", title: action.title, message: action.message };
  }
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslations("invitations.accept");
  const tCommon = useTranslations("common");

  const [state, dispatch] = useReducer(reducer, { kind: "loading" } as PageState);

  // Fetch preview when token is known
  useEffect(() => {
    if (!token) {
      dispatch({ type: "invalid-token" });
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await invitationApi.preview(token);
      if (cancelled) return;
      if (res.error || !res.data) {
        dispatch({
          type: "preview-failed",
          title: t("errorTitle"),
          message: res.error?.message ?? t("genericError"),
        });
        return;
      }
      dispatch({ type: "preview-loaded", preview: res.data });
    })();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  // Redirect to login (preserving token) if not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated && state.kind === "preview") {
      dispatch({ type: "needs-login", preview: state.preview });
    }
  }, [authLoading, isAuthenticated, state]);

  const handleAccept = async () => {
    if (state.kind !== "preview") return;
    dispatch({ type: "accepting" });
    const res = await invitationApi.accept(token);
    if (res.error || !res.data) {
      dispatch({
        type: "error",
        title: t("acceptFailed"),
        message: res.error?.message ?? t("genericError"),
      });
      return;
    }
    dispatch({
      type: "accepted",
      projectId: res.data.project.id,
      projectTitle: res.data.project.title,
    });
  };

  const handleDecline = async () => {
    dispatch({ type: "declining" });
    const res = await invitationApi.decline(token);
    if (res.error) {
      dispatch({
        type: "error",
        title: t("declineFailed"),
        message: res.error.message,
      });
      return;
    }
    dispatch({ type: "declined" });
  };

  if (state.kind === "loading") {
    return (
      <CenteredCard>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
        <p className="text-gray-500 text-sm mt-4">{tCommon("loading")}</p>
      </CenteredCard>
    );
  }

  if (state.kind === "invalid-token") {
    return (
      <CenteredCard>
        <XCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white mt-4">
          {t("invalidTokenTitle")}
        </h2>
        <p className="text-gray-400 text-sm mt-2">{t("invalidTokenMessage")}</p>
      </CenteredCard>
    );
  }

  if (state.kind === "needs-login") {
    const next = `/dashboard/invitations/accept?token=${encodeURIComponent(token)}`;
    const loginHref = `/login?next=${encodeURIComponent(next)}`;
    return (
      <CenteredCard>
        <Mail className="w-12 h-12 text-cyan-500 mx-auto" />
        <h2 className="text-lg font-semibold text-white mt-4">
          {t("loginRequiredTitle")}
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm">
          {t("loginRequiredMessage", {
            email: state.preview.invitation.email,
            project: state.preview.invitation.project.title,
          })}
        </p>
        <div className="flex gap-3 mt-6">
          <Link
            href={loginHref}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition-colors inline-flex items-center gap-2"
          >
            {t("goToLogin")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CenteredCard>
    );
  }

  if (state.kind === "email-mismatch") {
    return (
      <CenteredCard>
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
        <h2 className="text-lg font-semibold text-white mt-4">
          {t("emailMismatchTitle")}
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm">
          {t("emailMismatchMessage", {
            expected: state.preview.invitation.email,
            current: user?.email ?? "",
          })}
        </p>
        <p className="text-gray-500 text-xs mt-4">
          {t("emailMismatchHint")}
        </p>
      </CenteredCard>
    );
  }

  if (state.kind === "accepting" || state.kind === "declining") {
    return (
      <CenteredCard>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
        <p className="text-gray-500 text-sm mt-4">
          {state.kind === "accepting" ? t("accepting") : t("declining")}
        </p>
      </CenteredCard>
    );
  }

  if (state.kind === "accepted") {
    return (
      <CenteredCard>
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white mt-4">
          {t("acceptedTitle")}
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm">
          {t("acceptedMessage", { project: state.projectTitle })}
        </p>
        <div className="flex gap-3 mt-6">
          <Link
            href={`/dashboard/projects/${state.projectId}`}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition-colors inline-flex items-center gap-2"
          >
            {t("goToProject")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg border border-[#333] text-white text-sm hover:border-gray-500 transition-colors"
          >
            {t("backToDashboard")}
          </Link>
        </div>
      </CenteredCard>
    );
  }

  if (state.kind === "declined") {
    return (
      <CenteredCard>
        <XCircle className="w-12 h-12 text-gray-500 mx-auto" />
        <h2 className="text-lg font-semibold text-white mt-4">
          {t("declinedTitle")}
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm">
          {t("declinedMessage")}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 px-5 py-2.5 rounded-lg border border-[#333] text-white text-sm hover:border-gray-500 transition-colors inline-block"
        >
          {t("backToDashboard")}
        </Link>
      </CenteredCard>
    );
  }

  if (state.kind === "error") {
    return (
      <CenteredCard>
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-semibold text-white mt-4">{state.title}</h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm">{state.message}</p>
        <Link
          href="/dashboard"
          className="mt-6 px-5 py-2.5 rounded-lg border border-[#333] text-white text-sm hover:border-gray-500 transition-colors inline-block"
        >
          {t("backToDashboard")}
        </Link>
      </CenteredCard>
    );
  }

  // Preview state
  const preview = state.preview.invitation;
  const expiresAt = new Date(preview.expiresAt);

  return (
    <CenteredCard>
      <div className="w-12 h-12 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mx-auto">
        <Mail className="w-6 h-6 text-black" />
      </div>
      <h2 className="text-lg font-semibold text-white mt-4">
        {t("previewTitle")}
      </h2>

      <div className="mt-6 w-full text-left space-y-3">
        <DetailRow icon={User} label={t("invitedBy")} value={preview.invitedBy.name} />
        <DetailRow icon={Mail} label={t("project")} value={preview.project.title} />
        <DetailRow
          icon={CheckCircle2}
          label={t("role")}
          value={
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                preview.role === "MANAGER"
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  : preview.role === "REVIEWER"
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                  : preview.role === "VALIDATOR"
                  ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                  : "bg-gray-500/15 text-gray-400 border-gray-500/30"
              }`}
            >
              {preview.role}
            </span>
          }
        />
        <DetailRow
          icon={Clock}
          label={t("expiresAt")}
          value={expiresAt.toLocaleString()}
        />
      </div>

      <div className="flex gap-3 mt-8 w-full">
        <button
          onClick={handleAccept}
          className="flex-1 px-5 py-2.5 rounded-lg bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 transition-colors"
        >
          {t("accept")}
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 px-5 py-2.5 rounded-lg border border-[#333] text-white text-sm hover:border-red-500/50 hover:text-red-400 transition-colors"
        >
          {t("decline")}
        </button>
      </div>
    </CenteredCard>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-2.5 rounded-lg bg-[#0A0A0A] border border-[#262626]">
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
          {label}
        </p>
        <div className="text-sm text-white mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-[#1A1D21] border border-[#262626] rounded-2xl p-8 text-center">
        {children}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <CenteredCard>
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
        </CenteredCard>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
