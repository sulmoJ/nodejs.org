import type { Meta as MetaObj, StoryObj } from '@storybook/react';

import LinkWithIcon from '@/components/Common/LinkWithIcon';

type Story = StoryObj<typeof LinkWithIcon>;
type Meta = MetaObj<typeof LinkWithIcon>;

export const Default: Story = {
  args: {
    href: 'https://nodejs.org/',
    children: 'Node.js',
  },
};

export default { component: LinkWithIcon } as Meta;
