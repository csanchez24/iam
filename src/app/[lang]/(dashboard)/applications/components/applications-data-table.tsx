import type { DataTableProps, UseDataTableUtilsReturn } from '@/components/data-table';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { ColumnDef, RowData, Table, TableMeta } from '@tanstack/react-table';
import type { Application, ApplicationPaginated } from './@types';

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

function ApplicationDataTableToolbar({
  table,
  dictionary,
}: {
  table: Table<Application>;
  dictionary: Dictionary;
}) {
  return (
    <div className="flex items-center justify-between">
      {/* prettier-ignore */}
      <DataTableSearchFilter table={table} dictionary={dictionary.applications.table.toolbar.searchFilter} />
      <DataTableViewOptions table={table} dictionary={dictionary.applications.table.toolbar.view} />
    </div>
  );
}

export function ApplicationsDataTable({
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
}: Pick<
  TableMeta<Application>,
  'onRowEdit' | 'onRowDelete' | 'onSearch' | 'onSorting' | 'onPagination'
> &
  Pick<DataTableProps<Application>, 'isInitialLoading' | 'isLoading'> &
  Pick<UseDataTableUtilsReturn, 'pagination' | 'sort'> & {
    data?: ApplicationPaginated;
  }) {
  const dictionary = useStoreContext((state) => state.dictionary);

  const { getPermission } = usePermissions({ include: ['manage:application'] });

  const columns: ColumnDef<Application>[] = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        enableSorting: true,
        header: (props) => (
          <DataTableHeadWithSorting title={dictionary.applications.table.columns.name} {...props} />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('name')}</span>
        ),
      },
      {
        accessorKey: 'domain',
        enableSorting: true,
        header: (props) => (
          <DataTableHeadWithSorting
            title={dictionary.applications.table.columns.domain}
            {...props}
          />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('domain')}</span>
        ),
      },
      {
        accessorKey: 'description',
        enableSorting: false,
        header: (props) => (
          <DataTableHeadWithSorting
            title={dictionary.applications.table.columns.description}
            {...props}
          />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('description')}</span>
        ),
      },
      {
        accessorKey: 'createdAt',
        enableSorting: true,
        header: (props) => (
          <DataTableHeadWithSorting
            title={dictionary.applications.table.columns.createdAt}
            {...props}
          />
        ),
        cell: ({ row }) => (
          <span className="inline-block max-w-[300px] truncate">{row.getValue('createdAt')}</span>
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
                {getPermission('update:application').granted && (
                  <DropdownMenuItem onClick={() => table.options.meta?.onRowEdit(row.original)}>
                    {dictionary.applications.table.columns.actions.edit}
                  </DropdownMenuItem>
                )}
                {getPermission('delete:application').granted && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => table.options.meta?.onRowDelete(row.original)}>
                      {dictionary.applications.table.columns.actions.delete}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [dictionary.applications.table.columns, getPermission]
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
      toolbar={<ApplicationDataTableToolbar table={table} dictionary={dictionary} />}
    />
  );
}
