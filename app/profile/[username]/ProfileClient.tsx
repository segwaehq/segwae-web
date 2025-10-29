'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { UserProfile } from '@/lib/supabase'
import { FaBehance, FaDribbble, FaFacebookF, FaFigma, FaGithub, FaGlobe, FaInstagram, FaLinkedinIn, FaMedium, FaStackOverflow, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from 'react-icons/fa6'

// interface SocialLink {
//   id: string
//   platform: string
//   url: string
//   is_enabled: boolean
// }

// interface Profile {
//   id: string
//   name: string
//   title: string
//   email: string
//   phone: string
//   bio: string
//   profile_image_url?: string
//   cover_image_url?: string
//   portfolio_or_website_link?: string
//   resume_url?: string
//   profile_video_url?: string
//   profile_video_thumbnail_url?: string
//   social_links?: SocialLink[]
//   privacy_settings?: {
//     show_email?: boolean
//     show_phone?: boolean
//     show_social_links?: boolean
//     show_portfolio?: boolean
//     show_resume?: boolean
//   }
// }

interface ContactModalData {
  type: 'email' | 'phone' | 'web' | 'resume'
  label: string
  value: string
}

// const platformIcons: Record<string, string> = {
//   twitter: '🐦',
//   linkedin: '💼',
//   github: '🐙',
//   instagram: '📷',
//   facebook: '👤',
//   youtube: '📺',
//   tiktok: '🎵',
//   snapchat: '👻',
//   discord: '💬',
//   twitch: '🎮',
//   medium: '📝',
//   behance: '🎨',
//   dribbble: '🏀',
//   pinterest: '📌',
// }



const platformConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  linkedin: {
    color: '#0077B5',
    // icon: (
    //   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    //     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    //   </svg>
    // ),
    icon: <FaLinkedinIn className="w-5 h-5" />,
  },
  github: {
    color: '#333333',
    icon: <FaGithub className="w-5 h-5" />,
  },
  x: {
    color: '#000000',
    icon: <FaXTwitter className="w-5 h-5" />,
  },
//   twitter: {
//     color: '#000000',
//     icon: (
//       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//         <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
//       </svg>
//     ),
//   },
  instagram: {
    color: '#E4405F',
    icon: <FaInstagram className="w-5 h-5" />,
  },
  facebook: {
    color: '#1877F2',
    icon: <FaFacebookF className="w-5 h-5" />,
  },
  dribbble: {
    color: '#EA4C89',
    icon: <FaDribbble className="w-5 h-5" />,
  },
  behance: {
    color: '#1769FF',
    icon: <FaBehance className="w-5 h-5" />,
  },
  whatsapp: {
    color: '#25D366',
    icon: <FaWhatsapp className="w-5 h-5" />,
  },
  youtube: {
    color: '#FF0000',
    icon: <FaYoutube className="w-5 h-5" />,
  },
  tiktok: {
    color: '#000000',
    icon: <FaTiktok className="w-5 h-5" />,
  },
  medium: {
    color: '#000000',
    icon: <FaMedium className="w-5 h-5" />,
  },
  stackoverflow: {
    color: '#F58025',
    icon: <FaStackOverflow className="w-5 h-5" />,
  },
  figma: {
    color: '#F24E1E',
    icon: <FaFigma className="w-5 h-5" />,
  },
  portfolio: {
    color: '#6B73FF',
    icon: <FaGlobe className="w-5 h-5" />,
  },
}


// export default function ProfileClient({ profile }: { profile: Profile }) {
// export default function ProfileClient({ profile }: { profile: UserProfile }) {
//   const [showContactModal, setShowContactModal] = useState(false)
//   const [contactModalData, setContactModalData] = useState<ContactModalData | null>(null)
//   const [showVideoModal, setShowVideoModal] = useState(false)
//   const [copied, setCopied] = useState<string | null>(null)
//   const videoRef = useRef<HTMLVideoElement>(null)

//   const privacy = profile.privacy_settings
//   const showEmail = privacy?.show_email !== false
//   const showPhone = privacy?.show_phone !== false
//   const showSocialLinks = privacy?.show_social_links !== false
//   const showPortfolio = privacy?.show_portfolio !== false
//   const showResume = privacy?.show_resume !== false

//   const hasProfileVideo = !!profile.profile_video_url

