"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";

type Props = {
  open: boolean;
  loading: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function CrudDeleteDialog(
  props: Props,
) {
  return <ConfirmDialog {...props} />;
}