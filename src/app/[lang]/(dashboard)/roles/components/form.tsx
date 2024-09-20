'use client';

import type { Role, RoleCreateBodyData, RoleFormValues } from './@types';

import { RoleFormSchema } from './@schemas';

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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as React from 'react';
import { RoleFormLoading } from './form-loading';

import { useToast } from '@/components/ui/use-toast';
import { useFormErrors } from '@/hooks';
import { useStoreContext } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateRole } from '../hooks/use-create-role';
import { useUpdateRole } from '../hooks/use-update-role';
import { usePermissions } from '@/hooks/use-permissions';

const RoleFormInfo = dynamic(() => import('./form-info'));
const RoleFormPolicies = dynamic(() => import('./form-policies'), { loading: RoleFormLoading });

export function RoleFormSheet({
  role,
  opened,
  onOpened,
}: {
  role: Role | undefined;
  opened: boolean;
  onOpened(opened: boolean): void;
}) {
  const dictionary = useStoreContext((state) => state.dictionary.roles.form);
  const dictionaryMisc = useStoreContext((state) => state.dictionary.misc);

  const { getPermission } = usePermissions({ include: ['manage:role'] });

  const { toast } = useToast();

  const { onSubmitError } = useFormErrors();

  const TABS = React.useMemo(
    () => [dictionary.tabs.primaryInfomation, dictionary.tabs.applicationPolicies] as const,
    [dictionary]
  );

  const tabs = React.useMemo(
    () =>
      new Map<string, { component: React.ComponentType<{ role?: Role }> }>([
        [TABS[0], { component: RoleFormInfo }],
        [TABS[1], { component: RoleFormPolicies }],
      ]),
    [TABS]
  );

  const [tab, setTab] = React.useState<string>(TABS[0]);
  const renderTabContent = React.useCallback(() => {
    const Component = tabs.get(tab)?.component ?? RoleFormLoading;
    return <Component role={role} />;
  }, [tab, tabs, role]);

  const [openedUnsavedChangesDialog, setOpenedUnsavedChangesDialog] = React.useState(false);

  // Ref allows to dynamically submit form within alert dialog when there're unsaved changes.
  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(RoleFormSchema),
    values: React.useMemo(() => {
      return {
        name: role?.name ?? '',
        description: role?.description ?? '',
        applicationId: role?.applicationId,
        policies: role?.rolesToPermissions?.map(({ permissionId }) => ({ permissionId })) ?? [],
      };
    }, [role]),
  });

  const handleOnOpenChange = React.useCallback(
    (opened: boolean) => {
      if (!opened && form.formState.isDirty) {
        return setOpenedUnsavedChangesDialog(true);
      }
      onOpened(opened);
    },
    [onOpened, form.formState.isDirty]
  );

  const handleDiscardChanges = React.useCallback(() => {
    form.reset();
    setOpenedUnsavedChangesDialog(false);
    onOpened(false);
  }, [form, onOpened, setOpenedUnsavedChangesDialog]);

  const handleSaveChanges = React.useCallback(() => {
    formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }, []);

  const { mutateAsync: create, isLoading: isCreatingRole } = useCreateRole({
    onSuccess: () => {
      form.reset();
      onOpened(false);
    },
  });

  const { mutateAsync: update, isLoading: isUpadingRole } = useUpdateRole({
    onSuccess: () => {
      form.reset();
      setOpenedUnsavedChangesDialog(false);
      onOpened(false);
    },
    // Close alert dialog, but don't reset form as we might want the role
    // to preserve the data, fix issue and re-submit.
    onError: () => {
      setOpenedUnsavedChangesDialog(false);
    },
  });

  const isLoading = useMemo(() => isCreatingRole || isUpadingRole, [isCreatingRole, isUpadingRole]);

  const isUpdate = useMemo(() => !!role, [role]);

  const onSubmit = useCallback(
    async (data: RoleFormValues) => {
      if (!getPermission(['create:role', 'update:role']).granted) {
        return toast({
          variant: 'destructive',
          description: 'You do not have permission to create/update role.',
        });
      }

      if (role && isUpdate) {
        await update({ params: { id: role.id }, body: { data } });
      } else {
        await create({ body: { data: data as RoleCreateBodyData } });
      }
    },
    [role, isUpdate, create, update, getPermission, toast]
  );

  return (
    <>
      <Sheet open={opened} onOpenChange={handleOnOpenChange}>
        <SheetContent className="w-full overflow-y-scroll sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {role ? (
                <div>
                  {dictionary.headings.update}{' '}
                  <span className="text-muted-foreground">[ Name:{role?.name} ]</span>
                </div>
              ) : (
                <div>{dictionary.headings.new}</div>
              )}
            </SheetTitle>
            <SheetDescription>{dictionary.description}</SheetDescription>
          </SheetHeader>
          <Tabs value={tab} onValueChange={(tab) => setTab(tab)} className="mt-4">
            <TabsList className="grid w-fit grid-cols-2">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={`tab-${tab}`}
                  value={tab}
                  className="text-xs capitalize sm:text-sm"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={tab} className="space-y-2">
              <Form {...form}>
                <form
                  ref={formRef}
                  onSubmit={form.handleSubmit(onSubmit, onSubmitError)}
                  className="space-y-4"
                >
                  {renderTabContent()}
                  {getPermission(['create:role', 'update:role']).granted && (
                    <Button type="submit" disabled={isLoading} className="ml-auto flex">
                      {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                      {dictionary.buttons.save}
                    </Button>
                  )}
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Alert role of unsaved changes */}
      <AlertDialog open={openedUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionaryMisc.dialogs.unsaved.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionaryMisc.dialogs.unsaved.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>
              {dictionaryMisc.dialogs.unsaved.buttons.discard}
            </AlertDialogCancel>
            <AlertDialogAction disabled={isUpadingRole} onClick={handleSaveChanges}>
              {isUpadingRole && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {dictionaryMisc.dialogs.unsaved.buttons.save}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
