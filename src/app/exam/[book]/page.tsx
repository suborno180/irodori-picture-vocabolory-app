"use client";

import { BookSlug } from "@/lib/types";
import Quiz from "@/components/Quiz";
import { useParams } from "next/navigation";

export default function ExamBookPage() {
  const params = useParams();
  const bookSlug = params.book as BookSlug;

  return <Quiz bookSlug={bookSlug} />;
}
