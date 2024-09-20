'use client';

import type { Label, User, UserFormValues } from './@types';

import { UserCreateBodySchema } from '@/schemas/user';

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
import { UserFormLoading } from './user-form-loading';
import { UsersLabelsForm } from './user-labels-form';

import { useToast } from '@/components/ui/use-toast';
import { useFormErrors } from '@/hooks';
import { useStoreContext } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateUser } from '../hooks/use-create-user';
import { useDeleteLabel } from '../hooks/use-delete-label';
import { useUpdateUser } from '../hooks/use-update-user';
import { usePermissions } from '@/hooks/use-permissions';

const UserFormInfo = dynamic(() => import('./user-form-info'));
const UserFormRoles = dynamic(() => import('./user-form-roles'), { loading: UserFormLoading });

export function UserFormSheet({
  user,
  opened,
  onOpened,
}: {
  user: User | undefined;
  opened: boolean;
  onOpened(opened: boolean): void;
}) {
  const dictionary = useStoreContext((state) => state.dictionary.users.form);

  const { getPermission } = usePermissions({ include: ['manage:user'] });

  const tabsNames = React.useMemo(() => {
    return [dictionary.tabs.primaryInfomation, dictionary.tabs.roles] as const;
  }, [dictionary]);

  const tabs = React.useMemo(() => {
    return new Map<string, { component: typeof UserFormInfo | typeof UserFormRoles }>([
      [tabsNames[0], { component: UserFormInfo }],
      [tabsNames[1], { component: UserFormRoles }],
    ]);
  }, [tabsNames]);

  const { toast } = useToast();

  const { onSubmitError } = useFormErrors();

  const [openedUnsavedChangesDialog, setOpenedUnsavedChangesDialog] = React.useState(false);

  // Ref allows to dynamically submit form within alert dialog when there're unsaved changes.
  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(
      UserCreateBodySchema.shape.data
        .omit({ password: true })
        .extend({ password: z.string().optional() })
    ),
    values: React.useMemo(() => {
      return {
        firstName: user?.firstName ?? '',
        middleName: user?.middleName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        password: '',
        phone: user?.phone ?? '',
        isActive: !!user?.isActive,
        isAdmin: !!user?.isAdmin,
        isSuperAdmin: !!user?.isSuperAdmin,
        roles: user?.usersToRoles?.map(({ roleId }) => ({ roleId })) ?? [],
        labels: user?.usersToLabels?.map(({ labelId }) => ({ labelId })) ?? [],
      };
    }, [user]),
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

  const { mutateAsync: create, isLoading: isCreatingUser } = useCreateUser({
    onSuccess: () => {
      form.reset();
      onOpened(false);
    },
  });

  const { mutateAsync: update, isLoading: isUpadingUser } = useUpdateUser({
    onSuccess: () => {
      form.reset();
      setOpenedUnsavedChangesDialog(false);
      onOpened(false);
    },
    // Close alert dialog, but don't reset form as we might want the user
    // to preserve the data, fix issue and re-submit.
    onError: () => {
      setOpenedUnsavedChangesDialog(false);
    },
  });

  const isLoading = useMemo(() => isCreatingUser || isUpadingUser, [isCreatingUser, isUpadingUser]);

  const isUpdate = useMemo(() => !!user, [user]);

  const onSubmit = useCallback(
    async (data: UserFormValues) => {
      if (!getPermission(['create:user', 'update:user']).granted) {
        return toast({
          variant: 'destructive',
          description: 'You do not have permission to create/update user.',
        });
      }

      const normalizedData = { ...data, roles: data.roles?.filter((role) => role.roleId !== 0) };
      if (user && isUpdate) {
        await update({ params: { id: user.id }, body: { data: normalizedData } });
      } else {
        await create({ body: { data: normalizedData } });
      }
    },
    [user, create, update, isUpdate, getPermission, toast]
  );

  // Label related state and handlers
  const [openedLabelDeleteDialog, setOpenedLabelDeleteDialog] = React.useState(false);
  const [openedLabelFormDialog, setOpenedLabelFormDialog] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<Label>();
  const handleCancelLabel = React.useCallback(() => {
    setSelectedLabel(undefined);
    setOpenedLabelFormDialog(false);
  }, []);
  const handleSuccessLabel = React.useCallback(() => {
    setSelectedLabel(undefined);
    setOpenedLabelFormDialog(false);
  }, []);
  const handleCreateLabel = React.useCallback(() => {
    setOpenedLabelFormDialog(true);
  }, []);
  const handleEditLabel = React.useCallback((label: Label) => {
    setSelectedLabel(label);
    setOpenedLabelFormDialog(true);
  }, []);
  const handleDeleteLabel = React.useCallback((label: Label) => {
    setSelectedLabel(label);
    setOpenedLabelDeleteDialog(true);
  }, []);
  const { mutateAsync: deleteLabel, isLoading: isDeletingLabel } = useDeleteLabel({
    onSuccess() {
      setSelectedLabel(undefined);
      setOpenedLabelDeleteDialog(false);
    },
  });
  const handleConfirmDeleteLabel = React.useCallback(() => {
    if (!selectedLabel) {
      return toast({
        variant: 'destructive',
        description: 'No label has been selected for deletion.',
      });
    }
    deleteLabel({ params: { id: selectedLabel.id } });
  }, [selectedLabel, deleteLabel, toast]);

  // Moved this down here in order to make state and handlers available to the form components
  const [tab, setTab] = React.useState<string>(tabsNames[0]);
  const renderTabContent = React.useCallback(() => {
    const Component = tabs.get(tab)?.component ?? UserFormLoading;
    return (
      <Component
        onCreateLabel={handleCreateLabel}
        onEditLabel={handleEditLabel}
        onDeleteLabel={handleDeleteLabel}
      />
    );
  }, [tabs, tab, handleCreateLabel, handleEditLabel, handleDeleteLabel]);

  return (
    <>
      <Sheet open={opened} onOpenChange={handleOnOpenChange}>
        <SheetContent className="w-full overflow-y-scroll sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {user ? (
                <div>
                  {dictionary.headings.update}{' '}
                  <span className="text-muted-foreground">[ Id:{user?.id} ]</span>
                </div>
              ) : (
                <div>{dictionary.headings.new}</div>
              )}
            </SheetTitle>
            <SheetDescription>{dictionary.description}</SheetDescription>
          </SheetHeader>
          <Tabs value={tab} onValueChange={(tab) => setTab(tab)} className="mt-4">
            <TabsList className="grid w-fit grid-cols-2">
              {tabsNames.map((tab) => (
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
                  {getPermission(['create:user', 'update:user']).granted && (
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
      {/* Create/update user's labels */}
      <AlertDialog open={openedLabelFormDialog} onOpenChange={setOpenedLabelFormDialog}>
        <AlertDialogContent className="sm:max-w-xl" onEscapeKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.dialogs.create.title}</AlertDialogTitle>
            <AlertDialogDescription>{dictionary.dialogs.create.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <UsersLabelsForm
            label={selectedLabel}
            onCancel={handleCancelLabel}
            onSucces={handleSuccessLabel}
          />
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert user before deleting label */}
      <AlertDialog open={openedLabelDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.dialogs.delete.title}</AlertDialogTitle>
            <AlertDialogDescription>{dictionary.dialogs.delete.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenedLabelDeleteDialog(false)}>
              {dictionary.dialogs.delete.buttons.cancel}
            </AlertDialogCancel>
            <AlertDialogAction disabled={isDeletingLabel} onClick={handleConfirmDeleteLabel}>
              {isDeletingLabel && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {dictionary.dialogs.delete.buttons.continue}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert user of unsaved changes */}
      <AlertDialog open={openedUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.dialogs.unsaved.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dictionary.dialogs.unsaved.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardChanges}>
              {dictionary.dialogs.unsaved.buttons.discard}
            </AlertDialogCancel>
            <AlertDialogAction disabled={isUpadingUser} onClick={handleSaveChanges}>
              {isUpadingUser && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {dictionary.dialogs.unsaved.buttons.save}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
