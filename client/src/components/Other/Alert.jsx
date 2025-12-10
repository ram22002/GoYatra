
import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

const Alert = ({ message, onClose, onConfirm, title = "Important Information" }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 w-full h-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-base-100/80 backdrop-blur-xl border border-base-300 rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-warning" />
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X />
          </button>
        </div>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onConfirm} className="btn btn-primary">
            Proceed
          </button>
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Alert;
