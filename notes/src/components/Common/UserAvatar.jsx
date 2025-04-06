export default function UserAvatar({ user, size = 'md', online = false }) {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base'
    };
  
    const onlineClasses = {
      sm: 'w-2 h-2 bottom-0 right-0',
      md: 'w-2.5 h-2.5 bottom-0.5 right-0.5',
      lg: 'w-3 h-3 bottom-1 right-1'
    };
  
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium`}>
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          user?.name?.split(' ').map(n => n[0]).join('')
        )}
        {online && (
          <span className={`absolute ${onlineClasses[size]} bg-green-500 rounded-full border-2 border-white dark:border-gray-800`}></span>
        )}
      </div>
    );
  }