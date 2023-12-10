import { Separator } from '@/components/ui/separator';

import ServicesTable from './components/services-table';

const Services = () => (
  <main className="space-y-6 bg-background">
    <div>
      <h3 className="text-lg font-medium">Services</h3>
    </div>
    <Separator />
    <ServicesTable />
  </main>
);

export default Services;
