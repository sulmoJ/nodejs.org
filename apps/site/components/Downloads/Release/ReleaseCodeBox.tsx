'use client';
/**
 * @note not used now keep for future reference
 */
import { useTranslations } from 'next-intl';
import { useContext, useEffect, useState } from 'react';
import type { FC } from 'react';

import DownloadCodeBox from '@/components/Downloads/DownloadCodeBox';
import { ReleaseContext } from '@/providers/releaseProvider';
import { shikiPromise, highlightToHtml } from '@/util/getHighlighter';
import { getNodeDownloadSnippet } from '@/util/getNodeDownloadSnippet';

const memoizedShiki = shikiPromise.then(highlightToHtml);

const ReleaseCodeBox: FC = () => {
  const { platform, os, release } = useContext(ReleaseContext);

  const [code, setCode] = useState('');
  const t = useTranslations();

  useEffect(() => {
    const updatedCode = getNodeDownloadSnippet(release, os, t)[platform];
    // Docker and NVM support downloading tags/versions by their full release number
    // but usually we should recommend users to download "major" versions
    // since our Download Buttons get the latest minor of a major, it does make sense
    // to request installation of a major via a package manager
    memoizedShiki.then(shiki => shiki(updatedCode, 'bash')).then(setCode);
    // Only react when the specific release number changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release.versionWithPrefix, os, platform]);

  const codeLanguage = os === 'WIN' ? 'PowerShell' : 'Bash';

  return (
    <DownloadCodeBox
      codeLanguage={codeLanguage}
      code={code}
      versionWithPrefix={release.versionWithPrefix}
    />
  );
};

export default ReleaseCodeBox;
