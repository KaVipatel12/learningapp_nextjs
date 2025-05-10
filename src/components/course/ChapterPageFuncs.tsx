"use client";
import { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';

// ======================
// Button Component
// ======================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary',
  };

  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ======================
// Dropdown Components
// ======================
interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
  sideOffset?: number;
}

interface DropdownMenuItemProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

const DropdownMenuTrigger = ({ asChild, children }: DropdownMenuTriggerProps) => {
  return asChild ? (
    <>{children}</>
  ) : (
    <Button variant="ghost" size="icon">
      {children}
    </Button>
  );
};

const DropdownMenuContent = ({ 
  align = 'end', 
  children,
  sideOffset = 8
}: DropdownMenuContentProps) => {
  const alignment = {
    start: 'origin-top-left left-0',
    center: 'origin-top',
    end: 'origin-top-right right-0',
  };

  return (
    <div 
      className={`${alignment[align]} absolute mt-${sideOffset} w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition-all duration-100`}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

const DropdownMenuItem = ({ 
  className = '', 
  children, 
  onClick,
  ...props 
}: DropdownMenuItemProps) => {
  return (
    <div 
      className={`${className} px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer flex items-center`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// ======================
// Dialog Components
// ======================
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

const Dialog = ({ 
  open, 
  onOpenChange, 
  children 
}: DialogProps) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)} 
      />
      {children}
    </div>
  );
};

const DialogContent = ({ children }: DialogContentProps) => {
  return (
    <div className="relative z-50 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
      {children}
    </div>
  );
};

const DialogHeader = ({ children }: DialogHeaderProps) => {
  return (
    <div className="border-b px-6 py-4">
      {children}
    </div>
  );
};

const DialogTitle = ({ children }: DialogTitleProps) => {
  return <h3 className="text-lg font-semibold">{children}</h3>;
};

const DialogFooter = ({ children }: DialogFooterProps) => {
  return (
    <div className="border-t px-6 py-4 flex justify-end gap-2">
      {children}
    </div>
  );
};

// ======================
// Chapter Dropdown Implementation
// ======================
interface ChapterDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ChapterDropdown = ({ onEdit, onDelete }: ChapterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownMenu>
      <div ref={dropdownRef} className="relative">
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            <FiMoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        {isOpen && (
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              onEdit();
              setIsOpen(false);
            }}>
              <FiEdit className="mr-2 h-4 w-4" />
              Edit Chapter
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="text-red-600 hover:bg-red-50"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Delete Chapter
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </div>
    </DropdownMenu>
  );
};

// ======================
// Example Usage
// ======================
interface Chapter {
  id: string;
  title: string;
  description: string;
}

interface ChapterItemProps {
  chapter: Chapter;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChapterItem = ({ chapter, onEdit, onDelete }: ChapterItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center p-4 border rounded-lg">
        <div>
          <h3 className="font-medium">{chapter.title}</h3>
          <p className="text-sm text-gray-600">{chapter.description}</p>
        </div>
        
        <ChapterDropdown
          onEdit={() => onEdit(chapter.id)}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chapter</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4">
            <p>Are you sure you want to delete this chapter? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete(chapter.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ======================
// Export All Components
// ======================
export {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  ChapterDropdown,
  ChapterItem
};