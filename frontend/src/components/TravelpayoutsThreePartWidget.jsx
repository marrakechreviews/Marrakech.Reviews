import React, { useEffect } from 'react';

const TravelpayoutsThreePartWidget = () => {
  useEffect(() => {
    const scripts = [
      "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&destination=RAK&target_host=www.aviasales.com%2Fsearch&locale=en&limit=6&powered_by=true&width=260&primary=%23F76500ff&promo_id=4044&campaign_id=100",
      "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&destination=CMN&target_host=www.aviasales.com%2Fsearch&locale=en&limit=6&powered_by=true&width=260&primary=%23F76500ff&promo_id=4044&campaign_id=100",
      "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&destination=TNG&target_host=www.aviasales.com%2Fsearch&locale=en&limit=6&powered_by=true&width=260&primary=%23F76500ff&promo_id=4044&campaign_id=100"
    ];

    const widgetContainer = document.getElementById('travelpayouts-three-part-widget');

    if (widgetContainer) {
      scripts.forEach((src, index) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.charset = "utf-8";
        
        const container = document.getElementById(`widget-part-${index}`);
        if(container) {
          container.appendChild(script);
        }
      });
    }

    return () => {
        scripts.forEach((src, index) => {
            const container = document.getElementById(`widget-part-${index}`);
            if (container) {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }
        });
    };
  }, []);

  return (
    <div id="travelpayouts-three-part-widget" className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <div id="widget-part-0"></div>
          <div id="widget-part-1"></div>
          <div id="widget-part-2"></div>
        </div>
      </div>
    </div>
  );
};

export default TravelpayoutsThreePartWidget;
