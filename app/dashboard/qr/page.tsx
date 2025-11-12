// "use client";

// import { useState, useEffect, useRef } from "react";
// import { QRCodeCanvas } from "qrcode.react";
// import {
//   FaSpinner,
//   FaDownload,
//   FaArrowUpRightFromSquare,
//   FaCopy,
// } from "react-icons/fa6";
// import { toast } from "sonner";

// interface ProfileData {
//   username: string | null;
// }

// export default function QRCodePage() {
//   const [profile, setProfile] = useState<ProfileData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const qrRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/user/profile");

//       if (!response.ok) {
//         throw new Error("Failed to fetch profile");
//       }

//       const data = await response.json();
//       setProfile(data.profile);
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to load profile"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getProfileUrl = () => {
//     if (!profile?.username) return "";
//     return `https://segwae.com/profile/${profile.username}`;
//   };

//   const handleDownload = () => {
//     const canvas = qrRef.current?.querySelector("canvas");
//     if (!canvas) return;

//     // Create a download link
//     const url = canvas.toDataURL("image/png");
//     const link = document.createElement("a");
//     link.download = `segwae-qr-${profile?.username || "code"}.png`;
//     link.href = url;
//     link.click();
//   };

//   const handleCopyUrl = async () => {
//     const url = getProfileUrl();
//     try {
//       await navigator.clipboard.writeText(url);
//       toast.success("URL copied to clipboard");
//     } catch {
//       toast.error("Failed to copy URL");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <FaSpinner className="w-8 h-8 text-mainPurple animate-spin" />
//       </div>
//     );
//   }

//   if (!profile?.username) {
//     return (
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm p-8">
//           <div className="text-center py-12">
//             <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-4">
//               QR Code Not Available
//             </h1>
//             <p className="font-openSans text-grey3 mb-6">
//               You need a username to generate a QR code. Please complete your
//               profile setup.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const profileUrl = getProfileUrl();

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-sm p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
//             Your QR Code
//           </h1>
//           <p className="font-openSans text-grey3">
//             Share your digital profile with a scan
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">
//           {/* QR Code Display */}
//           <div className="flex flex-col items-center justify-center">
//             <div
//               ref={qrRef}
//               className="p-8 bg-white border-4 border-grey4 rounded-2xl shadow-lg"
//             >
//               <QRCodeCanvas
//                 value={profileUrl}
//                 size={256}
//                 level="H"
//                 includeMargin={false}
//                 imageSettings={{
//                   src: "/logo.png",
//                   excavate: true,
//                   width: 48,
//                   height: 48,
//                 }}
//               />
//             </div>

//             <button
//               onClick={handleDownload}
//               className="mt-6 flex items-center gap-2 px-6 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold cursor-pointer hover:opacity-90 transition-opacity"
//             >
//               <FaDownload className="w-4 h-4" />
//               Download QR Code
//             </button>
//           </div>

//           {/* Profile Information */}
//           <div className="flex flex-col justify-center space-y-6">
//             <div>
//               <h2 className="font-spaceGrotesk font-semibold text-xl text-grey1 mb-4">
//                 Profile URL
//               </h2>
//               <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-grey4">
//                 <a
//                   href={profileUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex-1 font-openSans text-mainPurple hover:underline truncate"
//                 >
//                   {profileUrl}
//                 </a>
//                 <button
//                   onClick={handleCopyUrl}
//                   className="p-2 text-grey1 cursor-pointer hover:bg-white rounded-lg transition-colors"
//                   title="Copy URL"
//                 >
//                   <FaCopy className="w-5 h-5" />
//                 </button>
//                 <a
//                   href={profileUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="p-2 text-grey1 hover:bg-white rounded-lg transition-colors"
//                   title="Open in new tab"
//                 >
//                   <FaArrowUpRightFromSquare className="w-5 h-5" />
//                 </a>
//               </div>
//             </div>

