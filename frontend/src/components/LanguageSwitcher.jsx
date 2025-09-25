import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const scriptId = 'google-translate-script';

    const initialize = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
      script.async = true;
      document.body.appendChild(script);
      window.googleTranslateElementInit = initialize;
    }

    if (isOpen) {
        // A small delay to ensure the dropdown is rendered and the element is available
        const timer = setTimeout(() => {
            if (window.google && window.google.translate) {
                // Re-initialize the widget
                initialize();
            }
        }, 100); // 100ms delay

        return () => clearTimeout(timer);
    }

  }, [isOpen]);

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Switch language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <div id="google_translate_element_container" className="p-2">
          {/* Using a key to force re-mounting of the div which can help with widget re-initialization */}
          <div id="google_translate_element" key={isOpen ? 'open' : 'closed'}></div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GoogleTranslate;