interface StatsCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  href?: string
}

export default function StatsCard({ title, value, icon, color, href }: StatsCardProps) {
  const colorClasses = {
    purple: 'bg-mainPurple/10 text-mainPurple',
    blue: 'bg-blue/10 text-blue',
    green: 'bg-successGreen/10 text-successGreen',
    yellow: 'bg-warningYellow/10 text-warningYellow',
  }

  const Content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-spaceGrotesk font-semibold text-sm text-grey2">{title}</h3>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <p className="font-satoshi font-black text-4xl">{value}</p>
    </>
  )

  if (href) {
    return (
      <a href={href} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow block">
        {Content}
      </a>
    )
  }

  return <div className="bg-white rounded-2xl p-6 shadow-lg">{Content}</div>
}