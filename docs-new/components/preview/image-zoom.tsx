import BannerImage from '@/public/banner.png';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { ReactNode } from 'react';

export default function Preview(): ReactNode {
  return (
    <ImageZoom
      alt="banner"
      src={BannerImage}
      className="!my-0 rounded-xl bg-fd-background"
      priority
    />
  );
}
