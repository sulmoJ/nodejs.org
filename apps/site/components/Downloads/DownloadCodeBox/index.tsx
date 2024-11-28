'use client';
// @todo use module css + storybook
import { useTranslations } from 'next-intl';
import type { FC } from 'react';
import semVer from 'semver';

import Banner from '@/components/Common/Banner';
import CodeBox from '@/components/Common/CodeBox';
import { ESP_SUPPORT_THRESHOLD_VERSION } from '@/next.constants.mjs';

type DownloadCodeBoxProps = {
  codeLanguage: string;
  code: string;
  versionWithPrefix: string;
};

const DownloadCodeBox: FC<DownloadCodeBoxProps> = ({ codeLanguage, code, versionWithPrefix }) => {
  const t = useTranslations();

  return(
  <div className="mb-2 mt-6 flex flex-col gap-2">
    {semVer.lt(versionWithPrefix, ESP_SUPPORT_THRESHOLD_VERSION) && (
      <Banner type="error" link="/about/previous-releases/">
        {t('layouts.download.codeBox.unsupportedVersionWarning')}&nbsp;
      </Banner>
    )}
    <CodeBox language={codeLanguage} className="min-h-[15.5rem]">
      <code dangerouslySetInnerHTML={{ __html: code }} />
    </CodeBox>
    <span className="text-center text-xs text-neutral-800 dark:text-neutral-200">
      {t('layouts.download.codeBox.communityWarning')}
      <br />
      <b>{t('layouts.download.codeBox.communityWarningReport')}</b>
    </span>
  </div>
);
};


export default DownloadCodeBox;
