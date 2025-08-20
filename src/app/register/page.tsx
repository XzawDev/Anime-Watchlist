"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { FirebaseError } from "firebase/app"; // Add this import

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update user profile with display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });

        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username: name,
          email: email,
          createdAt: new Date(),
          bio: "",
          location: "",
          favoriteGenres: [],
        });
      }

      // Success notification
      toast.success("Registration successful! Redirecting to login...", {
        duration: 3000,
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      // Change from 'any' to 'unknown'
      console.error("Registration error:", error);

      // Handle common Firebase errors
      let errorMessage = "Registration failed. Please try again.";

      // Check if it's a Firebase error
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Email is already in use.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters.";
            break;
          default:
            errorMessage = `Registration failed: ${error.message}`;
        }
      } else if (error instanceof Error) {
        // Handle other JavaScript errors
        errorMessage = `Registration failed: ${error.message}`;
      }

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 p-4">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50">
        <div id="toast-container"></div>
      </div>

      <Card className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">
            Create Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-indigo-500/30"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register Now"
              )}
            </Button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
