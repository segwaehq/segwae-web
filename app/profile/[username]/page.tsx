// import { notFound } from 'next/navigation'
// import Image from 'next/image'
// import { getUserProfile } from '@/lib/supabase'
// import { trackProfileView } from '@/lib/analytics'
// import SocialIcon from '@/components/SocialIcon'
// import PortfolioLink from '@/components/PortfolioLink'
// import type { Metadata } from 'next'

// interface ProfilePageProps {
//   params: { username: string }
// }

// export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
//   const profile = await getUserProfile(params.username)

//   if (!profile) {
//     return {
//       title: 'Profile Not Found - Segwae',
//     }
//   }

//   return {
//     title: `${profile.name} - Segwae`,
//     description: profile.bio || `${profile.title} | Professional networking profile on Segwae`,
//     openGraph: {
//       title: `${profile.name} - Segwae`,
//       description: profile.bio || `${profile.title} | Professional networking profile`,
//       images: profile.profile_image_url
//         ? [{ url: profile.profile_image_url }]
//         : [{ url: 'https://segwae.com/logo.png' }],
//     },
//   }
// }

// export default async function ProfilePage({ params }: ProfilePageProps) {
//   const profile = await getUserProfile(params.username)

//   if (!profile) {
//     notFound()
//   }

//   // Track profile view (server-side)
//   await trackProfileView(profile.id)

//   const privacy = profile.privacy_settings
//   const showEmail = privacy?.show_email !== false
//   const showPhone = privacy?.show_phone !== false
//   const showSocialLinks = privacy?.show_social_links !== false
//   const showPortfolio = privacy?.show_portfolio !== false
//   const showResume = privacy?.show_resume !== false
//   const showProfileVideo = privacy?.show_profile_video !== false

//   return (
//     <div className="min-h-screen bg-grey6">
//       {/* Cover Image */}
//       <div className="relative h-64 bg-gradient-to-br from-mainPurple to-blue">
//         {profile.cover_image_url && (
//           <Image
//             src={profile.cover_image_url}
//             alt="Cover"
//             fill
//             className="object-cover"
//           />
//         )}
//       </div>

//       <div className="max-w-4xl mx-auto px-4 -mt-20 pb-16">
//         {/* Profile Header */}
//         <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
//           <div className="flex flex-col items-center text-center">
//             {/* Profile Image */}
//             <div className="relative w-32 h-32 mb-4">
//               {profile.profile_image_url ? (
//                 <Image
//                   src={profile.profile_image_url}
//                   alt={profile.name}
//                   fill
//                   className="rounded-full object-cover border-4 border-white shadow-lg"
//                 />
//               ) : (
//                 <div className="w-32 h-32 rounded-full bg-mainPurple flex items-center justify-center text-white text-4xl font-satoshi font-black border-4 border-white shadow-lg">
//                   {profile.name.charAt(0).toUpperCase()}
//                 </div>
//               )}
//             </div>

//             {/* Name & Title */}
//             <h1 className="font-satoshi font-black text-4xl mb-2">{profile.name}</h1>
//             <p className="font-spaceGrotesk text-xl text-grey2 mb-4">{profile.title}</p>

//             {/* Contact Info */}
//             <div className="flex flex-wrap gap-4 justify-center mb-6 text-grey2">
//               {showEmail && profile.email && (
//                 <a
//                   href={`mailto:${profile.email}`}
//                   className="flex items-center gap-2 hover:text-mainPurple transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                     <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                   </svg>
//                   <span className="font-openSans">{profile.email}</span>
//                 </a>
//               )}
//               {showPhone && profile.phone && (
//                 <a
//                   href={`tel:${profile.phone}`}
//                   className="flex items-center gap-2 hover:text-mainPurple transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                   </svg>
//                   <span className="font-openSans">{profile.phone}</span>
//                 </a>
//               )}
//             </div>

