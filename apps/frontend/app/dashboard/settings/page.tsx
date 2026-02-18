import { User, Plus, Check, Eye, Copy, Trash2, RotateCw, FileText } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
    return (
        <div className="flex-1 p-8 max-w-5xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400 mb-6">Manage your researcher profile, security preferences, and integration keys.</p>

                <div className="flex gap-8 border-b border-[#262626]">
                    <button className="pb-3 text-sm font-bold text-cyan-500 border-b-2 border-cyan-500">Profile</button>
                    <button className="pb-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">Institutional Access</button>
                    <button className="pb-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">API Keys</button>
                    <button className="pb-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">Notifications</button>
                </div>
            </div>

            {/* Personal Information */}
            <section>
                <h2 className="text-lg font-bold text-white mb-6">Personal Information</h2>
                <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-8">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                    {/* Avatar Placeholder */}
                                    <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
                                    {/* Add Image if available, falling back to icon */}
                                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">AR</div>
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-black hover:bg-cyan-400 border border-[#0F1115]">
                                <span className="text-xs">✎</span>
                            </button>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">Alex Rivers</h3>
                            <p className="text-gray-400 text-sm mb-1">Senior Researcher • University of Quantum Physics</p>
                            <p className="text-cyan-500 text-sm mb-4">alex.rivers@university.edu</p>
                            <button className="bg-[#1A1D21] border border-[#333] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#222]">
                                Change Avatar
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Full Name</label>
                            <input type="text" defaultValue="Alex Rivers" className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Email Address</label>
                            <input type="email" defaultValue="alex.rivers@university.edu" className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Biography</label>
                        <textarea defaultValue="Focused on neural network optimization and high-energy particle simulations." className="w-full bg-[#1A1D21] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 h-24 resize-none"></textarea>
                    </div>
                </div>
            </section>

            {/* API Keys */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">API Keys</h2>
                        <p className="text-gray-400 text-sm">Use these keys to authenticate with the ReLiS REST API.</p>
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

                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#262626] items-center hover:bg-[#1A1D21]/50 transition-colors">
                        <div className="col-span-3 text-sm font-bold text-white">Research_Alpha_Test</div>
                        <div className="col-span-5 text-xs text-gray-400 font-mono bg-[#0A0A0A] px-2 py-1 rounded w-fit">relis_sk_••••••••••••••••4f29</div>
                        <div className="col-span-2 text-xs text-gray-500">Oct 12, 2023</div>
                        <div className="col-span-2 flex justify-end gap-2 text-gray-400">
                            <Eye className="w-4 h-4 hover:text-white cursor-pointer" />
                            <Copy className="w-4 h-4 hover:text-white cursor-pointer" />
                            <Trash2 className="w-4 h-4 hover:text-red-500 cursor-pointer" />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1A1D21]/50 transition-colors opacity-50">
                        <div className="col-span-3 text-sm font-medium text-gray-400">Old_Project_Key</div>
                        <div className="col-span-5 text-xs text-gray-500 font-mono bg-[#0A0A0A] px-2 py-1 rounded w-fit">relis_sk_••••••••••••••••92a1</div>
                        <div className="col-span-2 text-xs text-gray-500">Jan 05, 2024</div>
                        <div className="col-span-2 flex justify-end gap-2 text-gray-400">
                            <Eye className="w-4 h-4 hover:text-white cursor-pointer" />
                            <Copy className="w-4 h-4 hover:text-white cursor-pointer" />
                            <Trash2 className="w-4 h-4 hover:text-red-500 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="space-y-4">
                <NotificationToggle
                    icon={<FileText className="w-5 h-5 text-cyan-500" />}
                    title="New Citation Found"
                    desc="Get notified when someone cites your published research."
                    checked
                />
                <NotificationToggle
                    icon={<User className="w-5 h-5 text-blue-500" />}
                    title="Collaboration Requests"
                    desc="Alerts for pending invitations to join research teams."
                    checked
                />
                <NotificationToggle
                    icon={<RotateCw className="w-5 h-5 text-gray-400" />}
                    title="System Updates"
                    desc="Weekly digest of platform changes and new features."
                />
            </section>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-64 right-0 p-6 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-[#262626] flex justify-end gap-4">
                <button className="px-6 py-2.5 rounded border border-[#333] text-gray-400 text-sm font-bold hover:text-white hover:bg-[#1A1D21] transition-colors">
                    Discard Changes
                </button>
                <button className="px-6 py-2.5 rounded bg-cyan-500 text-black text-sm font-bold hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function NotificationToggle({ icon, title, desc, checked }: any) {
    return (
        <div className="bg-[#0F1115] border border-[#262626] rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1A1D21] flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <p className="text-xs text-gray-500">{desc}</p>
                </div>
            </div>

            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-cyan-500' : 'bg-[#333]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
        </div>
    )
}
