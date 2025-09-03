import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  return <header className="relative z-50">
      <nav className="flex h-9 w-full items-center justify-between text-sm text-foreground font-bold" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/lovable-uploads/51c7b4f6-fd5e-4c1f-9928-eb2e0ee4986d.png" alt="Finsage Logo" className="h-[18px] w-[123px] xs:h-[20px] xs:w-[137px] sm:h-[22px] sm:w-[150px] md:h-[26px] md:w-[177px] lg:h-[29.22px] lg:w-[199px]" />
        </div>

        {/* Tablet & Mobile Menu Button */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-foreground hover:text-primary transition-colors" aria-label="Toggle mobile menu">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-end gap-[35px] flex-1">
          <div className="flex items-center gap-[27px] font-normal whitespace-nowrap">
            <div className="flex items-center gap-[23px]">
              <a href="#about" className="text-foreground hover:text-primary transition-colors">
                About
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
            <div className="w-0 shrink-0 h-[31px] border-l-2 border-foreground" aria-hidden="true" />
            
            <a href="#individuals" className="text-foreground hover:text-primary transition-colors">
              For Individuals
            </a>
            
            <Button 
              variant="outline"
              className="px-4 py-2 rounded-full border-2 border-foreground text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => window.location.href = '/employers'}
            >
              For Employers
            </Button>
          </div>
          
          <Button 
            variant="ghost"
            className="text-foreground hover:text-primary transition-colors"
            onClick={() => window.location.href = '/login'}
          >
            Log In
          </Button>
          
          <Button 
            className="px-3.5 py-2.5 rounded-[39px] min-h-[38px] w-[150px] text-white bg-[#447f73]"
            onClick={() => window.location.href = '/book-demo'}
          >
            Book a Demo (HR)
          </Button>
        </div>

        {/* Mobile & Tablet Navigation Menu */}
        {isMobileMenuOpen && <div className="absolute top-full left-0 right-0 bg-background border border-border shadow-lg lg:hidden z-[100]">
            <div className="flex flex-col p-4 space-y-4">
              <a href="#about" className="py-2 text-foreground hover:text-primary transition-colors">
                About
              </a>
              <a href="#contact" className="py-2 text-foreground hover:text-primary transition-colors">
                Contact
              </a>
              <a href="#individuals" className="py-2 text-foreground hover:text-primary transition-colors">
                For Individuals
              </a>
              
              <Button 
                variant="outline"
                className="px-4 py-2 rounded-full border-2 border-foreground text-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full justify-center"
                onClick={() => window.location.href = '/employers'}
              >
                For Employers
              </Button>
              
              <Button 
                variant="ghost"
                className="py-2 text-foreground hover:text-primary transition-colors w-full justify-start"
                onClick={() => window.location.href = '/login'}
              >
                Log In
              </Button>
              
              <Button 
                className="text-primary-foreground px-3.5 py-2.5 rounded-[39px] w-full mt-4 bg-[#447f73]"
                onClick={() => window.location.href = '/book-demo'}
              >
                Book a Demo (HR)
              </Button>
            </div>
          </div>}
      </nav>
    </header>;
};
export default Header;