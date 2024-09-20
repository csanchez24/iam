'use client';

import type {
  HeaderContext,
  InitialTableState,
  PaginationState,
  Table as ReactTable,
  RowData,
  SortingState,
  Column,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  EyeNoneIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons';
import * as React from 'react';
import { Input } from './ui/input';

import { useProgress } from '@/hooks';
import { cn } from '@/utils/cn';
import { flexRender } from '@tanstack/react-table';
import { useQueryState } from 'nuqs';
import { useDebounce } from 'use-debounce';
import { parseSortSearchParam } from '@/utils/query';

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onSorting?(sorting: SortingState): void;
    onPagination?: (pagination: Record<'page' | 'limit', number>) => void;
    onSearch?(term: string): void;
  }
}

export type DataTableProps<T> = {
  table: ReactTable<T>;
  toolbar?: React.ReactElement;
  withPagination?: boolean;
  isInitialLoading?: boolean;
  isLoading?: boolean;
  classes?: {
    root?: string;
    header?: string;
    body?: string;
    head?: string;
    row?: string;
    cell?: string;
  };
  dictionary?: {
    pagination: {
      rowsPerPage: string;
      pageOf: {
        page: string;
        of: string;
      };
    };
  };
};

function DataTableSkeleton<T>({ table, classes }: DataTableProps<T>) {
  return (
    <>
      {Array(table.getState().pagination.pageSize ?? 10)
        .fill({})
        .map((_, rowIdx) => (
          <TableRow key={`skeleton-row-${rowIdx}`} className={classes?.row}>
            {Array(table.options.columns.length)
              .fill({})
              .map((_, cellIdx) => (
                <TableCell
                  key={`skeleton-row-${rowIdx}-${cellIdx}`}
                  className={cn('py-2', classes?.cell)}
                >
                  <Skeleton className="h-7 w-full" />
                </TableCell>
              ))}
          </TableRow>
        ))}
    </>
  );
}

function DataTableEmpty<T>({ table, classes }: DataTableProps<T>) {
  return (
    <TableRow className={classes?.row}>
      <TableCell colSpan={table.options.columns.length} className="h-24 text-center">
        No results.
      </TableCell>
    </TableRow>
  );
}