//             <div className="p-6 bg-linear-to-br from-mainPurple to-blue rounded-xl text-white">
//               <h3 className="font-spaceGrotesk font-semibold text-lg mb-2">
//                 How to use
//               </h3>
//               <ul className="space-y-2 font-openSans text-sm">
//                 <li className="flex items-start gap-2">
//                   <span className="mt-1">•</span>
//                   <span>
//                     Download and print your QR code for physical business cards
//                   </span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="mt-1">•</span>
//                   <span>
//                     Share it in email signatures or social media posts
//                   </span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="mt-1">•</span>
//                   <span>
//                     Anyone can scan it with their phone camera to view your
//                     profile
//                   </span>
//                 </li>
//               </ul>
//             </div>

//             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="font-openSans text-sm text-blue-800">
//                 <strong className="font-semibold">Tip:</strong> Update your
//                 profile information anytime - your QR code will always link to
//                 your latest profile!
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




















// "use client";

// import { useState, useEffect, useRef } from "react";
// import {
//   FaSpinner,
//   FaDownload,
//   FaArrowUpRightFromSquare,
//   FaCopy,
// } from "react-icons/fa6";
// import { toast } from "sonner";
// import QRCode from "qrcode";

// interface ProfileData {
//   username: string | null;
// }

// export default function QRCodePage() {
//   const [profile, setProfile] = useState<ProfileData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   useEffect(() => {
//     if (profile?.username && canvasRef.current) {
//       generatePrettyQR();
//     }
//   }, [profile]);

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/user/profile");

//       if (!response.ok) {
//         throw new Error("Failed to fetch profile");
//       }

//       const data = await response.json();
//       setProfile(data.profile);
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to load profile"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getProfileUrl = () => {
//     if (!profile?.username) return "";
//     return `https://segwae.com/profile/${profile.username}`;
//   };

//   const generatePrettyQR = async () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const profileUrl = getProfileUrl();
//     const size = 512; // Higher resolution for better quality
//     const margin = 4;

//     canvas.width = size;
//     canvas.height = size;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     // Generate QR code data
//     const qrData = await QRCode.create(profileUrl, {
//       errorCorrectionLevel: "H",
//     });

//     const moduleCount = qrData.modules.size;
//     const moduleSize = (size - margin * 2) / moduleCount;
//     const dotRadius = moduleSize * 0.42; // Circular dots

//     // Fill white background
//     ctx.fillStyle = "#FFFFFF";
//     ctx.fillRect(0, 0, size, size);

//     // Helper function to check if position is in finder pattern (corner squares)
//     const isInFinderPattern = (row: number, col: number) => {
//       const finderSize = 7;
//       // Top-left
//       if (row < finderSize && col < finderSize) return true;
//       // Top-right
//       if (row < finderSize && col >= moduleCount - finderSize) return true;
//       // Bottom-left
//       if (row >= moduleCount - finderSize && col < finderSize) return true;
//       return false;
//     };

//     // Draw QR modules as circles
//     ctx.fillStyle = "#000000";
//     for (let row = 0; row < moduleCount; row++) {
//       for (let col = 0; col < moduleCount; col++) {
//         if (qrData.modules.get(row, col)) {
//           if (!isInFinderPattern(row, col)) {
//             const x = margin + col * moduleSize + moduleSize / 2;
//             const y = margin + row * moduleSize + moduleSize / 2;

//             ctx.beginPath();
//             ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
//             ctx.fill();
//           }
//         }
//       }
//     }

//     // Draw rounded finder patterns (position markers)
//     const drawRoundedFinderPattern = (startRow: number, startCol: number) => {
//       const finderSize = 7;
//       const x = margin + startCol * moduleSize;
//       const y = margin + startRow * moduleSize;
//       const outerSize = finderSize * moduleSize;
//       const outerRadius = moduleSize * 2;

//       // Outer rounded square
//       ctx.fillStyle = "#000000";
//       ctx.beginPath();
//       ctx.roundRect(x, y, outerSize, outerSize, outerRadius);
//       ctx.fill();

