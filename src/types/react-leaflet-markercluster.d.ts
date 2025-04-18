declare module '@changey/react-leaflet-markercluster' {
  import { ComponentType, ReactNode } from 'react';
  import { MarkerProps } from 'react-leaflet';

  interface MarkerClusterGroupProps {
    children?: ReactNode;
    iconCreateFunction?: (cluster: any) => any;
    showCoverageOnHover?: boolean;
    spiderfyOnMaxZoom?: boolean;
    maxClusterRadius?: number;
  }

  const MarkerClusterGroup: ComponentType<MarkerClusterGroupProps>;
  export default MarkerClusterGroup;
} 