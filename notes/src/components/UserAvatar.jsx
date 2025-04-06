import React from 'react';

export default function UserAvatar({ user, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) return null;

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 flex items-center justify-center`}>
      {user.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {getInitials(user.name)}
        </span>
      )}
    </div>
  );
}