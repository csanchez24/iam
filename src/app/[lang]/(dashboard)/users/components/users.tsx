'use client';

import type { User } from './@types';

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
import { UserFormSheet } from './user-form';
import { UsersDataTable } from './users-data-table';

import { useDataTableUtils } from '@/components/data-table';
import { useStoreContext } from '@/store';
import { useDeleteUser } from '../hooks/use-delete-user';
import { useGetUsers } from '../hooks/use-get-users';
import { usePermissions } from '@/hooks/use-permissions';

export const Users = () => {
  const dictionary = useStoreContext((state) => state.dictionary.users);
  const dictionaryMisc = useStoreContext((state) => state.dictionary.misc);

  const { getPermission } = usePermissions({ include: ['manage:user'] });

  const { deboucedSearchText, sort, pagination, onSearch, onSorting, onPagination } =
    useDataTableUtils({ sort: { createdAt: 'desc' } });

  const { data, isInitialLoading, isFetching } = useGetUsers({
    ...pagination,
    deboucedSearchText,
    sort,
  });

  const { mutateAsync: deleteUser, isLoading: isDeleting } = useDeleteUser();

  // Track selected row/user to be view/edited/removed
  const [user, setUser] = React.useState<User>();

  const [openedFormSheet, setOpenedFormSheet] = React.useState(false);
  const handleFormSheetChange = React.useCallback(
    (open: boolean) => {
      if (open === false) {
        setUser(undefined);
      }
      setOpenedFormSheet(open);
    },
    [setUser, setOpenedFormSheet]
  );

  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);
  const handleDelete = React.useCallback(async () => {
    if (!user?.id) return;
    await deleteUser({ params: { id: user.id } });
    setUser(undefined);
    setOpenedDeleteDialog(false);
  }, [user?.id, setUser, setOpenedDeleteDialog, deleteUser]);

  const handleRowEdit = (row: User) => {
    setUser(row);
    setOpenedFormSheet(true);
  };

  const handleRowDelete = (row: User) => {
    setUser(row);
    setOpenedDeleteDialog(true);
  };

  return (
    <Layout.Root>
      <Layout.Header>
        <div className="flex items-center justify-between gap-8">
          <Layout.Heading>{dictionary.layout.title}</Layout.Heading>
          <div className="flex gap-5">
            {getPermission('create:user').granted && (
              <Button onClick={() => handleFormSheetChange(true)}>
                <Icons.AddCircle className="mr-2 h-4 w-4" />
                {dictionary.buttons.new}
              </Button>
            )}
          </div>
        </div>
      </Layout.Header>
      <Layout.Main>
        {/* Users data table */}
        <UsersDataTable
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

        {/* User form side drawer/sheet */}
        <UserFormSheet user={user} opened={openedFormSheet} onOpened={handleFormSheetChange} />

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
