import { Separator } from '@/components/ui/separator';

import ServiceTable from './components/data-table';

const ServicePage = () => (
  <main className="space-y-6 bg-background">
    <div>
      <h3 className="text-lg font-medium">Services</h3>
    </div>
    <Separator />
    <ServiceTable />
  </main>
);

export default ServicePage;
