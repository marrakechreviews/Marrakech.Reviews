import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [onSuccess, setOnSuccess] = useState(null);

  const openModal = (data, successCallback) => {
    setFormData(data);
    setOnSuccess(() => successCallback);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(null);
    setOnSuccess(null);
  };

  const clearFormData = () => {
    setFormData(null);
  };

  const value = {
    isModalOpen,
    formData,
    onSuccess,
    openModal,
    closeModal,
    clearFormData,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}