"use client";

import { motion, Variants } from "framer-motion";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// Define the shape of the alert state
interface AlertState {
  message: string;
  type: "info" | "success" | "error" | "confirm";
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

// Define the shape of the context value
interface AlertContextType {
  showAlert: (
    message: string,
    type?: "info" | "success" | "error" | "confirm",
    onConfirm?: (() => void) | null,
    onCancel?: (() => void) | null
  ) => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = (
    message: string,
    type: "info" | "success" | "error" | "confirm" = "info",
    onConfirm: (() => void) | null = null,
    onCancel: (() => void) | null = null
  ) => {
    setAlert({ message, type, onConfirm, onCancel });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const value = { showAlert, closeAlert };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onConfirm={alert.onConfirm}
          onCancel={alert.onCancel}
          onClose={closeAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

interface CustomAlertProps {
  message: string;
  type: "info" | "success" | "error" | "confirm";
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  onClose: () => void;
}

const CustomAlert = ({ message, type, onConfirm, onCancel, onClose }: CustomAlertProps) => {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    setShow(false);
    setTimeout(onClose, 300);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const modalVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.3 } },
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "error":
        return "bg-red-900";
      case "success":
        return "bg-green-900";
      case "confirm":
        return "bg-purple-900";
      default:
        return "bg-zinc-900";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "error":
        return "Error";
      case "success":
        return "Success";
      case "confirm":
        return "Confirm";
      default:
        return "Message";
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
      variants={containerVariants}
      initial="hidden"
      animate={show ? "visible" : "hidden"}
      exit="exit"
    >
      <motion.div
        className={`relative w-full max-w-sm rounded-xl shadow-2xl p-6 ${getBackgroundColor()} text-white`}
        variants={modalVariants}
      >
        <h3 className="text-xl font-semibold mb-2">{getTitle()}</h3>
        <p className="text-sm text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg text-gray-300 hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${
              type === "error" ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {onConfirm ? "OK" : "Close"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

