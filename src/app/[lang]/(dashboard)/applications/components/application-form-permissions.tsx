import type { ApplicationFormValues } from './@types';

import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useStoreContext } from '@/store';

import { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function ApplicationFormPermissions() {
  const dictionary = useStoreContext((state) => state.dictionary.applications.form.permissions);

  const [opened, setOpened] = useState(false);

  const form = useFormContext<ApplicationFormValues>();
  const { fields, append, remove } = useFieldArray({
    name: 'permissions',
    control: form.control,
  });

  const watchedFields = form.watch('permissions');

  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number>();

  const selectedFieldWithIndex = useMemo(() => {
    if (typeof selectedFieldIndex !== 'undefined') {
      return { field: fields[selectedFieldIndex], index: selectedFieldIndex };
    }
    if (fields.at(-1)) {
      return { field: fields.at(-1), index: fields.length - 1 };
    }
  }, [fields, selectedFieldIndex]);

  /** Remove `new` permission field object or deselect `existing` field index  */
  const handleCancelDialogAction = useCallback(() => {
    // Discard new field object
    if (typeof selectedFieldIndex === 'undefined') {
      return remove(Math.max(0, fields.length - 1));
    }
    // Remove selected field object
    setSelectedFieldIndex(undefined);
  }, [fields.length, selectedFieldIndex, setSelectedFieldIndex, remove]);

  /** Set field selection and open permission's modal */
  const handleEditTableAction = useCallback(
    (fieldIndex: number) => {
      setSelectedFieldIndex(fieldIndex);
      setOpened(true);
    },
    [setSelectedFieldIndex, setOpened]
  );

  /** Remove field object from form fields and delete from db */
  const handleDeleteTableAction = useCallback(
    (fieldIndex: number) => {
      remove(fieldIndex);
    },
    [remove]
  );

  return (
    <div className="my-6 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{dictionary.heading}</h3>
          <p className="text-sm text-muted-foreground">{dictionary.description}</p>
        </div>
        <AlertDialog open={opened} onOpenChange={setOpened}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() => append({ key: '', name: '', description: '' })}
            >
              <Icons.AddCircle className="mr-2 h-4 w-4" />
              {dictionary.buttons.addPermission}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-xl" onEscapeKeyDown={(e) => e.preventDefault()}>
            <AlertDialogHeader>
              <AlertDialogTitle>{dictionary.dialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{dictionary.dialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            {/* New/update permission form fields */}
            {selectedFieldWithIndex && (
              <>
                <FormField
                  name={`permissions.${selectedFieldWithIndex.index}.key`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.dialog.fields.key.label}</FormLabel>
                      <FormControl>
                        <Input placeholder={dictionary.dialog.fields.key.placeholder} {...field} />
                      </FormControl>
                      <FormDescription>{dictionary.dialog.fields.key.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`permissions.${selectedFieldWithIndex.index}.name`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.dialog.fields.name.label}</FormLabel>
                      <FormControl>
                        <Input placeholder={dictionary.dialog.fields.name.placeholder} {...field} />
                      </FormControl>
                      <FormDescription>{dictionary.dialog.fields.name.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`permissions.${selectedFieldWithIndex.index}.description`}
                  control={form.control}
                  render={({ field: { value, ...field } }) => (
                    <FormItem>
                      <FormLabel>{dictionary.dialog.fields.description.label}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={dictionary.dialog.fields.description.placeholder}
                          value={value ?? ''}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {dictionary.dialog.fields.description.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel className="min-w-24" onClick={handleCancelDialogAction}>
                {dictionary.dialog.buttons.cancel}
              </AlertDialogCancel>
              <AlertDialogAction
                className="min-w-24"
                disabled={!(watchedFields?.at(-1)?.key && watchedFields?.at(-1)?.name)}
              >
                {dictionary.dialog.buttons.add}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Separator />
      {/* Permissions tabular view */}
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>{dictionary.table.columns.key}</TableHead>
            <TableHead>{dictionary.table.columns.name}</TableHead>
            <TableHead>{dictionary.table.columns.description}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchedFields?.length ? (
            watchedFields.map((field, i) => (
              <TableRow key={`${field.key}-${i}`}>
                <TableCell>{field.key}</TableCell>
                <TableCell>{field.name}</TableCell>
                <TableCell className="max-w-[300px] truncate">{field.description}</TableCell>
                <TableCell className="w-4">
                  <div className="flex items-center space-x-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                        >
                          <Icons.DotsHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open actions menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleEditTableAction(i)}>
                          {dictionary.table.columns.actions.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTableAction(i)}>
                          {dictionary.table.columns.actions.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4}>
                <div className="py-4 text-center font-medium text-muted-foreground">
                  {dictionary.table.empty}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
