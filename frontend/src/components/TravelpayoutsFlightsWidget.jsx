import React, { useEffect } from 'react';

const TravelpayoutsFlightsWidget = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&color_button=%23DD9232FF&target_host=www.aviasales.com%2Fsearch&locale=en&powered_by=true&origin=PAR&destination=RAK&with_fallback=true&non_direct_flights=true&min_lines=5&border_radius=5&color_background=%23FFFFFF&color_text=%23000000&color_border=%23FFFFFF&promo_id=2811&campaign_id=100";
    script.async = true;
    script.charset = "utf-8";

    const widgetContainer = document.getElementById('travelpayouts-flights-widget');
    if (widgetContainer) {
      widgetContainer.appendChild(script);
    }

    return () => {
      if (widgetContainer && widgetContainer.contains(script)) {
        widgetContainer.removeChild(script);
      }
    };
  }, []);

  return <div id="travelpayouts-flights-widget" className="flex justify-center"></div>;
};

export default TravelpayoutsFlightsWidget;
