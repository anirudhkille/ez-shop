import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
    User, Mail, Phone, Calendar, Edit3, Save, X, LogOut,
    Heart, Settings, Shield, Camera, CheckCircle, Package, MapPin, ChevronRight, RefreshCcw, Truck, Lock, Bell
} from "lucide-react";

import useUserStore from "@/store/userStore";
import { formatPrice } from "@/lib/formatPrice";
import { useMyOrders } from "@/hooks/useOrder";
import { useWishlistDetails, useToggleWishlist } from "@/hooks/useWishlist";
import { useUpdateProfile } from "@/hooks/useUser";
import type { TProduct } from "@/types/product";
import { toast } from "sonner";

const tabs = ["Overview", "Orders", "Wishlist", "Settings"] as const;
type Tab = typeof tabs[number];

const statusColor: Record<string, string> = {
    Delivered: "text-green-400 bg-green-400/10 border-green-400/20",
    Shipped: "text-brand-orange bg-brand-orange/10 border-brand-orange/20",
    Processing: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

export default function Profile() {
    const { name, email, logout } = useUserStore();
    const navigate = useNavigate();
    const { data: orders } = useMyOrders();
    const { data: wishlistData } = useWishlistDetails();
    const { mutate: toggleWishlist } = useToggleWishlist();
    const { mutate: updateProfile } = useUpdateProfile();

    const wishlistProducts: TProduct[] = wishlistData?.products ?? [];

    const displayName = name || "User";
    const createdAt = new Date().toISOString();

    const [activeTab, setActiveTab] = useState<Tab>("Overview");
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        displayName: displayName,
        phone: "",
        gender: "",
        dob: "",
    });
    const [saved, setSaved] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const [settingsSection, setSettingsSection] = useState<string | null>(null);

    if (!email) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="font-display text-3xl font-black uppercase text-foreground">Sign in required</p>
                    <Link to="/auth/login" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-orange text-primary-foreground font-body font-semibold text-sm uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        updateProfile({ name: form.displayName });
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const avatarInitial = (displayName[0] ?? email[0]).toUpperCase();

    return (
        <div className="text-foreground">
            <main className="pt-24 pb-20">
                <div className="max-w-[1200px] mx-auto px-5 sm:px-10">

                    {/* Profile hero */}
                    <div className="relative bg-card border border-brand-border rounded-3xl overflow-hidden mb-8">
                        <div className="h-32 bg-gradient-to-r from-brand-orange/20 via-brand-orange/5 to-transparent" />

                        <div className="px-6 sm:px-8 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 rounded-2xl border-4 border-background bg-brand-surface-raised flex items-center justify-center overflow-hidden">
                                    <span className="font-display text-4xl font-black text-brand-orange">{avatarInitial}</span>
                                </div>
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-brand-orange flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
                                >
                                    <Camera size={14} className="text-primary-foreground" />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="font-display text-3xl font-black uppercase text-foreground">{displayName}</h1>
                                </div>
                                <p className="font-body text-sm text-muted-foreground mt-1">{email}</p>
                                <p className="font-body text-xs text-muted-foreground mt-1">
                                    Member since {new Date(createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                                </p>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-brand-border rounded-xl font-body text-sm text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-all duration-200"
                                >
                                    <LogOut size={14} /> Sign out
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-brand-border grid grid-cols-3 divide-x divide-brand-border">
                            {[
                                { label: "Orders", value: orders?.length ?? 0 },
                                { label: "Wishlist", value: wishlistProducts.length },
                                { label: "Reviews", value: 0 },
                            ].map((s) => (
                                <div key={s.label} className="py-4 text-center">
                                    <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                                    <p className="font-body text-xs text-muted-foreground mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-8 bg-card border border-brand-border rounded-2xl p-1.5 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setSettingsSection(null); }}
                                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-body text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab ? "bg-brand-orange text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab panels */}
                    {activeTab === "Overview" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
                            <div className="bg-card border border-brand-border rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="font-display text-xl font-bold uppercase text-foreground">Personal Info</h2>
                                    {!editing ? (
                                        <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 font-body text-sm text-brand-orange hover:text-brand-orange/80 transition-colors">
                                            <Edit3 size={14} /> Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditing(false)} className="flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
                                                <X size={14} /> Cancel
                                            </button>
                                            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-orange text-primary-foreground rounded-lg font-body text-sm font-semibold hover:opacity-90 transition-opacity">
                                                <Save size={14} /> Save
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {saved && <p className="font-body text-xs text-green-400 mb-4">Profile updated successfully</p>}

                                <div className="space-y-4">
                                    <div>
                                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1.5">
                                            <User size={11} /> Display Name
                                        </label>
                                        {editing ? (
                                            <input
                                                type="text"
                                                value={form.displayName}
                                                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                                                className="w-full bg-background border border-brand-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-brand-orange transition-colors"
                                            />
                                        ) : (
                                            <p className="font-body text-sm text-foreground">{displayName || <span className="text-muted-foreground italic">Not set</span>}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1.5">
                                            <Phone size={11} /> Phone
                                        </label>
                                        {editing ? (
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                className="w-full bg-background border border-brand-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-brand-orange transition-colors"
                                            />
                                        ) : (
                                            <p className="font-body text-sm text-foreground">{form.phone || <span className="text-muted-foreground italic">Not set</span>}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1.5">
                                            <Calendar size={11} /> Date of Birth
                                        </label>
                                        {editing ? (
                                            <input
                                                type="date"
                                                value={form.dob}
                                                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                                className="w-full bg-background border border-brand-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-brand-orange transition-colors"
                                            />
                                        ) : (
                                            <p className="font-body text-sm text-foreground">{form.dob || <span className="text-muted-foreground italic">Not set</span>}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1.5">
                                            <User size={11} /> Gender
                                        </label>
                                        {editing ? (
                                            <select
                                                value={form.gender}
                                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                                className="w-full bg-background border border-brand-border rounded-xl px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-brand-orange transition-colors"
                                            >
                                                <option value="">Prefer not to say</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Non-binary">Non-binary</option>
                                            </select>
                                        ) : (
                                            <p className="font-body text-sm text-foreground">{form.gender || <span className="text-muted-foreground italic">Not set</span>}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1.5">
                                            <Mail size={11} /> Email
                                        </label>
                                        <p className="font-body text-sm text-foreground">{email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-brand-border rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="font-display text-xl font-bold uppercase text-foreground">Recent Order</h2>
                                    <button onClick={() => setActiveTab("Orders")} className="font-body text-sm text-brand-orange hover:text-brand-orange/80 transition-colors">View all</button>
                                </div>
                                {(orders ?? []).slice(0, 2).map((order: any) => (
                                    <div key={order._id} className="flex items-center justify-between py-4 border-b border-brand-border/50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brand-surface-raised flex items-center justify-center">
                                                <Package size={18} className="text-brand-orange" />
                                            </div>
                                            <div>
                                                <p className="font-body text-sm font-semibold text-foreground">#{order._id?.slice(-6).toUpperCase()}</p>
                                                <p className="font-body text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · {order.products?.length ?? 0} item{(order.products?.length ?? 0) > 1 ? "s" : ""}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-display text-base font-bold text-brand-orange">{formatPrice(order.totalAmount)}</p>
                                            <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full border ${statusColor[order.orderStatus] || "text-muted-foreground border-brand-border"}`}>{order.orderStatus}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!orders || orders.length === 0) && (
                                    <p className="font-body text-sm text-muted-foreground text-center py-8">No orders yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "Orders" && (
                        <div className="space-y-4 animate-fade-in-up">
                            {(orders ?? []).length === 0 ? (
                                <div className="text-center py-16">
                                    <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="font-body text-muted-foreground">No orders found</p>
                                    <Link to="/products" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-orange text-primary-foreground font-body text-sm font-semibold rounded-full">
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                (orders ?? []).map((order: any) => (
                                    <div key={order._id} className="bg-card border border-brand-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-brand-orange/30 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-brand-surface-raised flex items-center justify-center shrink-0">
                                            <Package size={22} className="text-brand-orange" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <h3 className="font-display text-lg font-bold text-foreground">#{order._id?.slice(-6).toUpperCase()}</h3>
                                                <span className={`text-[10px] font-body font-semibold px-2.5 py-1 rounded-full border ${statusColor[order.orderStatus] || "text-muted-foreground border-brand-border"}`}>{order.orderStatus}</span>
                                            </div>
                                            <p className="font-body text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · {order.products?.length ?? 0} item{(order.products?.length ?? 0) > 1 ? "s" : ""}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-display text-xl font-bold text-brand-orange">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-muted-foreground" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "Wishlist" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
                            {wishlistProducts.length === 0 ? (
                                <div className="col-span-full text-center py-16">
                                    <Heart size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="font-body text-muted-foreground">Your wishlist is empty</p>
                                    <Link to="/products" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-orange text-primary-foreground font-body text-sm font-semibold rounded-full">
                                        Browse Products
                                    </Link>
                                </div>
                            ) : (
                                wishlistProducts.map((p: TProduct) => (
                                    <div key={p._id} className="group bg-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-orange/40 transition-all duration-300 hover:-translate-y-1 relative">
                                        <button
                                            onClick={() => toggleWishlist(p._id)}
                                            className="absolute top-3 right-3 z-10 bg-background/80 rounded-full p-1.5"
                                        >
                                            <Heart size={14} className="fill-red-500 text-red-500" />
                                        </button>
                                        <Link to={`/${p.slug}/${p._id}`}>
                                            <div className="aspect-square bg-brand-surface-raised flex items-center justify-center p-6">
                                                <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                            <div className="p-4">
                                                <p className="font-display font-bold text-foreground text-sm truncate">{p.name}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="font-display font-bold text-brand-orange">{formatPrice(p.discountPrice || p.price)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "Settings" && !settingsSection && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                            {[
                                { icon: Mail, title: "Email Preferences", desc: "Manage newsletters and order alerts", key: "email" },
                                { icon: MapPin, title: "Saved Addresses", desc: "Manage your shipping and billing addresses", key: "addresses" },
                                { icon: Lock, title: "Security", desc: "Password and account security", key: "security" },
                                { icon: Settings, title: "Account", desc: "Account preferences and data", key: "account" },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setSettingsSection(item.key)}
                                    className="bg-card border border-brand-border rounded-2xl p-6 flex items-center gap-4 hover:border-brand-orange/30 transition-colors group text-left w-full"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-brand-surface-raised flex items-center justify-center shrink-0">
                                        <item.icon size={20} className="text-brand-orange" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-body font-semibold text-foreground">{item.title}</h3>
                                        <p className="font-body text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-1 transition-all duration-200" />
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === "Settings" && settingsSection === "addresses" && (
                        <div className="animate-fade-in-up">
                            <button onClick={() => setSettingsSection(null)} className="font-body text-sm text-brand-orange hover:text-brand-orange/80 transition-colors mb-6 flex items-center gap-1">
                                <ChevronRight size={14} className="rotate-180" /> Back to Settings
                            </button>
                            <div className="bg-card border border-brand-border rounded-2xl p-6">
                                <h2 className="font-display text-xl font-bold uppercase text-foreground mb-4">Saved Addresses</h2>
                                <p className="font-body text-sm text-muted-foreground">
                                    <Link to="/account/delivery-addresses" className="text-brand-orange hover:underline">Manage your addresses here</Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "Settings" && settingsSection === "security" && (
                        <div className="animate-fade-in-up">
                            <button onClick={() => setSettingsSection(null)} className="font-body text-sm text-brand-orange hover:text-brand-orange/80 transition-colors mb-6 flex items-center gap-1">
                                <ChevronRight size={14} className="rotate-180" /> Back to Settings
                            </button>
                            <div className="bg-card border border-brand-border rounded-2xl p-6">
                                <h2 className="font-display text-xl font-bold uppercase text-foreground mb-4">Security</h2>
                                <p className="font-body text-sm text-muted-foreground mb-4">Update your password and manage account security.</p>
                                <Link
                                    to="/account/update-password"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-orange text-primary-foreground font-body text-sm font-semibold rounded-full"
                                >
                                    <Lock size={14} /> Update Password
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeTab === "Settings" && settingsSection === "email" && (
                        <div className="animate-fade-in-up">
                            <button onClick={() => setSettingsSection(null)} className="font-body text-sm text-brand-orange hover:text-brand-orange/80 transition-colors mb-6 flex items-center gap-1">
                                <ChevronRight size={14} className="rotate-180" /> Back to Settings
                            </button>
                            <div className="bg-card border border-brand-border rounded-2xl p-6">
                                <h2 className="font-display text-xl font-bold uppercase text-foreground mb-4">Email Preferences</h2>
                                <p className="font-body text-sm text-muted-foreground">Your email <strong>{email}</strong> is used for order updates and account notifications.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "Settings" && settingsSection === "account" && (
                        <div className="animate-fade-in-up">
                            <button onClick={() => setSettingsSection(null)} className="font-body text-sm text-brand-orange hover:text-brand-orange/80 transition-colors mb-6 flex items-center gap-1">
                                <ChevronRight size={14} className="rotate-180" /> Back to Settings
                            </button>
                            <div className="bg-card border border-brand-border rounded-2xl p-6">
                                <h2 className="font-display text-xl font-bold uppercase text-foreground mb-4">Account</h2>
                                <p className="font-body text-sm text-muted-foreground mb-4">Manage your account preferences and data.</p>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-2 px-6 py-3 border border-destructive/30 text-destructive font-body text-sm font-semibold rounded-full hover:bg-destructive/5 transition-colors"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
