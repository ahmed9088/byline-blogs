import React from 'react';
import PostDetails from '../../../components/PostDetails';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <PostDetails slug={resolvedParams.slug} />;
}
