import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";

const BookingAlert = ({ onConfirm, onCancel }) => {
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
                        <ExternalLink className="text-primary" />
                        <h2 className="text-xl font-bold">Confirm Booking</h2>
                    </div>
                    <button onClick={onCancel} className="btn btn-ghost btn-sm btn-circle">
                        <X size={24} />
                    </button>
                </div>
                <p className="mb-6">
                    Please double check the location on the booking page before proceeding.
                </p>
                <div className="flex justify-end gap-4">
                    <button onClick={onConfirm} className="btn btn-primary">
                        Continue to Booking
                    </button>
                    <button onClick={onCancel} className="btn btn-ghost">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BookingAlert;
