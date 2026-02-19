"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Plus, Eye, Copy, Trash2, RotateCw, FileText, Loader2, Save, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { api } from "@/lib/api";

type SettingsTab = "profile" | "institutional" | "apikeys" | "notifications";

interface NotifPref {
    key: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    enabled: boolean;
}

export default function SettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

    // Profile form state — initialized from the auth user
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    // Notification prefs (local state, toggleable)
    const [notifPrefs, setNotifPrefs] = useState<NotifPref[]>([
        {
            key: "citation",
            title: "New Citation Found",
            desc: "Get notified when someone cites your published research.",
            icon: <FileText className="w-5 h-5 text-cyan-500" />,
            enabled: true,
        },
        {
            key: "collab",
            title: "Collaboration Requests",
            desc: "Alerts for pending invitations to join research teams.",
            icon: <User className="w-5 h-5 text-blue-500" />,
            enabled: true,
        },
        {
            key: "system",
            title: "System Updates",
            desc: "Weekly digest of platform changes and new features.",
            icon: <RotateCw className="w-5 h-5 text-gray-400" />,
            enabled: false,
        },
    ]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    // Initialize form from user
    useEffect(() => {
        if (user) {
            setFullName(user.name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const toggleNotif = (key: string) => {
        setNotifPrefs((prev) =>
            prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg("");
        // Call the backend to update profile
        const res = await api.put<{ user: { name: string; email: string } }>("/api/v1/auth/profile", {
            name: fullName,
            email,
        });
        if (res.error) {
            setSaveMsg(`Error: ${res.error.message}`);
        } else {
            setSaveMsg("Settings saved successfully.");
        }
        setSaving(false);
        setTimeout(() => setSaveMsg(""), 3000);
    };

    const handleDiscard = () => {
        if (user) {
            setFullName(user.name || "");
            setEmail(user.email || "");
            setBio("");
        }
        setSaveMsg("");
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    if (!isAuthenticated || !user) return null;

    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "U";

    const tabs: { key: SettingsTab; label: string }[] = [
        { key: "profile", label: "Profile" },
        { key: "institutional", label: "Institutional Access" },
        { key: "apikeys", label: "API Keys" },
        { key: "notifications", label: "Notifications" },
    ];

    return (
        <div className="flex-1 p-8 max-w-5xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400 mb-6">
                    Manage your researcher profile, security preferences, and integration keys.
                </p>

                <div className="flex gap-8 border-b border-[#262626]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-bold transition-colors ${activeTab === tab.key
                                    ? "text-cyan-500 border-b-2 border-cyan-500"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Save message */}
            {saveMsg && (
                <div
                    className={`p-3 rounded-lg text-sm font-medium flex items-center justify-between ${saveMsg.startsWith("Error")
                            ? "bg-red-500/10 border border-red-500/30 text-red-400"
                            : "bg-green-500/10 border border-green-500/30 text-green-400"
                        }`}
                >
                    {saveMsg}
                    <button onClick={() => setSaveMsg("")}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Personal Information */}
            {activeTab === "profile" && (
                <section>
                    <h2 className="text-lg font-bold text-white mb-6">Personal Information</h2>
                    <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-8">
                        <div className="flex items-start gap-6 mb-8">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
                                            {initials}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                                <p className="text-cyan-500 text-sm mb-4">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                                Biography
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about your research focus..."
                                className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 h-24 resize-none"
                            ></textarea>
                        </div>
                    </div>
                </section>
            )}

            {/* Institutional Access */}
            {activeTab === "institutional" && (
                <section>
                    <h2 className="text-lg font-bold text-white mb-6">Institutional Access</h2>
                    <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-8 text-center">
                        <p className="text-gray-400 mb-4">
                            Connect your institutional credentials to access licensed databases and journals.
                        </p>
                        <p className="text-gray-600 text-sm">This feature is coming soon.</p>
                    </div>
                </section>
            )}

            {/* API Keys */}
            {activeTab === "apikeys" && (
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white">API Keys</h2>
                            <p className="text-gray-400 text-sm">
                                Use these keys to authenticate with the NeoReLiS REST API.
                            </p>
                        </div>
                        <button className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold px-4 py-2 rounded flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Generate New Key
                        </button>
                    </div>

                    <div className="bg-[#0F1115] border border-[#262626] rounded-xl overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#1A1D21] border-b border-[#262626] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-3">KEY NAME</div>
                            <div className="col-span-5">API KEY</div>
                            <div className="col-span-2">CREATED</div>
                            <div className="col-span-2 text-right">ACTIONS</div>
                        </div>
                        {/* Empty state */}
                        <div className="px-6 py-12 text-center text-gray-500 text-sm">
                            No API keys generated yet. Click &quot;Generate New Key&quot; to create one.
                        </div>
                    </div>
                </section>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
                <section className="space-y-4">
                    {notifPrefs.map((pref) => (
                        <div
                            key={pref.key}
                            className="bg-[#0F1115] border border-[#262626] rounded-xl p-5 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#1A1D21] flex items-center justify-center">
                                    {pref.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{pref.title}</h3>
                                    <p className="text-xs text-gray-500">{pref.desc}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleNotif(pref.key)}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${pref.enabled ? "bg-cyan-500" : "bg-[#333]"
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pref.enabled ? "translate-x-6" : "translate-x-0"
                                        }`}
                                ></div>
                            </button>
                        </div>
                    ))}
                </section>
            )}

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-64 right-0 p-6 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-[#262626] flex justify-end gap-4">
                <button
                    onClick={handleDiscard}
                    className="px-6 py-2.5 rounded border border-[#333] text-gray-400 text-sm font-bold hover:text-white hover:bg-[#1A1D21] transition-colors"
                >
                    Discard Changes
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 rounded bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