//             {/* Connection Count */}
//             {profile.connection_count > 0 && (
//               <div className="bg-lightPurple px-4 py-2 rounded-full">
//                 <span className="font-spaceGrotesk font-semibold text-mainPurple">
//                   {profile.connection_count} {profile.connection_count === 1 ? 'Connection' : 'Connections'}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Bio */}
//         {profile.bio && (
//           <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
//             <h2 className="font-spaceGrotesk font-bold text-2xl mb-4">About</h2>
//             <p className="font-openSans text-grey2 whitespace-pre-wrap">{profile.bio}</p>
//           </div>
//         )}

//         {/* Profile Video */}
//         {showProfileVideo && profile.profile_video_url && (
//           <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
//             <h2 className="font-spaceGrotesk font-bold text-2xl mb-4">Introduction Video</h2>
//             <video
//               controls
//               poster={profile.profile_video_thumbnail_url || undefined}
//               className="w-full rounded-xl"
//             >
//               <source src={profile.profile_video_url} type="video/mp4" />
//             </video>
//           </div>
//         )}

//         {/* Social Links */}
//         {showSocialLinks && profile.social_links && profile.social_links.length > 0 && (
//           <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
//             <h2 className="font-spaceGrotesk font-bold text-2xl mb-6">Connect With Me</h2>
//             <div className="flex flex-wrap gap-6 justify-center">
//               {profile.social_links
//                 .filter((link) => link.is_enabled)
//                 .map((link) => (
//                   <SocialIcon
//                     key={link.id}
//                     platform={link.platform}
//                     url={link.url}
//                     profileId={profile.id}
//                   />
//                 ))}
//             </div>
//           </div>
//         )}

//         {/* Portfolio/Website */}
//         {showPortfolio && profile.portfolio_or_website_link && (
//           <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
//             <h2 className="font-spaceGrotesk font-bold text-2xl mb-4">Portfolio</h2>
//             <PortfolioLink url={profile.portfolio_or_website_link} profileId={profile.id} />
//           </div>
//         )}

//         {/* Resume */}
//         {showResume && profile.resume_url && (
//           <div className="bg-white rounded-3xl shadow-xl p-8">
//             <h2 className="font-spaceGrotesk font-bold text-2xl mb-4">Resume</h2>
//             <a
//               href={profile.resume_url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-2 bg-mainPurple text-white px-6 py-3 rounded-full font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               Download Resume
//             </a>
//           </div>
//         )}

//         {/* CTA */}
//         <div className="mt-12 bg-gradient-to-br from-mainPurple to-blue rounded-3xl p-8 text-center text-white">
//           <h3 className="font-satoshi font-black text-3xl mb-4">
//             Create Your Own Digital Business Card
//           </h3>
//           <p className="font-spaceGrotesk text-lg mb-6 opacity-90">
//             Join thousands of professionals networking smarter with Segwae
//           </p>
//           <button className="bg-white text-mainPurple px-8 py-3 rounded-full font-spaceGrotesk font-semibold hover:bg-opacity-90 transition-all">
//             Coming Soon
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
















import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getUserProfile } from '@/lib/supabase'
import { trackProfileView } from '@/lib/analytics'
import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

interface ProfilePageProps {
  // params: { username: string }
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  // const profile = await getUserProfile(params.username)
  const { username } = await params
  const profile = await getUserProfile(username)

  if (!profile) {
    return {
      title: 'Profile Not Found - Segwae',
    }
  }

  return {
    title: `${profile.name} - Segwae`,
    description: profile.bio || `${profile.title} | Professional networking profile on Segwae`,
    openGraph: {
      title: `${profile.name} - Segwae`,
      description: profile.bio || `${profile.title} | Professional networking profile`,
      images: profile.profile_image_url
        ? [{ url: profile.profile_image_url }]
        : [{ url: 'https://segwae.com/logo.png' }],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // const profile = await getUserProfile(params.username)
  const { username } = await params
  const profile = await getUserProfile(username)

  if (!profile) {
    notFound()
  }

  // Track profile view (server-side)
  await trackProfileView(profile.id)

  return <ProfileClient profile={profile} />
}