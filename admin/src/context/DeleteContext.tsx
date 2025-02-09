"use client";
import { useState, createContext, useContext, ReactNode } from "react";

interface DeleteDialogContextProps {
  isOpen: boolean;
  toggleDialog: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteDialogContext = createContext<DeleteDialogContextProps | undefined>(
  undefined
);

export const DeleteDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDialog = () => setIsOpen((prev) => !prev);
  const onCancel = () => setIsOpen(false);
  const onDelete = () => {
    console.log("Deleted!"); // Replace with actual delete logic
    setIsOpen(false);
  };

  return (
    <DeleteDialogContext.Provider
      value={{ isOpen, toggleDialog, onDelete, onCancel }}
    >
      {children}
    </DeleteDialogContext.Provider>
  );
};

export const useDeleteDialog = () => {
  const context = useContext(DeleteDialogContext);
  if (!context) {
    throw new Error(
      "useDeleteDialog must be used within a DeleteDialogProvider"
    );
  }
  return context;
};
