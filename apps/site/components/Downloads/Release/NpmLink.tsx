'use client';

import { useContext } from 'react';
import type { FC } from 'react';

import LinkWithIcon from '@/components/Common/LinkWithIcon';
import { ReleaseContext } from '@/providers/releaseProvider';

const NpmLink: FC = () => {
  const { release } = useContext(ReleaseContext);

  return (
    <LinkWithIcon
      href={`https://github.com/npm/cli/releases/tag/v${release.npm}`}
    >
      npm ({release.npm})
    </LinkWithIcon>
  );
};

export default NpmLink;
