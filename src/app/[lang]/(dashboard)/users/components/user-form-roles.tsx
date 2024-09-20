import type { Role } from '@/app/[lang]/(dashboard)/roles/components/@types';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { FieldArray, UseFormReturn } from 'react-hook-form';
import type { UserFormValues } from './@types';

import { Icons } from '@/components/icons';
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
import * as React from 'react';

import { useGetRoles } from '@/app/[lang]/(dashboard)/roles/hooks/use-get-roles';
import { useStoreContext } from '@/store';
import { cn } from '@/utils/cn';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function UserFormRoles() {
  const dictionary = useStoreContext((state) => state.dictionary.users.form.roles);

  const { data } = useGetRoles({ limit: 200 });

  const form = useFormContext<UserFormValues>();
  const { fields, append, remove, update } = useFieldArray({
    name: 'roles',
    control: form.control,
  });

  const watchedRoles = form.watch('roles');

  return (
    <div className="my-2 space-y-2">
      <div className="my-6">
        <h3 className="text-lg font-medium">{dictionary.heading}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.description}</p>
      </div>
      <Separator />
      <div className="!my-6">
        {fields.map(({ id }, i) => (
          <UserFormRolesField
            key={id}
            form={form}
            roles={data?.body.data}
            roleIndex={i}
            dictionary={dictionary}
            onAssign={update}
            onUnassign={remove}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={watchedRoles?.at(-1)?.roleId === 0}
        onClick={() => append({ roleId: 0 })}
      >
        <Icons.AddCircle className="mr-2 h-4 w-4" />
        {dictionary.buttons.addRole}
      </Button>
    </div>
  );
}

function UserFormRolesField({
  form,
  roles,
  roleIndex,
  dictionary,
  onAssign,
  onUnassign,
}: {
  form: UseFormReturn<UserFormValues>;
  roles: Role[] | undefined;
  roleIndex: number;
  onAssign(roleIndex: number, value: FieldArray<UserFormValues, 'roles'>): void;
  onUnassign(roleIndex: number): void;
  dictionary: Dictionary['users']['form']['roles'];
}) {
  const [opened, setOpened] = React.useState(false);

  return (
    <div className="mb-3.5 flex items-center space-x-1">
      <div className="w-full flex-1">
        <FormField
          name={`roles.${roleIndex}.roleId`}
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
                      className={cn(
                        'w-full justify-between capitalize',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? roles?.find(({ id }) => id === field.value)?.name
                        : dictionary.select.button}
                      <Icons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder={dictionary.select.input.placeholder} />
                      <CommandList>
                        <CommandEmpty>{dictionary.select.empty}</CommandEmpty>
                        <CommandGroup>
                          {roles?.map((role) => {
                            // Check if option is already selected to prevent re-selection
                            const isSelected = form
                              .getValues('roles')
                              ?.some(({ roleId }) => roleId === role.id);

                            return (
                              <CommandItem
                                key={role.id}
                                value={role.id.toString()}
                                keywords={[role.name, role.application?.name ?? '']}
                                onSelect={() => {
                                  if (isSelected) return;
                                  onAssign(roleIndex, { roleId: role.id });
                                  setOpened(false);
                                }}
                                className={cn(isSelected && '[&_*]:text-muted-foreground/50')}
                              >
                                <div className="flex items-start">
                                  <Icons.Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      field.value === role.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div className="capitalize">{role.name}</div>
                                    <p className="text-muted-foreground">{role.description}</p>
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
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
      </div>
      <Button
        type="button"
        variant="ghost"
        className="shrink-0"
        onClick={() => onUnassign(roleIndex)}
      >
        <Icons.Close className="h-4 w-4" />
      </Button>
    </div>
  );
}
