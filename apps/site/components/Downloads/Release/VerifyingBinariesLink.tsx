import type { FC, PropsWithChildren } from 'react';

import LinkWithIcon from '@/components/Common/LinkWithIcon';

const VerifyingBinariesLink: FC<PropsWithChildren> = ({ children }) => (
  <LinkWithIcon href="https://github.com/nodejs/node#verifying-binaries">
    {children}
  </LinkWithIcon>
);

export default VerifyingBinariesLink;
