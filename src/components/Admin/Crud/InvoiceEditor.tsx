// components/Crud/InvoiceEditor.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Invoice } from "@/lib/types"; // Ensure this matches your Invoice type

function hasErrorProperties(value: unknown): value is { name: string; message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as any).name === 'string' &&
    'message' in value &&
    typeof (value as any).message === 'string'
  );
}

interface InvoiceEditorProps {
  invoice: Invoice;
  onClose: () => void;
  onUpdated: (updatedInvoice: Invoice) => void;
}

export default function InvoiceEditor({
  invoice,
  onClose,
  onUpdated,
}: InvoiceEditorProps) {
  const [amount, setAmount] = useState(invoice.amount);
  const [status, setStatus] = useState(invoice.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateRequested, setUpdateRequested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Optimistically update the UI immediately
    const optimisticInvoice = { ...invoice, amount, status };
    onUpdated(optimisticInvoice);
    
    // Then trigger the API call
    setUpdateRequested(true);
  };
 
  useEffect(() => {
    if (!updateRequested) return;

    const updateInvoice = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/auth/invoices/${invoice._id}/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount, status }),
        });

        if (!response.ok) {
          throw new Error("Failed to update invoice");
        }

        const updatedInvoice = await response.json();
        // (Optional) Reconcile the optimistic update with the actual server response
        onUpdated(updatedInvoice);
        onClose();
      } catch (err: any) {
        setError(err.message || "Update failed");
        // (Optional) You might choose to re-fetch or rollback the optimistic update here
      } finally {
        setLoading(false);
        setUpdateRequested(false);
      }
    };

    updateInvoice();
  }, [updateRequested, amount, status, invoice._id, onUpdated, onClose]);


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Invoice</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
