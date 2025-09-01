import React, { useEffect } from 'react';

const TravelpayoutsFourPartWidget = () => {
  const widgets = [
    {
      id: 'widget1',
      src: "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&destination=RAK&target_host=www.aviasales.com%2Fsearch&locale=en&limit=6&powered_by=true&width=260&primary=%23F76500ff&promo_id=4044&campaign_id=100"
    },
    {
      id: 'widget2',
      src: "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&destination=CMN&target_host=www.aviasales.com%2Fsearch&locale=en&limit=6&powered_by=true&width=260&primary=%23F76500ff&promo_id=4044&campaign_id=100"
    },
    {
      id: 'widget3',
      src: "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&destination=TNG&target_host=www.aviasales.com%2Fsearch&locale=en&limit=6&powered_by=true&width=260&primary=%23F76500ff&promo_id=4044&campaign_id=100"
    },
    {
      id: 'widget4',
      src: "https://tpwdgt.com/content?currency=eur&trs=451574&shmarker=666986&destination=ESU&target_host=www.aviasales.com%2Fsearch&locale=en&limit=6&powered_by=true&width=260&primary=%23F76500ff&promo_id=4044&campaign_id=100"
    }
  ];

  useEffect(() => {
    const scriptElements = [];
    widgets.forEach(widget => {
      const script = document.createElement('script');
      script.src = widget.src;
      script.defer = true;
      script.charset = "utf-8";

      const widgetContainer = document.getElementById(widget.id);
      if (widgetContainer) {
        // Clear the container before appending the new script
        widgetContainer.innerHTML = '';
        widgetContainer.appendChild(script);
        scriptElements.push({ container: widgetContainer, script });
      }
    });

    return () => {
      scriptElements.forEach(({ container, script }) => {
        if (container && container.contains(script)) {
          container.removeChild(script);
        }
      });
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {widgets.map(widget => (
        <div key={widget.id} id={widget.id}></div>
      ))}
    </div>
  );
};

export default TravelpayoutsFourPartWidget;