function DataTableRows<T>({ table, classes }: DataTableProps<T>) {
  return (
    <>
      {table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          className={classes?.row}
          data-state={row.getIsSelected() && 'selected'}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} className={cn('py-2', classes?.cell)}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function DataTableBody<T>({ table, classes, isInitialLoading }: DataTableProps<T>) {
  return (
    <TableBody className={classes?.body}>
      {isInitialLoading ? (
        <DataTableSkeleton table={table} classes={classes} />
      ) : table.getRowModel().rows?.length ? (
        <DataTableRows table={table} classes={classes} />
      ) : (
        <DataTableEmpty table={table} classes={classes} />
      )}
    </TableBody>
  );
}

function DataTableHeader<T>({ table, classes }: DataTableProps<T>) {
  return (
    <TableHeader className={classes?.header}>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className={classes?.row}>
          {headerGroup.headers.map((header) => {
            return (
              <TableHead key={header.id} className={classes?.head}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

type DataTablePaginationProps<T> = {
  table: ReactTable<T>;
  dictionary?: {
    pagination: {
      rowsPerPage: string;
      pageOf: {
        page: string;
        of: string;
      };
    };
  };
};

/**
 * Provides interface and functionality for pagination related elements
 * e.g. moving back/forward, beginning/end, and changing rows per page.
 * This component can handle manual or local pagination given `manualPagination`
 * option while calling the useReactTable hook.
 *
 * Remember to provide the options below when using local pagination.
 *
 * const table = useReactTable({
 *   ...
 *   manualPagination: false,
 *   getPaginationRowModel: getPaginationRowModel(),
 *   ...
 * })
 *
 */
function DataTablePagination<T>({ table, dictionary }: DataTablePaginationProps<T>) {
  const [, setPage] = useQueryState('page', { history: 'replace' });
  const [, setLimit] = useQueryState('limit', { history: 'replace' });

  const pagination = table.getState().pagination;

  const handlePaginate = React.useCallback(
    (dir: 'next' | 'prev' | 'first' | 'last') => () => {
      let page = Math.max(1, pagination.pageIndex + 1);
      switch (dir) {
        case 'next': {
          page = page + 1;
          break;
        }
        case 'prev': {
          page = page - 1;
          break;
        }
        case 'first': {
          page = 1;
          break;
        }
        case 'last': {
          page = table.getPageCount();
          break;
        }
      }

      setPage(page.toString());
      if (table.options.manualPagination && table.options.meta?.onPagination) {
        table.setPagination({ ...pagination, pageIndex: page - 1 });
        table.options.meta.onPagination({ limit: pagination.pageSize, page });
      } else if (!table.options.manualPagination) {
        table.setPagination({ ...pagination, pageIndex: page - 1 });
      } else {
        throw new Error(
          'You must enable/disable `manualPagination` option and add corresponding handler when using <DataTablePagination /> '
        );
      }
    },
    [pagination, table, setPage]
  );

  const handlePageSize = (value: string) => {
    table.setPageSize(Number(value));
    table.options.meta?.onPagination?.({ page: 1, limit: Number(value) });
    setLimit(value);
    setPage('1');
  };

  return (
    <div className="flex items-center justify-between px-2">
      {/* Display number of rows selected when enabling this feature */}
      {table.options.enableRowSelection && (
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
      <div className="flex items-center space-x-6 max-sm:w-full sm:ml-auto lg:space-x-8">
        {/* Select rows per page dropdown */}
        <div className="flex items-center max-sm:w-full">
          <p className="mr-2 hidden text-sm font-medium sm:block">
            {dictionary?.pagination.rowsPerPage ?? 'Rows per page'}
          </p>
          <Select value={`${pagination.pageSize}`} onValueChange={handlePageSize}>
            <SelectTrigger className="h-9 w-[70px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page or total summary with action buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex min-w-[100px] items-center justify-center text-sm font-medium">
            {dictionary?.pagination.pageOf.page ?? 'Page'} {pagination.pageIndex + 1}{' '}
            {dictionary?.pagination.pageOf.of ?? 'of'} {table.getPageCount()}
          </div>

          <Button
            variant="outline"
            className="hidden h-9 w-9 p-0 lg:flex"
            onClick={handlePaginate('first')}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={handlePaginate('prev')}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go back</span>
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={handlePaginate('next')}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go next</span>
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-9 w-9 p-0 lg:flex"
            onClick={handlePaginate('last')}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const DataTable = <T,>({
  table,
  toolbar,
  withPagination,
  isLoading,
  isInitialLoading,
  classes,
  dictionary,
}: DataTableProps<T>) => {
  const { progress } = useProgress({ enabled: !!isLoading });

  return (
    <div className="space-y-4">
      {toolbar && toolbar}
      <div className={cn('relative border', !isLoading && 'rounded-md')}>
        <Progress
          value={progress}
          className={cn('absolute -mt-1 h-1 w-full rounded-b-md', !isLoading && 'hidden')}
        />
        <Table className={classes?.root}>
          <DataTableHeader table={table} classes={classes} />
          <DataTableBody table={table} classes={classes} isInitialLoading={isInitialLoading} />
        </Table>
      </div>
      {withPagination && <DataTablePagination table={table} dictionary={dictionary} />}
    </div>
  );
};

type DataTableSearchFilterProps<T> = {
  table: ReactTable<T>;
  dictionary?: {
    input: {
      placeholder: string;
    };
  };
};

/**
 * Commonly used search input filter. Remeber to import `getFilteredRowModel` from
 * `@tanstack/react-table` when using local filters instead of reaching out to an API.
 *
 * const table = useReactTable({
 *   ...
 *   getFilteredRowModel: getFilteredRowModel(),
 *   ...
 * })
 */
export function DataTableSearchFilter<T>({ table, dictionary }: DataTableSearchFilterProps<T>) {
  const [query, setQuery] = useQueryState('query', { history: 'replace' });
  const [, setPage] = useQueryState('page', { history: 'replace' });

  const handleSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const v = event.target.value;
      setQuery(v || null);

      // reset pagination
      setPage(v ? '1' : null);
      table.setPageIndex(0);

      if (table.options.manualFiltering && table.options.meta?.onSearch) {
        table.options.meta.onSearch(v);
      } else if (!table.options.manualFiltering) {
        table.setGlobalFilter(v);
      } else {
        throw new Error(
          'You must enable/disable `manualFiltering` option and add corresponding handler when using <DataTableSearchFilter /> '
        );
      }
    },
    [table, setPage, setQuery]
  );

  return (
    <div className="flex flex-1 items-center space-x-2">
      <Input
        name="data-table-filter"
        placeholder={dictionary?.input.placeholder ?? 'Filter results...'}
        value={query ?? ''}
        onChange={handleSearch}
        className="h-9 w-[150px] lg:w-[250px]"
      />
    </div>
  );
}

/**
 * Sort either internally with react-table's getSortedRowModel helper or
 * externally (manualSorting = true). In the case we have a large dataset
 * that we paginate, we'll want to delegate sorting to the database level.
 * In such case turn manualSorting on and pass in `onSortingChange`
 *
 * const table = useReactTable({
 *   ...
 *   manualSorting: false,
 *   getSortedRowModel: getSortedRowModel(),
 *   ...
 * })
 */
export function DataTableHeadWithSorting<T, V>({
  title,
  table,
  column,
  className,
}: React.HTMLAttributes<HTMLDivElement> & HeaderContext<T, V> & { title?: string }) {
  const [, setSort] = useQueryState('sort', { history: 'replace' });

  const toggleSorting = React.useCallback(
    (desc: boolean) => () => {
      setSort(`${column.id},${desc ? 'desc' : 'asc'}`);

      if (table.options.manualSorting && table.options.meta?.onSorting) {
        table.options.meta.onSorting([{ id: column.id, desc }]);
        column.toggleSorting(desc);
      } else if (!table.options.manualSorting) {
        column.toggleSorting(desc);
      } else {
        throw new Error(
          'You must enable/disable `manualSorting` option and add corresponding handler when using <DataTableHeadWithSorting /> '
        );
      }
    },
    [table.options, column, setSort]
  );

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-full min-h-[2.25rem] data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={toggleSorting(false)}>
            <ArrowUpIcon className="mr-3 h-4 w-4 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleSorting(true)}>
            <ArrowDownIcon className="mr-3 h-4 w-4 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-3 h-4 w-4 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type DataTableViewOptionsProps<T> = {
  table: ReactTable<T>;
  dictionary?: {
    view: string;
    toggleColumns: {
      key: string;
      values: { [k in Column<T, unknown>['id']]: string };
    };
  };
};

/** Helper component to hide/show columns. This component is mainly meant to be used in the toolbar */
export function DataTableViewOptions<T>({ table, dictionary }: DataTableViewOptionsProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden h-9 lg:flex">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          {dictionary?.view ?? 'View'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>{dictionary?.toggleColumns.key ?? 'Toggle columns'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {dictionary?.toggleColumns.values[column.id] ?? column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const PAGINATION_DEFAULT = { page: 1, limit: 10 };

/** A set of common data-table helpers to speed things up */
export const useDataTableUtils = (params: {
  sort?: Record<string, 'asc' | 'desc'> | undefined;
  pagination?: Record<'page' | 'limit', number>;
}) => {
  const [query] = useQueryState('query');
  const [page] = useQueryState('page');
  const [limit] = useQueryState('limit');
  const [sortq] = useQueryState('sort');

  // Initiate sort state to query paramters if any else fallback to hook's params if any.
  const [sort, setSort] = React.useState<Record<string, 'asc' | 'desc'> | undefined>(() => {
    return parseSortSearchParam(sortq, params?.sort);
  });
  const onSorting = React.useCallback((sortingState: SortingState) => {
    const sortBy = sortingState.at(0);
    if (sortBy) {
      setSort({ [sortBy.id]: sortBy.desc === true ? 'desc' : 'asc' });
    }
  }, []);

  // Initiate pagination state given hook's parameters, search params or defaults values
  // and keep track of changes as user interacts with buttons.
  const [pagination, setPagination] = React.useState<Record<'page' | 'limit', number>>(() => {
    return {
      page:
        page && !isNaN(Number.parseInt(page))
          ? Number.parseInt(page)
          : params?.pagination?.page ?? PAGINATION_DEFAULT.page,
      limit:
        limit && !isNaN(Number.parseInt(limit))
          ? Number.parseInt(limit)
          : params?.pagination?.limit ?? PAGINATION_DEFAULT.limit,
    };
  });
  const onPagination = React.useCallback((paginationState: { page: number; limit: number }) => {
    setPagination(paginationState);
  }, []);

  // Initiate search filters to `query` search parameters if any.
  const [search, setSearch] = React.useState<string | undefined>(() => {
    return query ?? '';
  });
  const [deboucedSearchText] = useDebounce(search?.trim(), 500);
  const onSearch = React.useCallback((term: string) => {
    setSort(undefined);
    setPagination(PAGINATION_DEFAULT);
    setSearch(term);
  }, []);

  return {
    deboucedSearchText,
    pagination,
    sort,
    onSorting,
    onPagination,
    onSearch,
  };
};

export type UseDataTableUtilsReturn = ReturnType<typeof useDataTableUtils>;

/** Convert from { pageSize: number, pageIndex: number } -> { page: number, limit: number}. */
export function convertToApiPagination(pagination: PaginationState) {
  return { page: pagination.pageIndex + 1, limit: pagination.pageSize };
}

/** Convert from { page: number, limit: number } -> { pageSize: number, pageIndex: number }. */
export function convertToDatatablePagination(pagination: Record<'page' | 'limit', number>) {
  return { pageSize: pagination.limit, pageIndex: pagination.page - 1 };
}

/** Calculate page count based on api's returned total records count */
export function getPageCountFromApi(total: number | undefined, limit: number) {
  return total ? Math.ceil(total / limit) : -1;
}

/** Convert from { [column]: 'desc'| 'asc' } -> [{ id: string, desc: boolean }] */
export function convertToDatatableSorting(
  sort: Record<string, 'desc' | 'asc'> | undefined
): SortingState | undefined {
  return !sort
    ? undefined
    : Object.entries(sort).map(([column, dir]) => ({ id: column, desc: dir === 'desc' }));
}

/**
 * This helpers aims to ease setting the `initialState` while calling the `useReactTable`
 * hooks as oftentimes we'll want to initiate the state given the set query search params .
 */
export function getInitialDatatableState({
  pagination,
  sort,
}: {
  pagination: Record<'page' | 'limit', number>;
  sort: Record<string, 'desc' | 'asc'> | undefined;
}): InitialTableState {
  return {
    pagination: convertToDatatablePagination(pagination),
    sorting: convertToDatatableSorting(sort),
  };
}
