import React from 'react';
import { Sun, Smile, Shirt, Utensils, Backpack, DoorOpen, Book, Gamepad2, Circle } from 'lucide-react';
import { TaskIcon } from '../types';

interface IconDisplayProps {
  icon: TaskIcon;
  size?: number;
  className?: string;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({ icon, size = 24, className = "" }) => {
  const props = { size, className };
  
  switch (icon) {
    case TaskIcon.SUN: return <Sun {...props} />;
    case TaskIcon.TOOTHBRUSH: return <Smile {...props} />; // Approximation for toothbrush
    case TaskIcon.SHIRT: return <Shirt {...props} />;
    case TaskIcon.UTENSILS: return <Utensils {...props} />;
    case TaskIcon.BACKPACK: return <Backpack {...props} />;
    case TaskIcon.DOOR_OPEN: return <DoorOpen {...props} />;
    case TaskIcon.BOOK: return <Book {...props} />;
    case TaskIcon.GAMEPAD: return <Gamepad2 {...props} />;
    default: return <Circle {...props} />;
  }
};