//       // Inner white rounded square
//       const innerMargin = moduleSize;
//       const innerSize = (finderSize - 2) * moduleSize;
//       const innerRadius = moduleSize * 1.5;
//       ctx.fillStyle = "#FFFFFF";
//       ctx.beginPath();
//       ctx.roundRect(
//         x + innerMargin,
//         y + innerMargin,
//         innerSize,
//         innerSize,
//         innerRadius
//       );
//       ctx.fill();

//       // Center rounded square
//       const centerMargin = moduleSize * 2;
//       const centerSize = (finderSize - 4) * moduleSize;
//       const centerRadius = moduleSize;
//       ctx.fillStyle = "#000000";
//       ctx.beginPath();
//       ctx.roundRect(
//         x + centerMargin,
//         y + centerMargin,
//         centerSize,
//         centerSize,
//         centerRadius
//       );
//       ctx.fill();
//     };

//     // Draw the three finder patterns
//     drawRoundedFinderPattern(0, 0); // Top-left
//     drawRoundedFinderPattern(0, moduleCount - 7); // Top-right
//     drawRoundedFinderPattern(moduleCount - 7, 0); // Bottom-left

//     // Load and draw logo in center
//     const logo = new Image();
//     logo.crossOrigin = "anonymous";
//     logo.src = "/logo.png";

//     logo.onload = () => {
//       const logoSize = size * 0.18; // Logo size relative to QR code
//       const logoX = (size - logoSize) / 2;
//       const logoY = (size - logoSize) / 2;

//       // Draw white circle background for logo
//       ctx.fillStyle = "#FFFFFF";
//       ctx.beginPath();
//       ctx.arc(size / 2, size / 2, logoSize / 2 + 8, 0, Math.PI * 2);
//       ctx.fill();

//       // Draw logo
//       ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
//     };
//   };

//   const handleDownload = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     // Create a download link
//     const url = canvas.toDataURL("image/png");
//     const link = document.createElement("a");
//     link.download = `segwae-qr-${profile?.username || "code"}.png`;
//     link.href = url;
//     link.click();
//   };

//   const handleCopyUrl = async () => {
//     const url = getProfileUrl();
//     try {
//       await navigator.clipboard.writeText(url);
//       toast.success("URL copied to clipboard");
//     } catch {
//       toast.error("Failed to copy URL");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <FaSpinner className="w-8 h-8 text-mainPurple animate-spin" />
//       </div>
//     );
//   }

//   if (!profile?.username) {
//     return (
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm p-8">
//           <div className="text-center py-12">
//             <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-4">
//               QR Code Not Available
//             </h1>
//             <p className="font-openSans text-grey3 mb-6">
//               You need a username to generate a QR code. Please complete your
//               profile setup.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const profileUrl = getProfileUrl();

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-sm p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
//             Your QR Code
//           </h1>
//           <p className="font-openSans text-grey3">
//             Share your digital profile with a scan
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">
//           {/* QR Code Display */}
//           <div className="flex flex-col items-center justify-center">
//             <div className="p-8 bg-white border-4 border-grey4 rounded-2xl shadow-lg">
//               <canvas
//                 ref={canvasRef}
//                 className="max-w-full h-auto"
//                 style={{ width: "256px", height: "256px" }}
//               />
//             </div>

//             <button
//               onClick={handleDownload}
//               className="mt-6 flex items-center gap-2 px-6 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold cursor-pointer hover:opacity-90 transition-opacity"
//             >
//               <FaDownload className="w-4 h-4" />
//               Download QR Code
//             </button>
//           </div>

