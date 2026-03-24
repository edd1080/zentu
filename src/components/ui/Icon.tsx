import { Icon as IconifyIcon } from "@iconify/react";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 20 }: IconProps) {
  return (
    <IconifyIcon icon={name} width={size} height={size} className={className} />
  );
}