//   const handleShare = async () => {
//     const url = window.location.href
    
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: `${profile.name} - Segwae`,
//           text: `Connect with me on Segwae! 🚀`,
//           url: url,
//         })
//       } catch (err) {
//         // User cancelled or share failed, fallback to copy
//         copyToClipboard(url, 'link')
//       }
//     } else {
//       copyToClipboard(url, 'link')
//     }
//   }

//   const copyToClipboard = (text: string, type: string) => {
//     navigator.clipboard.writeText(text)
//     setCopied(type)
//     setTimeout(() => setCopied(null), 2000)
//   }

//   const openContactModal = (type: ContactModalData['type'], label: string, value: string) => {
//     setContactModalData({ type, label, value })
//     setShowContactModal(true)
//   }

//   const handleContactAction = () => {
//     if (!contactModalData) return

//     switch (contactModalData.type) {
//       case 'email':
//         window.location.href = `mailto:${contactModalData.value}`
//         break
//       case 'phone':
//         window.location.href = `tel:${contactModalData.value}`
//         break
//       case 'web':
//         window.open(contactModalData.value, '_blank')
//         break
//     }
//   }

//   const handleVideoClick = () => {
//     if (hasProfileVideo) {
//       setShowVideoModal(true)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-grey6">
//       {/* Cover Image Section */}
//       <div className="bg-white rounded-b-[20px]">
//         <div className="relative">
//           {/* Cover Image */}
//           <div className="relative h-52 bg-gray-200 rounded-b-[20px] overflow-hidden">
//             {profile.cover_image_url ? (
//               <Image
//                 src={profile.cover_image_url}
//                 alt="Cover"
//                 fill
//                 className="object-cover"
//               />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400" />
//             )}
//           </div>

//           {/* Content Container */}
//           <div className="px-6">
//             {/* Profile Picture - Overlapping */}
//             <div className="flex justify-between items-end -mt-12 mb-4">
//               {/* Profile Picture with Video Support */}
//               <div className="relative">
//                 {hasProfileVideo ? (
//                   <button
//                     onClick={handleVideoClick}
//                     className="relative w-[104px] h-[104px] rounded-full border-4 border-white overflow-hidden group cursor-pointer"
//                     style={{
//                       background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
//                       padding: '3px'
//                     }}
//                   >
//                     <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
//                       <video
//                         ref={videoRef}
//                         src={profile.profile_video_url || undefined}
//                         poster={profile.profile_video_thumbnail_url || undefined}
//                         autoPlay
//                         muted
//                         loop
//                         playsInline
//                         className="w-full h-full object-cover"
//                       />
//                       {/* Play Button Overlay */}
//                       <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
//                         <div className="w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
//                           <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M8 5v14l11-7z" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>
//                   </button>
//                 ) : (
//                   <div className="relative w-[104px] h-[104px] rounded-full border-4 border-white overflow-hidden bg-gray-200">
//                     {profile.profile_image_url ? (
//                       <Image
//                         src={profile.profile_image_url}
//                         alt={profile.name}
//                         fill
//                         className="object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white text-4xl font-bold">
//                         {profile.name.charAt(0).toUpperCase()}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-2 mb-1">
//                 <button
//                   onClick={handleShare}
//                   className="w-9 h-9 rounded-full border border-grey6 flex items-center justify-center hover:bg-gray-50 transition-colors"
//                 >
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* Name and Title */}
//             <h1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
//               {profile.name}
//             </h1>
//             <p className="text-sm text-gray-500 mb-5">
//               {profile.title}
//             </p>

//             {/* Bio */}
//             {profile.bio ? (
//               <p className="text-sm text-gray-800 leading-relaxed mb-8">
//                 {profile.bio}
//               </p>
//             ) : (
//               <p className="text-sm text-gray-500 italic mb-8">
//                 No bio yet.
//               </p>
//             )}

//             {/* Divider */}
//             <div className="h-px bg-grey6 mb-6" />

//             {/* Contact Icons */}
//             <div className="flex gap-2 mb-6">
//               {showEmail && (
//                 <button
//                   onClick={() => openContactModal('email', 'Email Address', profile.email)}
//                   className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                     <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                   </svg>
//                 </button>
//               )}
//               {showPhone && profile.phone && (
//                 <button
//                   onClick={() => openContactModal('phone', 'Phone Number', profile.phone)}
//                   className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                   </svg>
//                 </button>
//               )}
//               {showPortfolio && profile.portfolio_or_website_link && (
//                 <button
//                   onClick={() => openContactModal('web', 'Portfolio / Website', profile.portfolio_or_website_link!)}
//                   className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//               )}
//               {showResume && profile.resume_url && (
//                 <button
//                   onClick={() => openContactModal('resume', 'Resume', 'Resume.pdf')}
//                   className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Social Links Section */}
//       {showSocialLinks && profile.social_links && profile.social_links.filter(link => link.is_enabled).length > 0 && (
//         <div className="mt-2 mx-0">
//           <div className="bg-white rounded-[20px] p-6">
//             <h2 className="text-lg font-bold mb-5">Socials</h2>
//             <div className="h-px bg-gray-200 mb-5" />
            
