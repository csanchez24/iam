'use client';

import type { Application } from './@types';

import { Icons } from '@/components/icons';
import * as Layout from '@/components/layout';
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
import * as React from 'react';
import { ApplicationFormSheet } from './application-form';
import { ApplicationsDataTable } from './applications-data-table';

import { useDataTableUtils } from '@/components/data-table';
import { useDeleteApplication } from '../hooks/use-delete-application';
import { useGetApplications } from '../hooks/use-get-applications';
import { useStoreContext } from '@/store';
import { usePermissions } from '@/hooks/use-permissions';

export const Applications = () => {
  const dictionary = useStoreContext((state) => state.dictionary.applications);
  const dictionaryMisc = useStoreContext((state) => state.dictionary.misc);

  const { getPermission } = usePermissions({ include: ['manage:application'] });

  const { deboucedSearchText, sort, pagination, onSearch, onSorting, onPagination } =
    useDataTableUtils({ sort: { createdAt: 'desc' } });

  const { data, isInitialLoading, isFetching } = useGetApplications({
    ...pagination,
    deboucedSearchText,
    sort,
  });

  const { mutateAsync: deleteApplication, isLoading: isDeleting } = useDeleteApplication();

  // Track selected row/application to be view/edited/removed
  const [application, setApplication] = React.useState<Application>();

  const [openedFormSheet, setOpenedFormSheet] = React.useState(false);
  const handleFormSheetChange = React.useCallback(
    (open: boolean) => {
      if (open === false) {
        setApplication(undefined);
      }
      setOpenedFormSheet(open);
    },
    [setApplication, setOpenedFormSheet]
  );

  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);
  const handleDelete = React.useCallback(async () => {
    if (!application?.id) return;
    await deleteApplication({ params: { id: application.id } });
    setApplication(undefined);
    setOpenedDeleteDialog(false);
  }, [application?.id, setApplication, setOpenedDeleteDialog, deleteApplication]);

  const handleRowEdit = (row: Application) => {
    setApplication(row);
    setOpenedFormSheet(true);
  };

  const handleRowDelete = (row: Application) => {
    setApplication(row);
    setOpenedDeleteDialog(true);
  };

  return (
    <Layout.Root>
      <Layout.Header>
        <div className="flex items-center justify-between gap-8">
          <Layout.Heading>{dictionary.layout.title}</Layout.Heading>
          <div className="flex gap-5">
            {getPermission('create:application').granted && (
              <Button onClick={() => handleFormSheetChange(true)}>
                <Icons.AddCircle className="mr-2 h-4 w-4" />
                {dictionary.buttons.new}
              </Button>
            )}
          </div>
        </div>
      </Layout.Header>
      <Layout.Main>
        {/* Applications data table */}
        <ApplicationsDataTable
          data={data?.body}
          isLoading={!isInitialLoading && isFetching}
          isInitialLoading={isInitialLoading}
          sort={sort}
          pagination={pagination}
          onSorting={onSorting}
          onPagination={onPagination}
          onSearch={onSearch}
          onRowEdit={handleRowEdit}
          onRowDelete={handleRowDelete}
        />

        {/* Application form side drawer/sheet */}
        <ApplicationFormSheet
          application={application}
          opened={openedFormSheet}
          onOpened={handleFormSheetChange}
        />

        {/* Alert user before deleting */}
        <AlertDialog open={openedDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dictionaryMisc.dialogs.delete.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {dictionaryMisc.dialogs.delete.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenedDeleteDialog(false)}>
                {dictionaryMisc.dialogs.delete.buttons.cancel}
              </AlertDialogCancel>
              <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
                {isDeleting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                {dictionaryMisc.dialogs.delete.buttons.continue}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Layout.Main>
    </Layout.Root>
  );
};
