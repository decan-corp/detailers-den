import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import RequiredIndicator from 'src/components/form/required-indicator';
import { LocalStorageKey } from 'src/constants/storage-keys';
import { useRecentOptions } from 'src/hooks/use-recent-options';
import { useServiceOptions } from 'src/queries/services';
import { useCrewOptions } from 'src/queries/users';

import { TransactionFormState, getDefaultServiceValue } from '../data-form';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { PlusCircleIcon, XIcon } from 'lucide-react';
import { Updater } from 'use-immer';

const AvailedServices = ({
  formState,
  setFormState,
  isSaving,
}: {
  formState: TransactionFormState;
  setFormState: Updater<TransactionFormState>;
  isSaving?: boolean;
}) => {
  const [parent] = useAutoAnimate();
  const { data: serviceOptions = [], isLoading: isFetchingServices } = useServiceOptions();
  const { data: crewOptions = [], isLoading: isFetchingCrews } = useCrewOptions();

  const {
    storedRecentSelections: savedRecentCrewList,
    saveRecentSelections: saveRecentSelectedCrew,
  } = useRecentOptions(LocalStorageKey.RecentSelectedCrew);
  const {
    storedRecentSelections: savedRecentServiceList,
    saveRecentSelections: saveRecentSelectedService,
  } = useRecentOptions(LocalStorageKey.RecentSelectedService);

  const onSelectService = (serviceId: string, index: number) => {
    setFormState((prevState) => {
      const serviceOption = serviceOptions.find(({ id }) => id === serviceId);
      const priceMatrix = serviceOption?.priceMatrix.find(
        ({ vehicleSize }) => vehicleSize === prevState.selectedVehicleSize
      );
      prevState.transactionServices[index].serviceId = serviceId;
      prevState.transactionServices[index].price = String(priceMatrix?.price || 0);
      prevState.recentSelectedService.push(serviceId);
    });
    saveRecentSelectedService(serviceId);
  };

  return (
    <div className="space-y-6">
      <div className="font-semibold leading-none tracking-tight">Services</div>
      <div ref={parent} className="flex flex-col gap-4">
        {formState.transactionServices.map((service, index) => {
          const derivedServiceOptions = serviceOptions
            .filter(({ priceMatrix }) => {
              const availableVehicleSizes = priceMatrix.map(({ vehicleSize }) => vehicleSize);
              return availableVehicleSizes.includes(formState.selectedVehicleSize);
            })
            .filter(({ id }) => {
              const serviceIds = formState.transactionServices.map(({ serviceId }) => serviceId);
              return id === service.serviceId || !serviceIds.includes(id);
            });

          const mostRecentServices = derivedServiceOptions.filter(({ id }) =>
            savedRecentServiceList.includes(id)
          );
          const orderedServiceOptions = derivedServiceOptions.filter(
            ({ id }) => !savedRecentServiceList.includes(id)
          );
          const hasBothServiceOptions =
            mostRecentServices.length > 0 && orderedServiceOptions.length > 0;
          return (
            <div
              key={service.id}
              className="flex flex-col gap-4 rounded-lg border border-border p-4 pl-5 pt-2"
            >
              <div className="flex flex-row place-content-between items-center">
                <div className="font-semibold leading-none tracking-tight">Service {index + 1}</div>
                <Button
                  className=""
                  variant="ghost"
                  type="button"
                  disabled={formState.transactionServices.length === 1 || isSaving}
                  onClick={() =>
                    setFormState((prevState) => {
                      prevState.transactionServices.splice(index, 1);
                    })
                  }
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label className="col-span-2 flex justify-end">
                  Service <RequiredIndicator />
                </Label>
                <Select
                  required
                  defaultValue={service.serviceId || undefined}
                  onValueChange={(serviceId) => onSelectService(serviceId, index)}
                  disabled={isFetchingServices}
                >
                  <SelectTrigger className="col-span-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {hasBothServiceOptions && (
                        <SelectLabel className="text-muted-foreground/60">Most Recent</SelectLabel>
                      )}
                      {mostRecentServices.map(({ id, serviceName, description }) => (
                        <SelectItem key={id} value={id}>
                          <div className="flex flex-row items-center gap-3">
                            {serviceName} - {description?.slice(0, 36 - serviceName.length)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    {hasBothServiceOptions && <Separator className="my-1" />}
                    <SelectGroup>
                      {orderedServiceOptions.map(({ id, serviceName, description }) => (
                        <SelectItem key={id} value={id}>
                          <div className="flex flex-row items-center gap-3">
                            {serviceName} - {description?.slice(0, 36 - serviceName.length)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-6 items-center gap-4">
                <Label className="col-span-2 text-right">Price</Label>
                <Input value={service.price} type="number" disabled className="col-span-4" />
              </div>
              <div ref={parent} className="flex flex-col gap-2">
                {service.serviceBy.map((serviceById, serviceByIndex) => {
                  const derivedCrewOptions = crewOptions.filter(
                    ({ id }) => id === serviceById || !service.serviceBy.includes(id)
                  );
                  const mostRecentCrewOptions = derivedCrewOptions.filter(({ id }) =>
                    savedRecentCrewList.includes(id)
                  );
                  const orderedCrewOptions = derivedCrewOptions.filter(
                    ({ id }) => !savedRecentCrewList.includes(id)
                  );
                  const hasBothCrewOptions =
                    mostRecentCrewOptions.length > 0 && orderedCrewOptions.length > 0;
                  return (
                    <div
                      key={serviceById || serviceByIndex}
                      className="grid grid-cols-6 items-center gap-4"
                    >
                      <Label className="col-span-2 flex justify-end">
                        Crew #{serviceByIndex + 1} <RequiredIndicator />
                      </Label>
                      <Select
                        required
                        defaultValue={serviceById || undefined}
                        onValueChange={(id) => {
                          setFormState((prevState) => {
                            prevState.transactionServices[index].serviceBy[serviceByIndex] = id;
                            prevState.recentSelectedCrew.push(id);
                          });
                          saveRecentSelectedCrew(id);
                        }}
                        disabled={isFetchingCrews}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {hasBothCrewOptions && (
                              <SelectLabel className="text-muted-foreground/60">
                                Most Recent
                              </SelectLabel>
                            )}
                            {mostRecentCrewOptions.map(({ id, name, role }) => (
                              <SelectItem key={id} value={id}>
                                <div className="flex flex-row items-center gap-3">
                                  {name} - {role}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          {hasBothCrewOptions && <Separator className="my-1" />}
                          <SelectGroup>
                            {orderedCrewOptions.map(({ id, name, role }) => (
                              <SelectItem key={id} value={id}>
                                <div className="flex flex-row items-center gap-3">
                                  {name} - {role}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Button
                        className="col-span-1 w-fit"
                        variant="ghost"
                        type="button"
                        disabled={service.serviceBy.length === 1 || isSaving}
                        onClick={() =>
                          setFormState((prevState) => {
                            prevState.transactionServices[index].serviceBy.splice(
                              serviceByIndex,
                              1
                            );
                          })
                        }
                      >
                        <XIcon className="w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <Button
                className="gap-2 text-center"
                variant="outline"
                type="button"
                onClick={() =>
                  setFormState((prevState) => {
                    prevState.transactionServices[index].serviceBy.push('');
                  })
                }
              >
                <PlusCircleIcon className="h-4 w-4" /> Add Crew
              </Button>
            </div>
          );
        })}
      </div>
      <Button
        className="gap-2 text-center"
        variant="outline"
        onClick={() =>
          setFormState((prevState) => {
            prevState.transactionServices.push(getDefaultServiceValue());
          })
        }
        type="button"
      >
        <PlusCircleIcon className="h-4 w-4" /> Add Service
      </Button>
    </div>
  );
};

export default AvailedServices;