//             <div className="space-y-6">
//               {profile.social_links
//                 .filter(link => link.is_enabled)
//                 .map((link) => (
//                   <div key={link.id} className="flex items-center gap-4">
//                     {/* Platform Icon */}
//                     <div className="w-12 h-12 rounded-full bg-grey6 flex items-center justify-center flex-shrink-0">
//                       <span className="text-2xl">{platformIcons[link.platform.toLowerCase()] || '🔗'}</span>
//                     </div>

//                     {/* Platform Info */}
//                     <div className="flex-1 min-w-0">
//                       <p className="text-base font-semibold text-gray-900 capitalize">
//                         {link.platform}
//                       </p>
//                       <p className="text-base text-gray-500 truncate underline">
//                         {link.url}
//                       </p>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex items-center gap-2 flex-shrink-0">
//                       <button
//                         onClick={() => copyToClipboard(link.url, link.id)}
//                         className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
//                         title="Copy link"
//                       >
//                         {copied === link.id ? (
//                           <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                           </svg>
//                         ) : (
//                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                           </svg>
//                         )}
//                       </button>
//                       <button
//                         onClick={() => window.open(link.url, '_blank')}
//                         className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
//                         title="Open link"
//                       >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Contact Modal */}
//       {showContactModal && contactModalData && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowContactModal(false)}>
//           <div className="bg-white rounded-3xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
//             <h3 className="text-xl font-bold mb-4">{contactModalData.label}</h3>
            
//             {contactModalData.type === 'resume' ? (
//               <>
//                 <p className="text-gray-600 mb-6">{contactModalData.value}</p>
//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => window.open(profile.resume_url!, '_blank')}
//                     className="flex-1 bg-purple-500 text-white py-3 rounded-full font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                     View
//                   </button>
//                   <button
//                     onClick={() => {
//                       const link = document.createElement('a')
//                       link.href = profile.resume_url!
//                       link.download = 'resume.pdf'
//                       link.click()
//                     }}
//                     className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     Download
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <p className="text-gray-600 mb-2 break-all">{contactModalData.value}</p>
//                 <div className="flex gap-3 mt-6">
//                   <button
//                     onClick={() => {
//                       copyToClipboard(contactModalData.value, 'modal')
//                       setTimeout(() => setShowContactModal(false), 1000)
//                     }}
//                     className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
//                   >
//                     {copied === 'modal' ? (
//                       <>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                         Copied!
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                         </svg>
//                         Copy
//                       </>
//                     )}
//                   </button>
//                   <button
//                     onClick={handleContactAction}
//                     className="flex-1 bg-purple-500 text-white py-3 rounded-full font-semibold hover:bg-purple-600 transition-colors"
//                   >
//                     {contactModalData.type === 'email' ? 'Send Email' : 
//                      contactModalData.type === 'phone' ? 'Call' : 'Visit Website'}
//                   </button>
//                 </div>
//               </>
//             )}
            
//             <button
//               onClick={() => setShowContactModal(false)}
//               className="w-full mt-3 py-3 text-gray-600 hover:text-gray-800 transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Video Modal */}
//       {showVideoModal && hasProfileVideo && (
//         <div 
//           className="fixed inset-0 bg-black z-50 flex items-center justify-center"
//           onClick={() => setShowVideoModal(false)}
//         >
//           <button
//             onClick={() => setShowVideoModal(false)}
//             className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
//           >
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//           <video
//             src={profile.profile_video_url || undefined}
//             controls
//             autoPlay
//             className="max-w-full max-h-full"
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>
//       )}
//     </div>
//   )
// }








