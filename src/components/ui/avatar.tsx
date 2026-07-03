interface AvatarProps { src?: string; name?: string; size?: 'sm' | 'md' | 'lg'; className?: string }
export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'
  const displayName = name || 'U'
  if (src) return <img src={src} className={'rounded-full object-cover ' + sizeClass + ' ' + className} alt={displayName} />
  return <div className={'rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold ' + sizeClass + ' ' + className}>{displayName[0]}</div>
}