'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Milestone, Droplet, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { Button } from './ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/alunos', label: 'Alunos', icon: Users },
  { href: '/viagens', label: 'Viagens', icon: Milestone },
  { href: '/combustivel', label: 'Combustível', icon: Droplet },
];

const TopVanLogo = () => (
  <h1 className="text-2xl font-bold text-primary tracking-wider hidden md:block">TopVan</h1>
);

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref>
      <div
        className={cn(
          'flex items-center p-3 my-2 rounded-lg cursor-pointer transition-colors',
          'justify-center md:justify-start',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
      >
        <Icon className="h-6 w-6 md:mr-4" />
        <span className="hidden md:block">{label}</span>
      </div>
    </Link>
  );
};


const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-2 bg-card border-b">
                <Link href="/" passHref>
                    <h1 className="text-xl font-bold text-primary tracking-wider">TopVan</h1>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </header>

            {/* Mobile Menu */}
             <div className={cn(
                "md:hidden fixed top-12 left-0 right-0 z-30 bg-card p-4 transition-transform duration-300 ease-in-out",
                isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
            )}>
                 <nav>
                    {navItems.map(item => <NavLink key={item.href} {...item} />)}
                </nav>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 p-4 bg-card h-screen fixed top-0 left-0 border-r">
                <div className="mb-8">
                    <TopVanLogo />
                </div>
                <nav className="flex-1">
                    {navItems.map(item => <NavLink key={item.href} {...item} />)}
                </nav>
            </aside>

             {/* Mobile fixed sidebar (icons only) */}
             <aside className="md:hidden flex flex-col w-16 p-2 bg-card h-screen fixed top-0 left-0 border-r pt-16">
                 <nav className="flex-1">
                    {navItems.map(item => (
                         <Link href={item.href} key={item.href} passHref>
                            <div className={cn('flex items-center justify-center p-3 my-2 rounded-lg cursor-pointer transition-colors', usePathname() === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}>
                                <item.icon className="h-6 w-6" />
                            </div>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
