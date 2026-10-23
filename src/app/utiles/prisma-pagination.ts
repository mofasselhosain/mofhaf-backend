import { IPaginationOptions, IQuery } from "../intrerface/query.interface";


export const calculatePagination = (
  query: IQuery
): IPaginationOptions => {
  const requestedPage = Number(query.page) || 1;
  const requestedLimit = Number(query.limit) || 10;

  const page = Math.max(1, Math.floor(requestedPage));
  const limit = Math.min(
    100,
    Math.max(1, Math.floor(requestedLimit))
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortBy: query.sortBy || "createdAt",
    sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
  };
};

export const calculateMeta = (
  page: number,
  limit: number,
  total: number
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
