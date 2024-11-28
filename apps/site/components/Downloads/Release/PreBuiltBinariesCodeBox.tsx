'use client';

import { useContext } from 'react';
import type { FC } from 'react';

import DownloadCodeBox from '@/components/Downloads/DownloadCodeBox';
import { ReleaseContext } from '@/providers/releaseProvider';
import { getNodeDownloadUrl } from '@/util/getNodeDownloadUrl';

const PreBuiltBinariesCodeBox: FC = () => {
  const { os, release, bitness } = useContext(ReleaseContext);
  const url = getNodeDownloadUrl(
    release.versionWithPrefix,
    os,
    bitness,
    'binary'
  );

  return (
    <DownloadCodeBox
      codeLanguage="Bash"
      code={url}
      versionWithPrefix={release.versionWithPrefix}
    />
  );
};

export default PreBuiltBinariesCodeBox;
