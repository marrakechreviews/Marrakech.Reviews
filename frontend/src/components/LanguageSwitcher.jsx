import React, { useEffect } from 'react';

const GoogleTranslate = () => {
  useEffect(() => {
    // Check if the script already exists
    if (document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]')) {
      return;
    }

    const addScript = document.createElement('script');
    addScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    addScript.async = true;
    document.body.appendChild(addScript);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element'
      );
    };

    return () => {
      // It's tricky to clean up Google's scripts and widgets perfectly.
      // A simple cleanup might involve removing the script, but the widget can leave behind artifacts.
      // For this implementation, we will leave the script and widget in the DOM.
    };
  }, []);

  return (
    <div id="google_translate_element_container" className="flex items-center">
      <div id="google_translate_element"></div>
    </div>
  );
};

export default GoogleTranslate;
