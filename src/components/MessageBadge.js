import React from 'react';
import { useNotifications } from './NotificationSystem';

export default function MessageBadge() {
    const { unreadCount } = useNotifications();

    if (unreadCount === 0) return null;

    return (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    );
}
