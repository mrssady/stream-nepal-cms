"use client";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";

import CrudSearch from "./CrudSearch";
import CrudTable from "./CrudTable";
import { CrudPageProps } from "./types";

export default function CrudPage<
  T extends { id: string },
>({
  title,
  description,
  data,
  columns,
  loading,
  search,
  setSearch,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  createButton,
  modal,
  deleteDialog,
  onEdit,
  onDelete,
}: CrudPageProps<T>) {
  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={title}
          description={description}
          action={createButton}
        />

        <CrudSearch
          value={search}
          onChange={setSearch}
          placeholder={`Search ${title.toLowerCase()}...`}
        />

        {data.length === 0 ? (
          <EmptyState
            title={`No ${title} Found`}
            description={`Create your first ${title.slice(
              0,
              -1,
            )}.`}
          />
        ) : (
          <>
            <CrudTable
              data={data}
              columns={columns}
              onEdit={onEdit}
              onDelete={onDelete}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={data.length}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>

      {modal}
      {deleteDialog}
    </>
  );
}