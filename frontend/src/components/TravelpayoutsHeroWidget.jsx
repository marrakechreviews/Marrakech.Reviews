import React, { useEffect } from 'react';

const TravelpayoutsHeroWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&show_hotels=false&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%23EB5B1EFF&color_button=%23EB5B1EFF&color_icons=%23EB5B1EFF&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF00&special=%23C4C4C4&color_focused=%23EB5B1Eff&border_radius=0&no_labels=true&plain=true&destination=RAK&promo_id=7879&campaign_id=100";
    script.async = true;
    script.charset = "utf-8";
    
    const widgetContainer = document.getElementById('travelpayouts-hero-widget');
    if (widgetContainer) {
      // Clear the container before appending the new script
      widgetContainer.innerHTML = '';
      widgetContainer.appendChild(script);
    }

    return () => {
      if (widgetContainer && widgetContainer.contains(script)) {
        widgetContainer.removeChild(script);
      }
    };
  }, []);

  return <div id="travelpayouts-hero-widget" className="w-full"></div>;
};

export default TravelpayoutsHeroWidget;
