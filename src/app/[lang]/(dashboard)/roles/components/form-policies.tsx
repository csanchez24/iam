import type {
  Application,
  ApplicationPaginated,
} from '@/app/[lang]/(dashboard)/applications/components/@types';
import type { Role, RoleFormValues } from './@types';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import * as React from 'react';

import { useGetApplications } from '@/app/[lang]/(dashboard)/applications/hooks/use-get-applications';
import { cn } from '@/utils/cn';
import { useFieldArray, useFormContext, type UseFormReturn } from 'react-hook-form';
import { useStoreContext } from '@/store';

export default function RoleFormPolicies({ role }: { role?: Role }) {
  const dictionary = useStoreContext((state) => state.dictionary.roles.form.policies);

  const form = useFormContext<RoleFormValues>();
  const { append, remove } = useFieldArray({
    name: 'policies',
    control: form.control,
  });

  const policies = form.watch('policies');

  const { data } = useGetApplications({ limit: 100 });

  const [selectedApplication, setSelectedApplication] = React.useState<Application | undefined>();

  React.useEffect(() => {
    const applicationId = form.getValues('applicationId');
    setSelectedApplication(data?.body.data.find(({ id }) => id === applicationId));
  }, [form, data?.body.data, selectedApplication]);

  return (
    <div className="my-2 space-y-2">
      <div className="py-4">
        <h3 className="text-lg font-medium">{dictionary.heading}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.description}</p>
      </div>
      <Separator />
      {role?.application ? (
        <>
          <RoleApplicationDetails application={role.application} />
          <Separator />
        </>
      ) : (
        <RoleFormApplicationSelect
          form={form}
          role={role}
          applications={data?.body.data}
          onSelect={setSelectedApplication}
        />
      )}
      <>
        {role?.application && <div className="py-4 text-base font-medium">Permissions</div>}
        {selectedApplication?.permissions?.map((permission) => (
          <RoleFormPolicy
            key={permission.id}
            permission={permission}
            policies={policies}
            onAppend={append}
            onRemove={remove}
          />
        ))}
      </>
    </div>
  );
}

function RoleFormApplicationSelect({
  form,
  role,
  applications,
  onSelect,
}: {
  form: UseFormReturn<RoleFormValues>;
  role: Role | undefined;
  applications: ApplicationPaginated['data'] | undefined;
  onSelect(application: ApplicationPaginated['data'][number]): void;
}) {
  const dictionary = useStoreContext((state) => state.dictionary.roles.form.policies);

  const [opened, setOpened] = React.useState(false);

  return (
    <FormField
      name="applicationId"
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Popover open={opened} onOpenChange={setOpened} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={opened}
                  disabled={!!role?.applicationId}
                  className={cn(
                    '!my-4 w-full justify-between capitalize',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value
                    ? applications?.find(({ id }) => id === field.value)?.name
                    : dictionary.selectApplication.label}
                  <Icons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder={dictionary.selectApplication.placeholder} />
                  <CommandList>
                    <CommandEmpty>{dictionary.selectApplication.empty}</CommandEmpty>
                    <CommandGroup>
                      {applications?.map((application) => (
                        <CommandItem
                          key={application.id}
                          value={application.id.toString()}
                          keywords={[application.name, application.domain]}
                          onSelect={() => {
                            form.setValue('applicationId', application.id);
                            onSelect(application);
                            setOpened(false);
                          }}
                        >
                          <div className="flex items-start">
                            <Icons.Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value === application.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex-1">
                              <div className="capitalize">{application.name}</div>
                              <p className="text-muted-foreground">{application.description}</p>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function RoleApplicationDetails({ application }: { application: Application | undefined }) {
  const data = [
    { label: 'Client Id', value: application?.clientId ?? '-' },
    { label: 'Name', value: application?.name ?? '-' },
    { label: 'Domain', value: application?.domain ?? '-' },
    { label: 'Description', value: application?.description ?? '-' },
  ];

  return (
    <div className="py-4">
      <div className="text-base font-medium">Details</div>
      <div className="grid grid-cols-2">
        {data.map(({ label, value }) => (
          <div key={label} className="p-3 text-sm">
            <div className="font-medium capitalize leading-7 text-foreground">{label}</div>
            <div className="capitalize text-muted-foreground">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleFormPolicy({
  permission,
  policies,
  onAppend,
  onRemove,
}: {
  permission: NonNullable<Application['permissions']>[number];
  policies: RoleFormValues['policies'];
  onAppend(policy: NonNullable<RoleFormValues['policies']>[number]): void;
  onRemove(index: number): void;
}) {
  const findIndexOfPolicy = React.useCallback(
    (permission: NonNullable<Application['permissions']>[number]) => {
      return policies?.findIndex(({ permissionId }) => permissionId === permission.id) ?? -1;
    },
    [policies]
  );

  const handleOnCheckedChange = React.useCallback(
    (checked: boolean) => {
      if (checked) {
        onAppend({ permissionId: permission.id });
      } else {
        const index = findIndexOfPolicy(permission);
        if (index >= 0) onRemove(index);
      }
    },
    [permission, onAppend, onRemove, findIndexOfPolicy]
  );

  return (
    <div className="mb-3 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent/70">
      <div className="flex items-start space-x-2">
        <div className="font-semibold capitalize">{permission.name}</div>
        <Badge variant="outline" className="rounded-md capitalize">
          {permission.key}
        </Badge>
      </div>
      <div className="flex items-center justify-between space-x-1">
        <div className="line-clamp-4 text-xs text-muted-foreground">{permission.description}</div>
        <Switch
          checked={findIndexOfPolicy(permission) >= 0}
          onCheckedChange={handleOnCheckedChange}
        />
      </div>
    </div>
  );
}
