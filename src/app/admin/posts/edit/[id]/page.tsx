'use client';

export const dynamic = "force-dynamic";

import React from "react";
import AdminPostEditor from "@/components/AdminPostEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminPostEditor id={id} />;
}
