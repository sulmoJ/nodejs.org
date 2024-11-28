import { getTranslations } from 'next-intl/server';
import type { FC, PropsWithChildren } from 'react';

import LinkTabs from '@/components/Common/LinkTabs';
import WithNodeRelease from '@/components/withNodeRelease';
import { useClientContext } from '@/hooks/react-server';
import getReleaseData from '@/next-data/releaseData';
import { ReleaseProvider } from '@/providers/releaseProvider';
import type { NodeReleaseStatus } from '@/types';
import { getDownloadCategory, mapCategoriesToTabs } from '@/util/downloadUtils';

const WithDownloadCategories: FC<PropsWithChildren> = async ({ children }) => {
  const t = await getTranslations();
  const releases = await getReleaseData();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useClientContext();
  const { page, category, subCategory } = getDownloadCategory(pathname);

  const initialRelease: NodeReleaseStatus = pathname.includes('current')
    ? 'Current'
    : 'LTS';

  return (
    <LinkTabs
      activeTab={category}
      label={t('layouts.download.selectCategory')}
      tabs={mapCategoriesToTabs({
        page: page,
        categories: [
          // i18n keys
          // layouts.download.categories.xxx
          {
            category: 'version-manager',
            label: t('layouts.download.categories.version-manager'),
          },
          {
            category: 'os-package-manager',
            label: t('layouts.download.categories.os-package-manager'),
          },
          {
            category: 'prebuilt-binaries',
            label: t('layouts.download.categories.prebuilt-binaries'),
          },
          {
            category: 'other-ways',
            label: t('layouts.download.categories.other-ways'),
          }
        ],
        subCategory: subCategory,
      })}
    >
      <WithNodeRelease status={initialRelease}>
        {({ release }) => (
          <ReleaseProvider initialRelease={release} releases={releases}>
            {children}
          </ReleaseProvider>
        )}
      </WithNodeRelease>
    </LinkTabs>
  );
};

export default WithDownloadCategories;
