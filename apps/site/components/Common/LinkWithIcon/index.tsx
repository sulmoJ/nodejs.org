import { LinkIcon } from '@heroicons/react/24/solid';
import type { SlotProps } from '@radix-ui/react-slot';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps, FC, PropsWithChildren } from 'react';

import Link from '@/components/Link';

import styles from './index.module.css';

type LinkWithIconProps =
  | ({ asChild?: false } & ComponentProps<typeof Link>)
  | ({ asChild: true } & SlotProps);

const LinkWithIcon: FC<PropsWithChildren<LinkWithIconProps>> = ({
  children,
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : Link;

  return (
    <Comp {...props}>
      <span>
        {children}
        <LinkIcon className={styles.icon} />
      </span>
    </Comp>
  );
};

export default LinkWithIcon;
