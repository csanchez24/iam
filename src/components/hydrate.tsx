'use client';

import { Hydrate as ReactQueryHydrate, type HydrateProps } from '@tanstack/react-query';

export const Hydrate = (props: HydrateProps) => {
  return <ReactQueryHydrate {...props} />;
};
