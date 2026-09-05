'use client';

import { useState } from 'react';
import type { Service } from '@/types';
import { ServiceCard } from '@/components/ServiceCard';
import { ServiceGalleryModal } from '@/components/ServiceGalleryModal';
import { cn } from '@/lib/utils';

interface ServicePriceListProps {
  services: readonly Service[];
  className?: string;
}

/**
 * Grid de serviços interativo com fotos de cortes e modal de galeria ao clicar.
 */
export const ServicePriceList = ({ services, className }: ServicePriceListProps) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <div data-testid="service-price-list" className={cn('w-full', className)}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onOpenGallery={() => setSelectedService(service)}
          />
        ))}
      </div>

      {/* Galeria interativa aberta ao clicar no card ou nas fotos do serviço */}
      <ServiceGalleryModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
};

export default ServicePriceList;
