"use client";

import { useParams } from "next/navigation";

function FlashcardsPage() {
  const params = useParams<{ f_id: string }>();
  return <div>hello {params.f_id}</div>;
}

export default FlashcardsPage;
