// "use client";

// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { createClient } from "@/lib/supabase/client";
// import { toast } from "sonner";

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirectTo = searchParams.get("redirect") || "/dashboard/profile";

//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [step, setStep] = useState<"email" | "otp">("email");
//   const [loading, setLoading] = useState(false);

//   const supabase = createClient();

//   const handleSendOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const { error } = await supabase.auth.signInWithOtp({
//         email,
//         options: {
//           shouldCreateUser: false, // Only allow existing users to log in
//         },
//       });

//       if (error) throw error;

//       toast.success("Verification code sent to your email");
//       setStep("otp");
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const { error } = await supabase.auth.verifyOtp({
//         email,
//         token: otp,
//         type: "email",
//       });

//       if (error) throw error;

//       toast.success("Successfully logged in!");
//       router.push(redirectTo);
//       router.refresh();
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Invalid OTP code");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-linear-to-br from-mainPurple to-blue flex items-center justify-center p-6">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
//         {/* Logo/Header */}
//         <div className="text-center mb-8">
//           <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
//             Welcome Back
//           </h1>
//           <p className="font-openSans text-grey3">
//             {step === "email"
//               ? "Sign in to your account"
//               : "Enter the code sent to your email"}
//           </p>
//         </div>

//         {/* Email Step */}
//         {step === "email" && (
//           <form onSubmit={handleSendOTP} className="space-y-6">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
//               >
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
//                 placeholder="you@example.com"
//                 disabled={loading}
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-mainPurple text-white py-3 rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Sending code..." : "Continue with Email"}
//             </button>
//           </form>
//         )}

//         {/* OTP Step */}
//         {step === "otp" && (
//           <form onSubmit={handleVerifyOTP} className="space-y-6">
//             <div>
//               <label
//                 htmlFor="otp"
//                 className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk"
//               >
//                 Verification Code
//               </label>
//               <input
//                 type="text"
//                 id="otp"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 required
//                 maxLength={6}
//                 className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans text-center text-2xl tracking-widest"
//                 placeholder="000000"
//                 disabled={loading}
//               />
//               <p className="mt-2 text-sm text-grey3 font-openSans">
//                 Sent to {email}
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-mainPurple text-white py-3 rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Verifying..." : "Verify & Sign In"}
//             </button>

//             <button
//               type="button"
//               onClick={() => setStep("email")}
//               className="w-full text-grey3 hover:text-grey1 transition-colors font-openSans text-sm"
//             >
//               ← Back to email
//             </button>
//           </form>
//         )}

//         {/* Signup Link */}
//         <div className="mt-8 text-center">
//           {/* <p className="text-grey3 font-openSans text-sm">
//             Don't have an account?{' '}
//             <Link
//               href="/signup"
//               className="text-mainPurple hover:underline font-semibold"
//             >
//               Sign up
//             </Link>
//           </p> */}

//           <p className="text-grey3 font-openSans text-sm">
//             Don&apos;t have an account?{" "}
//             <Link
//               href="/signup"
//               className="text-mainPurple hover:underline font-semibold"
//             >
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


















// app/login/page.tsx
"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-mainPurple to-blue flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <p className="font-openSans text-grey3 text-center">Loading…</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard/profile";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      toast.success("Verification code sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;
      toast.success("Successfully logged in!");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-mainPurple to-blue flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
            Welcome Back
          </h1>
          <p className="font-openSans text-grey3">
            {step === "email" ? "Sign in to your account" : "Enter the code sent to your email"}
          </p>
        </div>

        {/* Email Step */}
        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mainPurple text-white py-3 rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending code..." : "Continue with Email"}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-grey1 mb-2 font-spaceGrotesk">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-grey4 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainPurple focus:border-transparent font-openSans text-center text-2xl tracking-widest"
                placeholder="000000"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-grey3 font-openSans">Sent to {email}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mainPurple text-white py-3 rounded-lg font-spaceGrotesk font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-grey3 hover:text-grey1 transition-colors font-openSans text-sm"
            >
              ← Back to email
            </button>
          </form>
        )}

        {/* Signup Link */}
        <div className="mt-8 text-center">
          <p className="text-grey3 font-openSans text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-mainPurple hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
