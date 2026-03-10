const rawAssetVersion = process.env.NEXT_PUBLIC_ASSET_VERSION;

export const ASSET_VERSION =
  rawAssetVersion && rawAssetVersion.trim().length > 0
    ? rawAssetVersion.trim()
    : 'dev';

export function withAssetVersion(assetPath: string): string {
  if (!assetPath) return assetPath;
  const separator = assetPath.includes('?') ? '&' : '?';
  return `${assetPath}${separator}v=${encodeURIComponent(ASSET_VERSION)}`;
}

export function withEncodedAssetVersion(assetPath: string): string {
  return withAssetVersion(encodeURI(assetPath));
}
