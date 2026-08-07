"use client";

import SearchBar from "@/components/common/SearchBar";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function CrudSearch({
  value,
  onChange,
  placeholder,
}: Props) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}