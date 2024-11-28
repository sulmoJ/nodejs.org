'use client';
import { useTranslations } from 'next-intl';
import { useContext, useEffect, useMemo } from 'react';
import type { FC } from 'react';

import Select from '@/components/Common/Select';
import FNM from '@/components/Icons/Platform/FNM';
import NVM from '@/components/Icons/Platform/NVM';
import { ReleaseContext } from '@/providers/releaseProvider';
import type { VersionManager } from '@/types/release';
import { formatDropdownItems, versionManagerItems } from '@/util/downloadUtils';

const VersionManagerDropdown: FC = () => {
  const { release, os, versionManager, setVersion } =
    useContext(ReleaseContext);
  const t = useTranslations();

  // @TODO: We should have a proper utility that gives
  // disabled OSs, Platforms, based on specific criteria
  // this can be an optimisation for the future
  // to remove this logic from this component
  const disabledItems = useMemo(() => {
    const disabledItems = [];

    if (os === 'WIN') {
      disabledItems.push('NVM');
    }

    return disabledItems;
  }, [os]);

  // @TODO: We should have a proper utility that gives
  // disabled OSs, Platforms, based on specific criteria
  // this can be an optimisation for the future
  // to remove this logic from this component
  useEffect(() => {
    const currentVersionManagerExcluded =
      disabledItems.includes(versionManager);

    const nonExcludedVm = versionManagerItems
      .map(({ value }) => value)
      .find(vm => !disabledItems.includes(vm));

    if (currentVersionManagerExcluded && nonExcludedVm) {
      setVersion(nonExcludedVm);
    }
    // we shouldn't react when "actions" change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release.status, disabledItems, versionManager]);

  return (
    <Select
      values={formatDropdownItems({
        items: versionManagerItems,
        icons: {
          NVM: <NVM width={16} height={16} />,
          FNM: <FNM width={16} height={16} />,
        },
        disabledItems,
      })}
      ariaLabel={t('layouts.download.dropdown.versionManager')}
      defaultValue={versionManager}
      onChange={vm => setVersion(vm as VersionManager)}
      className="min-w-28"
      inline={true}
    />
  );
};

export default VersionManagerDropdown;
