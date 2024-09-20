type CreatePaginator<T> = {
  limit?: number;
  page?: number;
  $transaction: (pagination: { offset: number; limit: number }) => Promise<[T, number]>;
};

export type PaginateReturn<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    lastPage: number;
    prev: number | null;
    next: number | null;
  };
};

/**
 * It's main purpose is to construct the meta data and shape of
 * the return value in a way to keep consistent, plus add some default values.
 *
 * The most important part of this util is the `$transaction` callback as
 * here we receive the data and count we need to construct the pagination.
 *
 * Given its simplicity it makes it ORM agnostic.
 *-----------------------------
 * Usage example with `Prisma`
 *-----------------------------
 *
 * const paginate = createPaginator({ page: 1 });
 * paginate({
 *   page,
 *   limit
 *   $transaction: ({ offset, limit }) =>
 *     prisma.$transaction([
 *       prisma.user.findMany({ skip: offset, take: limit, include, where, orderBy }),
 *       prisma.user.count({ where, orderBy }),
 *     ]),
 * });
 *
 */
export const createPaginator =
  (defaultOptions?: { page?: number; limit?: number }) =>
  async <T>({ page, limit, $transaction }: CreatePaginator<T>) => {
    const _limit = limit ?? defaultOptions?.limit ?? 10;

    const _offset = (page == null || page <= 1 ? 0 : page - 1) * _limit;

    const [data, total] = await $transaction({
      offset: _offset,
      limit: _limit,
    });

    const _page = page && page > 1 ? page : 1;

    const _lastPage = total % _limit === 0 ? total / _limit : Math.ceil(total / _limit);

    return {
      data,
      meta: {
        total,
        page: _page,
        lastPage: _lastPage,
        pageSize: _limit,
        prev: _page > 1 ? _page - 1 : null,
        next: _page < _lastPage ? _page + 1 : null,
      },
    };
  };
