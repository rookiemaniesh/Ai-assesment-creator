import { Plus } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      {/* Illustration */}
      <div className="relative mb-8">
        <EmptyStateIllustration />
      </div>

      {/* Text Content */}
      <h2 className="mb-2 text-center text-xl font-semibold text-foreground">{title}</h2>
      <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Action Button */}
      <button
        onClick={onAction}
        className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        <Plus className="size-4" />
        <span>{actionLabel}</span>
      </button>
    </div>
  )
}

function EmptyStateIllustration() {
  return (
    <svg
      width="200"
      height="180"
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground"
    >
      {/* Decorative elements */}
      {/* Sparkle top left */}
      <path
        d="M60 35 L62 40 L67 42 L62 44 L60 49 L58 44 L53 42 L58 40 Z"
        fill="#9CA3AF"
        opacity="0.6"
      />
      
      {/* Small sparkle bottom left */}
      <path
        d="M75 130 L76 133 L79 134 L76 135 L75 138 L74 135 L71 134 L74 133 Z"
        fill="#9CA3AF"
        opacity="0.4"
      />
      
      {/* Dot top right */}
      <circle cx="165" cy="95" r="4" fill="#60A5FA" opacity="0.7" />
      
      {/* Scissors/pen decoration */}
      <g transform="translate(55, 25)">
        <ellipse cx="20" cy="12" rx="18" ry="6" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5" />
        <path
          d="M38 12 Q55 8, 70 20"
          stroke="#9CA3AF"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M70 20 Q72 22, 70 24 Q68 22, 70 20"
          fill="#9CA3AF"
        />
      </g>
      
      {/* Checklist card */}
      <g transform="translate(125, 40)">
        <rect x="0" y="0" width="45" height="35" rx="6" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="8" y="10" width="20" height="4" rx="2" fill="#3B82F6" />
        <circle cx="35" cy="12" r="4" fill="#E5E7EB" />
        <rect x="8" y="20" width="12" height="4" rx="2" fill="#E5E7EB" />
      </g>
      
      {/* Main magnifying glass */}
      <g transform="translate(70, 55)">
        {/* Glass circle background */}
        <circle cx="45" cy="45" r="42" fill="#FEF3C7" />
        <circle cx="45" cy="45" r="35" fill="#FEF9C3" />
        
        {/* Handle */}
        <rect
          x="75"
          y="75"
          width="12"
          height="35"
          rx="6"
          fill="#A78BFA"
          transform="rotate(45, 81, 92)"
        />
        
        {/* Glass rim */}
        <circle cx="45" cy="45" r="32" fill="none" stroke="#C4B5FD" strokeWidth="8" />
        
        {/* X mark */}
        <g transform="translate(30, 30)">
          <circle cx="15" cy="15" r="18" fill="#FCA5A5" />
          <path
            d="M9 9 L21 21 M21 9 L9 21"
            stroke="#DC2626"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </g>
      
      {/* Small decorative circle */}
      <circle cx="165" cy="115" r="2" fill="#60A5FA" opacity="0.5" />
    </svg>
  )
}
