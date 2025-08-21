import React, { useEffect } from 'react';

const TravelpayoutsHeroWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&show_hotels=true&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%23E78304FF&color_button=%23E78304ff&color_icons=%23E78304FF&dark=%23FFFFFFff&light=%23FFFFFF&secondary=%23FFFFFF00&special=%23C4C4C4&color_focused=%23E78304FF&border_radius=2&no_labels=&plain=true&destination=RAK&promo_id=7879&campaign_id=100";
    script.async = true;
    script.charset = "utf-8";
    
    const widgetContainer = document.getElementById('travelpayouts-hero-widget');
    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }

    return () => {
      if (widgetContainer && widgetContainer.contains(script)) {
        widgetContainer.removeChild(script);
      }
    };
  }, []);

  return <div id="travelpayouts-hero-widget"></div>;
};

export default TravelpayoutsHeroWidget;
