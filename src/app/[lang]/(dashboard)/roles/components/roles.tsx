'use client';

import type { Role } from './@types';

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
import { RolesDataTable } from './data-table';
import { RoleFormSheet } from './form';

import { useDataTableUtils } from '@/components/data-table';
import { usePermissions } from '@/hooks/use-permissions';
import { useStoreContext } from '@/store';
import { useDeleteRole } from '../hooks/use-delete-role';
import { useGetRoles } from '../hooks/use-get-roles';

export const Roles = () => {
  const dictionary = useStoreContext((state) => state.dictionary.roles);
  const dictionaryMisc = useStoreContext((state) => state.dictionary.misc);

  const { getPermission } = usePermissions({ include: ['manage:role'] });

  const { deboucedSearchText, sort, pagination, onSearch, onSorting, onPagination } =
    useDataTableUtils({ sort: { createdAt: 'desc' } });

  const { data, isInitialLoading, isFetching } = useGetRoles({
    ...pagination,
    deboucedSearchText,
    sort,
  });

  const { mutateAsync: deleteRole, isLoading: isDeleting } = useDeleteRole();

  // Track selected row/role to be view/edited/removed
  const [role, setRole] = React.useState<Role>();

  const [openedFormSheet, setOpenedFormSheet] = React.useState(false);
  const handleFormSheetChange = React.useCallback(
    (open: boolean) => {
      if (open === false) {
        setRole(undefined);
      }
      setOpenedFormSheet(open);
    },
    [setRole, setOpenedFormSheet]
  );

  const [openedDeleteDialog, setOpenedDeleteDialog] = React.useState(false);
  const handleDelete = React.useCallback(async () => {
    if (!role?.id) return;
    await deleteRole({ params: { id: role.id } });
    setRole(undefined);
    setOpenedDeleteDialog(false);
  }, [role?.id, setRole, setOpenedDeleteDialog, deleteRole]);

  const handleRowEdit = (row: Role) => {
    setRole(row);
    setOpenedFormSheet(true);
  };

  const handleRowDelete = (row: Role) => {
    setRole(row);
    setOpenedDeleteDialog(true);
  };

  return (
    <Layout.Root>
      <Layout.Header>
        <div className="flex items-center justify-between gap-8">
          <Layout.Heading>{dictionary.layout.title}</Layout.Heading>
          <div className="flex gap-5">
            {getPermission('create:role').granted && (
              <Button onClick={() => handleFormSheetChange(true)}>
                <Icons.AddCircle className="mr-2 h-4 w-4" />
                {dictionary.buttons.new}
              </Button>
            )}
          </div>
        </div>
      </Layout.Header>
      <Layout.Main>
        {/* Roles data table */}
        <RolesDataTable
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

        {/* Role form side drawer/sheet */}
        <RoleFormSheet role={role} opened={openedFormSheet} onOpened={handleFormSheetChange} />

        {/* Alert role before deleting */}
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
