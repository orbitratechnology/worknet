import React, { memo } from 'react';
import { ServiceCard, type ServiceCardProps } from './service-card';

export type ServiceListCardProps = ServiceCardProps;

/** @deprecated Use `ServiceCard` directly. */
export const ServiceListCard = memo(function ServiceListCard(
  props: ServiceListCardProps,
) {
  return <ServiceCard {...props} />;
});
