export const PADEL_IMAGE = "https://images.unsplash.com/photo-1646649851780-d9701b7c3c04";

export function padelImg(width: number, quality = 80) {
  return `${PADEL_IMAGE}?w=${width}&q=${quality}&fit=crop`;
}
