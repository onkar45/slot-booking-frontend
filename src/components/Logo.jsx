import { FiCalendar } from 'react-icons/fi';

function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`${sizes[size]} bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0`}>
        <FiCalendar className="w-1/2 h-1/2 text-white" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline`}>
          SlotBook
        </span>
      )}
    </div>
  );
}

export default Logo;
