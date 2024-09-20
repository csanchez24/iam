import type { Label, UserFormValues } from './@types';

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
  CommandSeparator,
} from '@/components/ui/command';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import * as React from 'react';

import { cn } from '@/utils/cn';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useGetLabels } from '../hooks/use-get-labels';
import { useStoreContext } from '@/store';

export default function UserFormInfo({
  onCreateLabel,
  onEditLabel,
  onDeleteLabel,
}: {
  onCreateLabel?(): void;
  onEditLabel?(label: Label): void;
  onDeleteLabel?(label: Label): void;
}) {
  const dictionary = useStoreContext((state) => state.dictionary.users.form.info);

  const form = useFormContext<UserFormValues>();
  const { fields, append, remove } = useFieldArray({
    name: 'labels',
    control: form.control,
  });

  const { data: labels } = useGetLabels();

  const selectedLabels = React.useMemo(() => {
    if (!(fields.length && labels?.body.data.length)) {
      return [];
    }
    return fields.map(
      ({ labelId }) => labels.body.data.find(({ id }) => id === labelId)?.name
    ) as string[];
  }, [fields, labels?.body.data]);

  const [visiblePassword, setVisiblePassword] = React.useState(false);

  return (
    <div className="my-6 space-y-2">
      <div>
        <h3 className="text-lg font-medium">{dictionary.heading}</h3>
        <p className="text-sm text-muted-foreground">{dictionary.description}</p>
      </div>
      <Separator />
      <FormField
        name="firstName"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.firstName.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.firstName.placeholder} {...field} />
            </FormControl>
            <FormDescription>{dictionary.firstName.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="middleName"
        control={form.control}
        render={({ field: { value, ...field } }) => (
          <FormItem>
            <FormLabel>{dictionary.middleName.label}</FormLabel>
            <FormControl>
              <Input
                placeholder={dictionary.middleName.placeholder}
                {...field}
                value={value ?? ''}
              />
            </FormControl>
            <FormDescription>{dictionary.middleName.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="lastName"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.lastName.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.lastName.placeholder} {...field} />
            </FormControl>
            <FormDescription>{dictionary.lastName.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="email"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.email.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.email.placeholder} {...field} />
            </FormControl>
            <FormDescription>{dictionary.email.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="password"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="password">{dictionary.password.label}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  id="password"
                  placeholder={dictionary.password.placeholder}
                  type={visiblePassword ? 'text' : 'password'}
                />
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 h-8 w-8  -translate-y-1/2 transform"
                    onClick={() => {
                      setVisiblePassword((visible) => !visible);
                    }}
                  >
                    {visiblePassword ? (
                      <Icons.EyeNone className="h-4 w-4" />
                    ) : (
                      <Icons.EyeOpen className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </FormControl>
            <FormDescription>{dictionary.password.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="phone"
        control={form.control}
        render={({ field: { value, ...field } }) => (
          <FormItem>
            <FormLabel>{dictionary.phone.label}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.phone.placeholder} {...field} value={value ?? ''} />
            </FormControl>
            <FormDescription>{dictionary.phone.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="labels"
        control={form.control}
        render={({ field: _field }) => (
          <FormItem>
            <FormLabel>{dictionary.labels.label}</FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full">
                    {selectedLabels.slice(0, 3).map((name, i) => (
                      <Badge key={name + i} className="mr-0.5" variant="outline">
                        {name}
                      </Badge>
                    ))}
                    {selectedLabels.length > 3 && (
                      <Badge className="mr-0.5" variant="outline">
                        {selectedLabels.slice(3).length} +
                      </Badge>
                    )}
                    <div className="flex flex-1 justify-between">
                      <span className={cn(selectedLabels.length && 'ml-2')}>
                        {!selectedLabels.length && dictionary.labels.placeholder}
                      </span>
                      <Icons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder={dictionary.labels.input.placeholder} />
                    <CommandList>
                      <CommandEmpty>{dictionary.labels.empty}</CommandEmpty>
                      <CommandGroup>
                        {labels?.body?.data.map((label) => {
                          const isSelected = fields.some(({ labelId }) => labelId === label.id);
                          return (
                            <CommandItem
                              key={label.id}
                              value={label.id.toString()}
                              keywords={[label.name]}
                              className="has-[button:hover]:hover:bg-transparent"
                              onSelect={(labelId) => {
                                isSelected
                                  ? remove(fields.findIndex(({ labelId }) => labelId === label.id))
                                  : append({ labelId: parseInt(labelId) });
                              }}
                            >
                              <div
                                className={cn(
                                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'opacity-50 [&_svg]:invisible'
                                )}
                              >
                                <Icons.Check className={cn('h-4 w-4')} />
                              </div>
                              <span className="capitalize">{label.name}</span>
                              <div className="ml-auto">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onEditLabel?.(label);
                                  }}
                                >
                                  <Icons.Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onDeleteLabel?.(label);
                                  }}
                                >
                                  <Icons.Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      <>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem onSelect={() => onCreateLabel?.()} className="text-center">
                            <Icons.Add className="mr-2 h-4 w-4" />
                            {dictionary.labels.createNew}
                          </CommandItem>
                        </CommandGroup>
                      </>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormDescription>{dictionary.labels.description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className="!my-4" />
      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="!mb-4 flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">{dictionary.isActive.label}</FormLabel>
              <FormDescription>{dictionary.isActive.description}</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="isAdmin"
        render={({ field }) => (
          <FormItem className="!mb-4 flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">{dictionary.isAdmin.label}</FormLabel>
              <FormDescription>{dictionary.isAdmin.description}</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="isSuperAdmin"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">{dictionary.isSuperAdmin.label}</FormLabel>
              <FormDescription>{dictionary.isSuperAdmin.description}</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
