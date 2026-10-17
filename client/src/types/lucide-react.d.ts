declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<LucideProps> & React.RefAttributes<SVGSVGElement>
  >;

  export const X: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Search: LucideIcon;
  export const Menu: LucideIcon;
  export const Share2: LucideIcon;
  export const Heart: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const MapPin: LucideIcon;
  export const Phone: LucideIcon;
  export const Mail: LucideIcon;
  export const User: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Info: LucideIcon;

  const icons: { [key: string]: LucideIcon };
  export default icons;
  export const createLucideIcon: any;
}
