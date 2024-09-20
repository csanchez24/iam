'use client';

import type { Application, ApplicationFormValues } from './@types';

import { ApplicationCreateBodySchema } from '@/schemas/application';

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
import { ApplicationFormLoading } from './application-form-loading';

import { useToast } from '@/components/ui/use-toast';
import { useFormErrors } from '@/hooks';
import { usePermissions } from '@/hooks/use-permissions';
import { useStoreContext } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateApplication } from '../hooks/use-create-application';
import { useUpdateApplication } from '../hooks/use-update-application';

const ApplicationFormInfo = dynamic(() => import('./application-form-info'));
const ApplicationFormUrls = dynamic(() => import('./application-form-urls'), { loading: ApplicationFormLoading }); // prettier-ignore
const ApplicationFormTokens = dynamic(() => import('./application-form-tokens'), { loading: ApplicationFormLoading }); // prettier-ignore
const ApplicationFormPermissions = dynamic(() => import('./application-form-permissions'), { loading: ApplicationFormLoading }); // prettier-ignore

export function ApplicationFormSheet({
  application,
  opened,
  onOpened,
}: {
  application: Application | undefined;
  opened: boolean;
  onOpened(opened: boolean): void;
}) {
  const dictionary = useStoreContext((state) => state.dictionary.applications.form);
  const dictionaryMisc = useStoreContext((state) => state.dictionary.misc);

  const { getPermission } = usePermissions({ include: ['manage:application'] });

  const { toast } = useToast();

  const TABS = React.useMemo(() => {
    return [
      dictionary.tabs.primaryInfomation,
      dictionary.tabs.callbackUrls,
      dictionary.tabs.tokens,
      dictionary.tabs.permissions,
    ] as const;
  }, [dictionary]);

  const tabs = React.useMemo(() => {
    return new Map<string, { component: React.ComponentType }>([
      [TABS[0], { component: ApplicationFormInfo }],
      [TABS[1], { component: ApplicationFormUrls }],
      [TABS[2], { component: ApplicationFormTokens }],
      [TABS[3], { component: ApplicationFormPermissions }],
    ]);
  }, [TABS]);

  const { onSubmitError } = useFormErrors();

  const [tab, setTab] = React.useState<string>(TABS[0]);
  const renderTabContent = React.useCallback(() => {
    const Component = tabs.get(tab)?.component ?? ApplicationFormLoading;
    return <Component />;
  }, [tab, tabs]);

  const [openedUnsavedChangesDialog, setOpenedUnsavedChangesDialog] = React.useState(false);

  // Ref allows to dynamically submit form within alert dialog when there're unsaved changes.
  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(ApplicationCreateBodySchema.shape.data),
    values: React.useMemo(() => {
      return {
        name: application?.name ?? '',
        clientId: application?.clientId ?? '',
        secretId: application?.sercretId ?? '',
        domain: application?.domain ?? '',
        description: application?.description ?? '',
        homeUrl: application?.homeUrl ?? '',
        loginUrl: application?.loginUrl ?? '',
        logoutUrl: application?.logoutUrl ?? '',
        callbackUrl: application?.callbackUrl ?? '',
        idTokenExp: application?.idTokenExp ?? 3600,
        accessTokenExp: application?.accessTokenExp ?? 86400,
        refreshTokenExp: application?.refreshTokenExp ?? 1296000,
        permissions: application?.permissions ?? [],
      };
    }, [application]),
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

  const { mutateAsync: create, isLoading: isCreatingApplication } = useCreateApplication({
    onSuccess: () => {
      form.reset();
      onOpened(false);
    },
  });

  const { mutateAsync: update, isLoading: isUpadingApplication } = useUpdateApplication({
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

  const isLoading = useMemo(
    () => isCreatingApplication || isUpadingApplication,
    [isCreatingApplication, isUpadingApplication]
  );

  const isUpdate = useMemo(() => !!application, [application]);

  const onSubmit = useCallback(
    async (data: ApplicationFormValues) => {
      if (!getPermission(['create:application', 'update:application']).granted) {
        return toast({
          variant: 'destructive',
          description: 'You do not have permission to create/update application.',
        });
      }

      if (application && isUpdate) {
        await update({ params: { id: application.id }, body: { data } });
      } else {
        await create({ body: { data } });
      }
    },
    [application, isUpdate, create, update, toast, getPermission]
  );

  return (
    <>
      <Sheet open={opened} onOpenChange={handleOnOpenChange}>
        <SheetContent className="w-full overflow-y-scroll sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {application ? (
                <div>
                  {dictionary.headings.new}{' '}
                  <span className="text-muted-foreground">[ Id:{application?.clientId} ]</span>
                </div>
              ) : (
                <div>{dictionary.headings.update}</div>
              )}
            </SheetTitle>
            <SheetDescription>{dictionary.description}</SheetDescription>
          </SheetHeader>
          <Tabs value={tab} onValueChange={(tab) => setTab(tab)} className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
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
                  {getPermission(['create:application', 'update:application']).granted && (
                    <Button type="submit" disabled={isLoading} className="ml-auto flex">
                      {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                      {dictionaryMisc.buttons.save}
                    </Button>
                  )}
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Alert user of unsaved changes */}
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
            <AlertDialogAction disabled={isUpadingApplication} onClick={handleSaveChanges}>
              {isUpadingApplication && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {dictionaryMisc.dialogs.unsaved.buttons.save}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
