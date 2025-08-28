import React, { useEffect } from 'react';

const TravelpayoutsFlightsWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&combine_promos=101_7873&show_hotels=false&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%23f76500&color_button=%23f76500&color_icons=%23f76500&dark=%23000000ff&light=%23FFFFFF&secondary=%23FFFFFF00&special=%23000000ff&color_focused=%2332a8dd&border_radius=30&no_labels=true&plain=true&origin=BOD&destination=RAK&promo_id=7879&campaign_id=100";
    script.defer = true;
    script.charset = "utf-8";

    const widgetContainer = document.getElementById('travelpayouts-flights-widget');
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

  return <div id="travelpayouts-flights-widget" className="w-full"></div>;
};

export default TravelpayoutsFlightsWidget;
