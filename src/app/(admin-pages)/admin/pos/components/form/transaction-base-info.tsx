import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getTransaction } from 'src/actions/transactions/get-transactions';
import RequiredIndicator from 'src/components/form/required-indicator';
import { ModeOfPayment, Role, TransactionStatus, VehicleSize } from 'src/constants/common';
import { Entity } from 'src/constants/entities';
import useClientSession from 'src/hooks/use-client-session';
import { useServiceOptions } from 'src/queries/services';

import { TransactionFormState } from '../data-form';
import {
  modeOfPaymentOptions,
  transactionStatusOptions,
  vehicleSizeOptions,
} from '../data-table-options';

import { SelectProps } from '@radix-ui/react-select';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { twJoin } from 'tailwind-merge';
import { Updater } from 'use-immer';

const TransactionBaseInfo = ({
  formState,
  setFormState,
  transactionId,
}: {
  formState: TransactionFormState;
  setFormState: Updater<TransactionFormState>;
  transactionId?: string;
}) => {
  const { data: loggedInUser } = useClientSession();
  const { data: serviceOptions = [] } = useServiceOptions();

  const isEdit = Boolean(transactionId);

  const { data: transaction } = useQuery({
    queryKey: [Entity.Transactions, transactionId],
    queryFn: async () => {
      const { data } = await getTransaction(transactionId as string);
      return data;
    },
    enabled: !!transactionId,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isEdit && transaction) {
      setFormState((draft) => {
        draft.transactionServices = transaction.transactionServices;
        draft.selectedVehicleSize = transaction.vehicleSize;
      });
    }
  }, [isEdit, transaction, setFormState]);

  const onChangeVehicleSize: SelectProps['onValueChange'] = (value) => {
    setFormState((prevState) => {
      prevState.selectedVehicleSize = value as VehicleSize;
      prevState.transactionServices = prevState.transactionServices
        .filter(({ serviceId }) => {
          if (serviceId === '') return true;

          const service = serviceOptions.find(({ id }) => id === serviceId);
          const priceMatrixByVehicleSize = service?.priceMatrix.find(
            ({ vehicleSize }) => vehicleSize === (value as VehicleSize)
          );

          return !!priceMatrixByVehicleSize;
        })
        .map((data) => {
          if (data.serviceId === '') return data;

          const service = serviceOptions.find(({ id }) => id === data.serviceId);
          const priceMatrix = service?.priceMatrix.find(
            ({ vehicleSize }) => vehicleSize === (value as VehicleSize)
          );

          if (!service || !priceMatrix) return data;

          return {
            ...data,
            price: String(priceMatrix.price),
          };
        });
    });
  };

  return (
    <div className="space-y-4">
      {isEdit && loggedInUser && [Role.Admin, Role.Accounting].includes(loggedInUser.role) && (
        <div>
          <div className="grid grid-cols-6 items-center gap-4">
            <Label htmlFor="createdAt" className="col-span-2 flex justify-end">
              Created At
            </Label>
            <Input
              id="createdAt"
              name="createdAt"
              className={twJoin('col-span-4', formState.error.discount && 'border-destructive-200')}
              defaultValue={dayjs(transaction?.createdAt).format('YYYY-MM-DDTHH:mm')}
              type="datetime-local"
            />
          </div>
          {formState.error.createdAt && (
            <div className="grid grid-cols-6">
              <div className="col-span-4 col-start-3 ml-2 text-sm text-destructive dark:text-destructive-200">
                {formState.error.createdAt}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="customerName" className="col-span-2 flex justify-end">
          Customer Name
        </Label>
        <Input
          id="customerName"
          name="customerName"
          className="col-span-4"
          defaultValue={transaction?.customerName || ''}
        />
      </div>
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="plateNumber" className="col-span-2 flex justify-end">
          Plate Number <RequiredIndicator />
        </Label>
        <Input
          id="plateNumber"
          type="text"
          name="plateNumber"
          required
          className="col-span-4"
          minLength={6}
          maxLength={12}
          defaultValue={transaction?.plateNumber || ''}
          onKeyDown={(e) => {
            if (e.code === 'Space') {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            e.currentTarget.value = e.currentTarget.value.toUpperCase();
          }}
        />
      </div>
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="status" className="col-span-2 flex justify-end">
          Status <RequiredIndicator />
        </Label>
        <Select
          required
          name="status"
          defaultValue={transaction?.status || TransactionStatus.Pending}
        >
          <SelectTrigger id="status" className="col-span-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {transactionStatusOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="modeOfPayment" className="col-span-2 flex justify-end">
          Mode of Payment <RequiredIndicator />
        </Label>
        <Select
          required
          name="modeOfPayment"
          defaultValue={transaction?.modeOfPayment || ModeOfPayment.Cash}
        >
          <SelectTrigger id="modeOfPayment" className="col-span-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modeOfPaymentOptions.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <div className="flex flex-row items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="vehicleSize" className="col-span-2 flex justify-end">
          Vehicle Size <RequiredIndicator />
        </Label>
        <Select
          required
          name="vehicleSize"
          defaultValue={transaction?.vehicleSize || formState.selectedVehicleSize}
          onValueChange={onChangeVehicleSize}
        >
          <SelectTrigger id="vehicleSize" className="col-span-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {vehicleSizeOptions.map(({ value, label, icon: Icon }) => (
              <SelectItem key={value} value={value}>
                <div className="flex flex-row items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="grid grid-cols-6 items-center gap-4">
          <Label htmlFor="discount" className="col-span-2 text-right">
            Discount (in PHP)
          </Label>
          <Input
            id="discount"
            name="discount"
            defaultValue={transaction?.discount || 0}
            type="number"
            min={0}
            className={twJoin('col-span-4', formState.error.discount && 'border-destructive-200')}
          />
        </div>
        {formState.error.discount && (
          <div className="grid grid-cols-6">
            <div className="col-span-4 col-start-3 ml-2 text-sm text-destructive dark:text-destructive-200">
              {formState.error.discount}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="tip" className="col-span-2 text-right">
          Tip
        </Label>
        <Input
          id="tip"
          name="tip"
          defaultValue={transaction?.tip || 0}
          type="number"
          min={0}
          className="col-span-4"
        />
      </div>

      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="note" className="col-span-2 flex justify-end">
          Note
        </Label>
        <Textarea
          id="note"
          name="note"
          className="col-span-4 min-h-[100px] [field-sizing:content]"
          defaultValue={transaction?.note || ''}
          maxLength={360}
        />
      </div>
    </div>
  );
};

export default TransactionBaseInfo;
