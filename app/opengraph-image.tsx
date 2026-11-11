import { ImageResponse } from "next/og";
import { AvtoMarkCard } from "@/components/AvtoMark";

export const alt = "Avto Grigolia, Product Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(<AvtoMarkCard markHeight={220} />, size);
}
