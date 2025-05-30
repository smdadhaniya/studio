"use client";

import dynamic from "next/dynamic";

const HabitForgeApp = dynamic(() => import("../../components/HabitForgeApp"), {
  ssr: false,
});

export default function HomePage() {
  return <HabitForgeApp />;
}
