'use client';

import type { FC, PropsWithChildren } from 'react';
import { useContext } from 'react';

import LinkWithIcon from '@/components/Common/LinkWithIcon';
import { ReleaseContext } from '@/providers/releaseProvider';

const BlogPostLink: FC<PropsWithChildren> = ({ children }) => {
  const { release } = useContext(ReleaseContext);
  const version = release.versionWithPrefix;

  return (
    <LinkWithIcon href={`/blog/release/${version}`}>{children}</LinkWithIcon>
  );
};

export default BlogPostLink;
