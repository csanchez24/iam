import type { DataTableProps, UseDataTableUtilsReturn } from '@/components/data-table';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { ColumnDef, RowData, Table, TableMeta } from '@tanstack/react-table';
import type { User, UserPaginated } from './@types';

import {
  DataTable,
  DataTableHeadWithSorting,
  DataTableSearchFilter,
  DataTableViewOptions,
  getInitialDatatableState,
  getPageCountFromApi,
} from '@/components/data-table';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as React from 'react';

import { usePermissions } from '@/hooks/use-permissions';
import { useStoreContext } from '@/store';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    onRowEdit(rowData: TData): void;
    onRowDelete(rowData: TData): void;
  }
}

function UserDataTableToolbar({
  table,
  dictionary,
}: {
  table: Table<User>;
  dictionary: Dictionary;
}) {
  return (
    <div className="flex items-center justify-between">
      {/* prettier-ignore */}
      <DataTableSearchFilter table={table} dictionary={dictionary.users.table.toolbar.searchFilter} />
      <DataTableViewOptions table={table} dictionary={dictionary.users.table.toolbar.view} />
    </div>
  );
}

export function UsersDataTable({
  data,
  sort,
  pagination,
  isLoading,
  isInitialLoading,
  onRowEdit,
  onRowDelete,
  onSearch,
  onPagination,
  onSorting,
}: Pick<TableMeta<User>, 'onRowEdit' | 'onRowDelete' | 'onSearch' | 'onSorting' | 'onPagination'> &
  Pick<DataTableProps<User>, 'isInitialLoading' | 'isLoading'> &
  Pick<UseDataTableUtilsReturn, 'pagination' | 'sort'> & {
    data?: UserPaginated;
  }) {
  const dictionary = useStoreContext((state) => state.dictionary);

  const { getPermission } = usePermissions({ include: ['manage:user'] });

  const columns: ColumnDef<User>[] = React.useMemo(
    () => [
      {
        accessorKey: 'firstName',
        enableSorting: true,
        header: (props) => (
          <DataTableHeadWithSorting title={dictionary.users.table.columns.firstName} {...props} />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('firstName')}</span>
        ),
      },
      {
        accessorKey: 'middleName',
        enableSorting: true,
        header: (props) => (
          <DataTableHeadWithSorting title={dictionary.users.table.columns.middleName} {...props} />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('middleName')}</span>
        ),
      },
      {
        accessorKey: 'lastName',
        enableSorting: true,
        header: (props) => (
          <DataTableHeadWithSorting title={dictionary.users.table.columns.lastName} {...props} />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('lastName')}</span>
        ),
      },
      {
        accessorKey: 'email',
        enableSorting: true,
        header: (props) => (
          <DataTableHeadWithSorting title={dictionary.users.table.columns.email} {...props} />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('email')}</span>
        ),
      },
      {
        accessorKey: 'phone',
        enableSorting: true,
        header: (props) => (
          <DataTableHeadWithSorting title={dictionary.users.table.columns.phone} {...props} />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('phone')}</span>
        ),
      },
      {
        accessorKey: 'isActive',
        enableSorting: false,
        header: (props) => (
          <DataTableHeadWithSorting title={dictionary.users.table.columns.status.key} {...props} />
        ),
        cell: ({ row }) =>
          row.getValue('isActive') ? (
            <span className="flex max-w-[300px] items-center truncate">
              <Icons.CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              {dictionary.users.table.columns.status.values[0]}
            </span>
          ) : (
            <span className="flex max-w-[300px] items-center truncate">
              <Icons.Circle className="mr-2 h-4 w-4 text-muted-foreground" />
              {dictionary.users.table.columns.status.values[1]}
            </span>
          ),
      },
      {
        id: 'actions',
        cell: ({ table, row }) => (
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                  <Icons.DotsHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open actions menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                {getPermission('update:user').granted && (
                  <DropdownMenuItem onClick={() => table.options.meta?.onRowEdit(row.original)}>
                    {dictionary.users.table.columns.actions.edit}
                  </DropdownMenuItem>
                )}
                {getPermission('delete:user').granted && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => table.options.meta?.onRowDelete(row.original)}>
                      {dictionary.users.table.columns.actions.delete}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [dictionary, getPermission]
  );

  const defaultData = React.useMemo(() => [], []);

  const table = useReactTable({
    columns,
    data: data?.data ?? defaultData,
    enableRowSelection: false,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    pageCount: getPageCountFromApi(data?.meta?.total, pagination.limit),
    initialState: getInitialDatatableState({ pagination, sort }),
    meta: {
      onRowEdit,
      onRowDelete,
      onPagination,
      onSorting,
      onSearch,
    },
  });

  return (
    <DataTable
      table={table}
      withPagination
      isLoading={isLoading}
      isInitialLoading={isInitialLoading}
      dictionary={dictionary.misc.table}
      toolbar={<UserDataTableToolbar table={table} dictionary={dictionary} />}
    />
  );
}