// export default function ProfileClient({ profile }: { profile: Profile }) {
export default function ProfileClient({ profile }: { profile: UserProfile }) {
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactModalData, setContactModalData] = useState<ContactModalData | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Use web_preferences if available, fallback to defaults
  const prefs = profile.user_web_preferences
  const showEmail = prefs?.show_email ?? true
  const showPhone = prefs?.show_phone ?? true
  const showPortfolio = prefs?.show_portfolio ?? true
  const showResume = prefs?.show_resume ?? true
  const showProfileVideo = prefs?.show_profile_video ?? true
  const showSocialLinks = profile.social_links && profile.social_links.length > 0

  const hasProfileVideo = !!profile.profile_video_url && showProfileVideo

  // Get theme colors from preferences
  const backgroundColor = prefs?.background_color ?? '#FFFFFF'
  const textColor = prefs?.text_color ?? '#222222'

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Segwae`,
          text: `Connect with me on Segwae! 🚀`,
          url: url,
        })
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(url, 'link')
      }
    } else {
      copyToClipboard(url, 'link')
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const openContactModal = (type: ContactModalData['type'], label: string, value: string) => {
    setContactModalData({ type, label, value })
    setShowContactModal(true)
  }

  const handlePrimaryAction = () => {
    if (!contactModalData) return

    switch (contactModalData.type) {
      case 'email':
        window.location.href = `mailto:${contactModalData.value}`
        break
      case 'phone':
        window.location.href = `tel:${contactModalData.value}`
        break
      case 'web':
        window.open(contactModalData.value, '_blank')
        break
      case 'resume':
        window.open(profile.resume_file_url!, '_blank')
        break
    }
    setShowContactModal(false)
  }

  const handleSecondaryAction = () => {
    if (!contactModalData) return

    if (contactModalData.type === 'resume') {
      // Download the resume
      const link = document.createElement('a')
      link.href = profile.resume_file_url!
      link.download = 'resume.pdf'
      link.click()
    } else {
      // Copy to clipboard
      copyToClipboard(contactModalData.value, 'modal')
      setTimeout(() => setShowContactModal(false), 1000)
    }
  }

  const getPrimaryLabel = (type: ContactModalData['type']) => {
    switch (type) {
      case 'phone': return 'Call'
      case 'web': return 'Visit link'
      case 'email': return 'Open email'
      case 'resume': return 'View in app'
    }
  }

  const getSecondaryLabel = (type: ContactModalData['type']) => {
    switch (type) {
      case 'phone': return 'Copy number'
      case 'web': return 'Copy link'
      case 'email': return 'Copy email'
      case 'resume': return 'Download file'
    }
  }

  const getContactIcon = (type: ContactModalData['type']) => {
    switch (type) {
      case 'email':
        return (
          // <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          //   <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          //   <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          // </svg>

          <img src="/email_icon.svg" alt="" className="w-5 h-5" />
        )
      case 'phone':
        return (
          <img src="/phone_icon.svg" alt="" className="w-5 h-5" />
        )
      case 'web':
        return (
          <img src="/web_icon.svg" alt="" className="w-5 h-5" />
        )
      case 'resume':
        return (
          <img src="/resume_icon.svg" alt="" className="w-5 h-5" />
        )
    }
  }

  const handleVideoClick = () => {
    if (hasProfileVideo) {
      setShowVideoModal(true)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      {/* Cover Image Section */}
      <div className="rounded-b-[20px]" style={{ backgroundColor }}>
        <div className="relative">
          {/* Cover Image */}
          <div className="relative h-52 bg-grey2 rounded-b-[20px] overflow-hidden">
            {profile.cover_image_url ? (
              <Image
                src={profile.cover_image_url}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-mainPurple to-blue" />
            )}
          </div>

          {/* Content Container */}
          <div className="px-6">
            {/* Profile Picture - Overlapping */}
            <div className="flex justify-between items-end -mt-12 mb-4">
              {/* Profile Picture with Video Support */}
              <div className="relative">
                {hasProfileVideo ? (
                  <button
                    onClick={handleVideoClick}
                    className="relative w-[104px] h-[104px] rounded-full border-4 border-white overflow-hidden group cursor-pointer"
                    style={{
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                      padding: '3px'
                    }}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                      <video
                        ref={videoRef}
                        src={profile.profile_video_url || undefined}
                        poster={profile.profile_video_thumbnail_url || undefined}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="relative w-[104px] h-[104px] rounded-full border-4 border-white overflow-hidden bg-gray-200">
                    {profile.profile_image_url ? (
                      <Image
                        src={profile.profile_image_url}
                        alt={profile.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-mainPurple text-white text-4xl font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-1">
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full border border-grey6 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Name and Title */}
            <h1 className="text-xl font-bold leading-tight mb-1" style={{ color: textColor }}>
              {profile.name}
            </h1>
            <p className="text-sm mb-5" style={{ color: textColor, opacity: 0.7 }}>
              {profile.title}
            </p>

            {/* Bio */}
            {profile.bio ? (
              <p className="text-sm leading-relaxed mb-8" style={{ color: textColor, opacity: 0.9 }}>
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm italic mb-8" style={{ color: textColor, opacity: 0.5 }}>
                No bio yet.
              </p>
            )}

            {/* Divider */}
            <div className="h-px mb-6" style={{ backgroundColor: textColor, opacity: 0.1 }} />

            {/* Contact Icons */}
            <div className="flex gap-2 pb-8 mb-6">
              {showEmail && (
                <button
                  onClick={() => openContactModal('email', 'Email Address', profile.email)}
                  className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg> */}

                  <img src="/email_icon.svg" alt="" className="w-5 h-5" />
                </button>
              )}
              {showPhone && profile.phone && (
                <button
                  onClick={() => openContactModal('phone', 'Phone Number', profile.phone)}
                  className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg> */}

                  <img src="/phone_icon.svg" alt="" className="w-5 h-5" />
                </button>
              )}
              {showPortfolio && profile.portfolio_or_website_link && (
                <button
                  onClick={() => openContactModal('web', 'Portfolio / Website', profile.portfolio_or_website_link!)}
                  className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg> */}

                  <img src="/web_icon.svg" alt="" className="w-5 h-5" />
                </button>
              )}
              {showResume && profile.resume_file_url && (
                <button
                  onClick={() => openContactModal('resume', 'Resume', profile.resume_file_url!.split('/').pop() || '')}
                  className="flex-1 h-[52px] rounded-full bg-grey6 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  {/* <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg> */}

                  <img src="/resume_icon.svg" alt="" className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      {showSocialLinks && profile.social_links && profile.social_links.filter(link => link.is_enabled).length > 0 && (
        <div className="mt-2 mx-0">
          <div className="rounded-[20px] p-6" style={{ backgroundColor }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: textColor }}>Socials</h2>
            <div className="h-px mb-5" style={{ backgroundColor: textColor, opacity: 0.1 }} />
            
            <div className="space-y-6">
              {profile.social_links
                .filter(link => link.is_enabled)
                .map((link) => {
                  const platform = platformConfig[link.platform.toLowerCase()] || platformConfig['portfolio']
                  return (
                    <div key={link.id} className="flex items-center gap-4">
                      {/* Platform Icon */}
                      <div className="w-12 h-12 rounded-full bg-grey6 flex items-center justify-center flex-shrink-0">
                        <div style={{ color: platform.color }}>
                          {platform.icon}
                        </div>
                      </div>

                      {/* Platform Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold capitalize" style={{ color: textColor }}>
                          {link.platform}
                        </p>
                        <p className="text-base truncate underline" style={{ color: textColor, opacity: 0.6 }}>
                          {link.url}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(link.url, link.id)}
                          className="w-8 h-8 flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                          title="Copy link"
                        >
                          {copied === link.id ? (
                            <svg className="w-5 h-5 text-successGreen cursor-default" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => window.open(link.url, '_blank')}
                          className="w-8 h-8 flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                          title="Open link"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && contactModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-[20px] p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-normal text-gray-900">Leaving Segwae</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mb-5" />

            {/* Contact Info Container */}
            <div className="bg-grey6 rounded-lg p-4 mb-5">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {contactModalData.label}
              </p>
              <div className="h-px bg-gray-200 mb-3" />
              <div className="flex items-center gap-2">
                <div className="text-gray-900 flex-shrink-0">
                  {getContactIcon(contactModalData.type)}
                </div>
                <p className="text-base text-gray-900 break-all">
                  {contactModalData.value}
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handlePrimaryAction}
              className="w-full bg-mainPurple text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors mb-3 cursor-pointer"
            >
              {getPrimaryLabel(contactModalData.type)}
            </button>

            {/* Secondary Action Button */}
            <button
              onClick={handleSecondaryAction}
              className="w-full bg-grey6 text-gray-900 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {copied === 'modal' && contactModalData.type !== 'resume' ? 'Copied!' : getSecondaryLabel(contactModalData.type)}
            </button>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && hasProfileVideo && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setShowVideoModal(false)}
        >
          <button
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 text-white hover:text-grey3 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <video
            src={profile.profile_video_url || undefined}
            controls
            autoPlay
            className="max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}