//           {/* Profile Information */}
//           <div className="flex flex-col justify-center space-y-6">
//             <div>
//               <h2 className="font-spaceGrotesk font-semibold text-xl text-grey1 mb-4">
//                 Profile URL
//               </h2>
//               <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-grey4">
//                 <a
//                   href={profileUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex-1 font-openSans text-mainPurple hover:underline truncate"
//                 >
//                   {profileUrl}
//                 </a>
//                 <button
//                   onClick={handleCopyUrl}
//                   className="p-2 text-grey1 cursor-pointer hover:bg-white rounded-lg transition-colors"
//                   title="Copy URL"
//                 >
//                   <FaCopy className="w-5 h-5" />
//                 </button>
//                 <a
//                   href={profileUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="p-2 text-grey1 hover:bg-white rounded-lg transition-colors"
//                   title="Open in new tab"
//                 >
//                   <FaArrowUpRightFromSquare className="w-5 h-5" />
//                 </a>
//               </div>
//             </div>

//             <div className="p-6 bg-linear-to-br from-mainPurple to-blue-500 rounded-xl text-white">
//               <h3 className="font-spaceGrotesk font-semibold text-lg mb-2">
//                 How to use
//               </h3>
//               <ul className="space-y-2 font-openSans text-sm">
//                 <li className="flex items-start gap-2">
//                   <span className="mt-1">•</span>
//                   <span>
//                     Download and print your QR code for physical business cards
//                   </span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="mt-1">•</span>
//                   <span>
//                     Share it in email signatures or social media posts
//                   </span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <span className="mt-1">•</span>
//                   <span>
//                     Anyone can scan it with their phone camera to view your
//                     profile
//                   </span>
//                 </li>
//               </ul>
//             </div>

//             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="font-openSans text-sm text-blue-800">
//                 <strong className="font-semibold">Tip:</strong> Update your
//                 profile information anytime - your QR code will always link to
//                 your latest profile!
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }













"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaSpinner,
  FaDownload,
  FaArrowUpRightFromSquare,
  FaCopy,
} from "react-icons/fa6";
import { toast } from "sonner";
import QRCode from "qrcode";

interface ProfileData {
  username: string | null;
}

