'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Milestone, Droplet, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

const navItems = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/alunos', label: 'Alunos', icon: Users },
  { href: '/viagens', label: 'Viagens', icon: Milestone },
  { href: '/combustivel', label: 'Combustível', icon: Droplet },
];

const TopVanLogo = () => (
    <Link href="/" passHref>
        <h1 className="text-2xl font-bold text-primary tracking-wider">TopVan</h1>
    </Link>
);

const NavLink = ({ href, label, icon: Icon, onClick, isMobile }: { href: string; label: string; icon: React.ElementType, onClick?: () => void, isMobile?: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref onClick={onClick}>
      <div
        className={cn(
          'flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors justify-start',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
      >
        <Icon className="h-6 w-6 mr-4" />
        <span className={cn(isMobile ? 'block' : 'hidden md:block')}>{label}</span>
      </div>
    </Link>
  );
};


const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-2 h-16 bg-card border-b">
                <TopVanLogo />
                <Button variant="ghost" className="h-12 w-12" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                </Button>
            </header>

            {/* Mobile Menu Overlay */}
             {isMobileMenuOpen && (
                 <div 
                    className="md:hidden fixed inset-0 z-20 bg-black/60"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu */}
             <div className={cn(
                "md:hidden fixed top-0 left-0 h-full w-64 z-30 bg-card p-4 transition-transform duration-300 ease-in-out border-r",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                 <div className="mb-8">
                    <TopVanLogo />
                </div>
                 <nav>
                    {navItems.map(item => <NavLink key={item.href} {...item} onClick={() => setIsMobileMenuOpen(false)} isMobile />)}
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
        </>
    );
};

export default Sidebar;
