// app/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../components/AuthProvider";
import {
  Camera,
  Save,
  Edit3,
  LogOut,
  Trash2,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase"; // Removed unused storage import
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  signOut,
  deleteUser,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";
import Navbar from "../components/Navbar";

// Add interfaces for type safety
interface UserData {
  username?: string;
  bio?: string;
  location?: string;
  favoriteGenres?: string[];
  email?: string;
  createdAt?: Date;
}

interface WatchlistItem {
  id: string;
  episodesWatched?: number[];
  // Add other properties you use from watchlist items
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [profileData, setProfileData] = useState({
    username: "",
    bio: "",
    location: "",
    favoriteGenres: [] as string[],
  });
  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading] = useState(false);

  // Fetch user profile data and watchlist
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setProfileData({
            username: data.username || user.displayName || "",
            bio: data.bio || "",
            location: data.location || "",
            favoriteGenres: data.favoriteGenres || [],
          });
        } else {
          // Create user document if it doesn't exist
          await setDoc(doc(db, "users", user.uid), {
            username: user.displayName || "",
            bio: "",
            location: "",
            favoriteGenres: [],
            email: user.email,
            createdAt: new Date(),
          });
          toast.info("Welcome! Your profile has been created.");
        }

        // Fetch watchlist
        try {
          const watchlistRef = collection(db, `users/${user.uid}/watchlist`);
          const snapshot = await getDocs(watchlistRef);
          const animeList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as WatchlistItem[];
          setWatchlist(animeList);
        } catch (watchlistError) {
          console.warn("Could not fetch watchlist:", watchlistError);
          // Watchlist might not exist yet, which is fine
          setWatchlist([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "permission-denied"
        ) {
          toast.error(
            "Permission denied. Please check your Firestore security rules."
          );
        } else {
          toast.error("Failed to load profile data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), profileData);

      // Update Firebase Auth profile if username changed
      if (profileData.username !== user.displayName) {
        await updateProfile(user, {
          displayName: profileData.username,
        });
      }

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "permission-denied"
      ) {
        toast.error("You don't have permission to update this profile.");
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !user.email) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password should be at least 6 characters");
      return;
    }

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      toast.success("Password updated successfully");
      setChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      // Changed from any to unknown
      console.error("Error changing password:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "auth/wrong-password"
      ) {
        toast.error("Current password is incorrect");
      } else if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "auth/requires-recent-login"
      ) {
        toast.error("Please log in again to change your password");
      } else {
        toast.error("Failed to change password");
      }
    }
  };

  const handleLogout = async () => {
    if (!user) return;
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Try to delete user's watchlist if it exists
      try {
        const watchlistRef = collection(db, `users/${user.uid}/watchlist`);
        const snapshot = await getDocs(watchlistRef);
        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (watchlistError) {
        console.warn("Could not delete watchlist:", watchlistError);
        // Continue with account deletion even if watchlist deletion fails
      }

      // Delete user document
      try {
        await deleteDoc(doc(db, "users", user.uid));
      } catch (userDocError) {
        console.warn("Could not delete user document:", userDocError);
        // Continue with account deletion even if user document deletion fails
      }

      // Delete user account
      try {
        await deleteUser(user);
        toast.success("Account deleted successfully");
      } catch (authError: unknown) {
        console.error("Error deleting auth user:", authError);
        if (
          typeof authError === "object" &&
          authError !== null &&
          "code" in authError &&
          (authError as { code?: string }).code === "auth/requires-recent-login"
        ) {
          toast.error("Please reauthenticate to delete your account.");
        } else {
          toast.error("Failed to delete account. Please try again later.");
        }
      }
    } catch (error: unknown) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  // Calculate stats from watchlist
  const animeCount = watchlist.length;
  const episodesWatched = watchlist.reduce((total, anime) => {
    return total + (anime.episodesWatched?.length || 0);
  }, 0);

  const stats = [
    { label: "Anime in Watchlist", value: animeCount },
    { label: "Episodes Watched", value: episodesWatched },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in</h1>
          <p className="text-gray-300">
            You need to be signed in to access your profile
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(1200px_800px_at_80%_-20%,#1a1f2e_0%,#0b0f1a_35%,#05070d_80%)] text-zinc-100">
      {/* Subtle grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(2000px_500px_at_50%_-10%,black,transparent)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:100%_32px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_100%]" />
      </div>

      {/* Ambient glow orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      <Navbar />

      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Shell */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent">
                    Profile Settings
                  </span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-zinc-300/90">
                  Manage your account settings and preferences
                </p>
              </div>

              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <h2 className="text-xl font-bold text-zinc-100 mb-6">
                    Profile Information
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/10">
                        <Image
                          src={user.photoURL || "/default-avatar.png"}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                        {isEditing && (
                          <button
                            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-indigo-600 text-white"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <LoadingSpinner />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Username
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.username}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                username: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          <p className="text-white">
                            {profileData.username || "Not set"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Email
                        </label>
                        <p className="text-white">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profileData.bio}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              bio: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={3}
                        />
                      ) : (
                        <p className="text-white">
                          {profileData.bio || "No bio yet"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">
                        Location
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              location: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <p className="text-white">
                          {profileData.location || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Change Password Form */}
                {changePassword && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-zinc-100 mb-6">
                      Change Password
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                current: !showPasswords.current,
                              })
                            }
                          >
                            {showPasswords.current ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                new: !showPasswords.new,
                              })
                            }
                          >
                            {showPasswords.new ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                confirm: !showPasswords.confirm,
                              })
                            }
                          >
                            {showPasswords.confirm ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setChangePassword(false)}
                          className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePasswordChange}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        >
                          <Key className="h-4 w-4" />
                          <span>Change Password</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Stats and Actions */}
              <div className="space-y-8">
                {/* Stats Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <h2 className="text-xl font-bold text-zinc-100 mb-6">
                    Your Stats
                  </h2>

                  <div className="space-y-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-white/5"
                      >
                        <span className="text-zinc-400">{stat.label}</span>
                        <span className="text-white font-semibold">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Actions */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <h2 className="text-xl font-bold text-zinc-100 mb-6">
                    Account Actions
                  </h2>

                  <div className="space-y-3">
                    {!changePassword && (
                      <button
                        onClick={() => setChangePassword(true)}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"
                      >
                        <Key className="h-4 w-4" />
                        <span>Change Password</span>
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>

                    <button
                      onClick={handleDeleteAccount}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>

                {/* Favorite Genres */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <h2 className="text-xl font-bold text-zinc-100 mb-4">
                    Favorite Genres
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {profileData.favoriteGenres &&
                    profileData.favoriteGenres.length > 0 ? (
                      profileData.favoriteGenres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-300 text-sm"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <p className="text-zinc-400">
                        No favorite genres added yet
                      </p>
                    )}
                    {isEditing && (
                      <button className="px-3 py-1 rounded-full bg-white/10 text-zinc-300 text-sm hover:bg-white/20">
                        + Add Genre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
