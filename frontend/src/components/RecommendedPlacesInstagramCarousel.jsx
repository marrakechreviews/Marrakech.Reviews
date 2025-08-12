import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

const instagramVideos = [
  {
    id: 1,
    title: 'Exploring Jemaa el-Fnaa Square',
    url: 'https://www.instagram.com/p/C4f_1234567/', // Replace with actual Instagram video embed URL
    thumbnail: '/src/assets/images/jemaa-el-fnaa.jpg',
  },
  {
    id: 2,
    title: 'Serene Moments in Jardin Majorelle',
    url: 'https://www.instagram.com/p/C4g_7890123/', // Replace with actual Instagram video embed URL
    thumbnail: '/src/assets/images/jardin-majorelle.jpg',
  },
  {
    id: 3,
    title: 'Adventures in the Agafay Desert',
    url: 'https://www.instagram.com/p/C4h_4567890/', // Replace with actual Instagram video embed URL
    thumbnail: '/src/assets/images/agafay-desert.jpg',
  },
  {
    id: 4,
    title: 'Culinary Delights of Marrakech',
    url: 'https://www.instagram.com/p/C4i_1122334/', // Replace with actual Instagram video embed URL
    thumbnail: '/src/assets/images/marrakech-food-stall.jpg',
  },
];

const RecommendedPlacesInstagramCarousel = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Recommended Places I Visited
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore my favorite spots in Marrakech through Instagram videos.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-full"
        >
          <CarouselContent className="-ml-1">
            {instagramVideos.map((video) => (
              <CarouselItem key={video.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-video items-center justify-center p-6">
                      {/* Placeholder for Instagram Embed */}
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold">
                          {video.title}
                        </div>
                      </div>
                      {/* In a real application, you would use an Instagram embed library or iframe here */}
                      {/* Example: <iframe src={video.url} width="100%" height="100%" frameborder="0" scrolling="no" allowtransparency="true"></iframe> */}
                    </CardContent>
                    <CardHeader>
                      <CardTitle className="text-center">{video.title}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default RecommendedPlacesInstagramCarousel;

