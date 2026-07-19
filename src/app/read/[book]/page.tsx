"use client";

import { BookSlug } from "@/lib/types";
import ReadMode from "@/components/ReadMode";
import { useParams } from "next/navigation";

export default function ReadBookPage() {
  const params = useParams();
  const bookSlug = params.book as BookSlug;

  return <ReadMode bookSlug={bookSlug} />;
}
