
export interface IQuery {
  page?: string;
  limit?: string;
  
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  searchTerm?: string;
  categoryType?:string
  name?:string;
  slug?:string;
  description?:string;   
}

export interface IPaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}
