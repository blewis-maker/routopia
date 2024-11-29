'use client';

import { useAsset } from '@/hooks/useAsset';

interface IconProps {
  assetId: string;
  className?: string;
}

export function Icon({ assetId, className }: IconProps) {
  const asset = useAsset(assetId, 'Icon');

  if (!asset) return null;

  return (
    <img 
      src={asset.path}
      width={asset.dimensions.width}
      height={asset.dimensions.height}
      className={className}
      alt=""
    />
  );
} 