export default function QRCodePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.username && canvasRef.current) {
      generatePrettyQR();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/profile");

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const getProfileUrl = () => {
    if (!profile?.username) return "";
    return `https://segwae.com/profile/${profile.username}`;
  };

  const generatePrettyQR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const profileUrl = getProfileUrl();
    const size = 512; // Higher resolution for better quality
    const margin = 4;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate QR code data
    const qrData = await QRCode.create(profileUrl, {
      errorCorrectionLevel: "H",
    });

    const moduleCount = qrData.modules.size;
    const moduleSize = (size - margin * 2) / moduleCount;
    const dotRadius = moduleSize * 0.42; // Circular dots

    // Fill white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    // Helper function to check if position is in finder pattern (corner squares)
    const isInFinderPattern = (row: number, col: number) => {
      const finderSize = 7;
      // Top-left
      if (row < finderSize && col < finderSize) return true;
      // Top-right
      if (row < finderSize && col >= moduleCount - finderSize) return true;
      // Bottom-left
      if (row >= moduleCount - finderSize && col < finderSize) return true;
      return false;
    };

    // Draw QR modules as circles
    ctx.fillStyle = "#000000";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrData.modules.get(row, col)) {
          if (!isInFinderPattern(row, col)) {
            const x = margin + col * moduleSize + moduleSize / 2;
            const y = margin + row * moduleSize + moduleSize / 2;

            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Draw rounded finder patterns (position markers)
    const drawRoundedFinderPattern = (startRow: number, startCol: number) => {
      const finderSize = 7;
      const x = margin + startCol * moduleSize;
      const y = margin + startRow * moduleSize;
      const outerSize = finderSize * moduleSize;
      const outerRadius = moduleSize * 2;

      // Outer rounded square
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.roundRect(x, y, outerSize, outerSize, outerRadius);
      ctx.fill();

      // Inner white rounded square
      const innerMargin = moduleSize;
      const innerSize = (finderSize - 2) * moduleSize;
      const innerRadius = moduleSize * 1.5;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(
        x + innerMargin,
        y + innerMargin,
        innerSize,
        innerSize,
        innerRadius
      );
      ctx.fill();

      // Center rounded square
      const centerMargin = moduleSize * 2;
      const centerSize = (finderSize - 4) * moduleSize;
      const centerRadius = moduleSize;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.roundRect(
        x + centerMargin,
        y + centerMargin,
        centerSize,
        centerSize,
        centerRadius
      );
      ctx.fill();
    };

    // Draw the three finder patterns
    drawRoundedFinderPattern(0, 0); // Top-left
    drawRoundedFinderPattern(0, moduleCount - 7); // Top-right
    drawRoundedFinderPattern(moduleCount - 7, 0); // Bottom-left

    // Load and draw logo in center
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "/logo_icon.svg";

    logo.onload = () => {
      const maxLogoSize = size * 0.18; // Maximum logo size relative to QR code
      
      // Calculate aspect ratio and dimensions
      const aspectRatio = logo.naturalWidth / logo.naturalHeight;
      let logoWidth, logoHeight;
      
      if (aspectRatio > 1) {
        // Logo is wider than it is tall
        logoWidth = maxLogoSize;
        logoHeight = maxLogoSize / aspectRatio;
      } else {
        // Logo is taller than it is wide
        logoHeight = maxLogoSize;
        logoWidth = maxLogoSize * aspectRatio;
      }
      
      const logoX = (size - logoWidth) / 2;
      const logoY = (size - logoHeight) / 2;

      // Draw white circle background for logo (use the larger dimension for radius)
      const backgroundRadius = Math.max(logoWidth, logoHeight) / 2 + 12;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, backgroundRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw logo with correct aspect ratio
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    };
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a download link
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `segwae-qr-${profile?.username || "code"}.png`;
    link.href = url;
    link.click();
  };

  const handleCopyUrl = async () => {
    const url = getProfileUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="w-8 h-8 text-mainPurple animate-spin" />
      </div>
    );
  }

  if (!profile?.username) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center py-12">
            <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-4">
              QR Code Not Available
            </h1>
            <p className="font-openSans text-grey3 mb-6">
              You need a username to generate a QR code. Please complete your
              profile setup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const profileUrl = getProfileUrl();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-satoshi font-bold text-3xl text-grey1 mb-2">
            Your QR Code
          </h1>
          <p className="font-openSans text-grey3">
            Share your digital profile with a scan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center">
            <div className="p-8 bg-white border-4 border-grey4 rounded-2xl shadow-lg">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ width: "256px", height: "256px" }}
              />
            </div>

            <button
              onClick={handleDownload}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-mainPurple text-white rounded-lg font-spaceGrotesk font-semibold cursor-pointer hover:opacity-90 transition-opacity"
            >
              <FaDownload className="w-4 h-4" />
              Download QR Code
            </button>
          </div>

          {/* Profile Information */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h2 className="font-spaceGrotesk font-semibold text-xl text-grey1 mb-4">
                Profile URL
              </h2>
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-grey4">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 font-openSans text-mainPurple hover:underline truncate"
                >
                  {profileUrl}
                </a>
                <button
                  onClick={handleCopyUrl}
                  className="p-2 text-grey1 cursor-pointer hover:bg-white rounded-lg transition-colors"
                  title="Copy URL"
                >
                  <FaCopy className="w-5 h-5" />
                </button>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-grey1 hover:bg-white rounded-lg transition-colors"
                  title="Open in new tab"
                >
                  <FaArrowUpRightFromSquare className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="p-6 bg-linear-to-br from-mainPurple to-blue-500 rounded-xl text-white">
              <h3 className="font-spaceGrotesk font-semibold text-lg mb-2">
                How to use
              </h3>
              <ul className="space-y-2 font-openSans text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    Download and print your QR code for physical business cards
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    Share it in email signatures or social media posts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    Anyone can scan it with their phone camera to view your
                    profile
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-openSans text-sm text-blue-800">
                <strong className="font-semibold">Tip:</strong> Update your
                profile information anytime - your QR code will always link to
                your latest profile!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}