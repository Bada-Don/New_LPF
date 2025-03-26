import { useState } from "react";

const usePaymentTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const transfer = async (to, amount, memo = "") => {
    setLoading(true);
    setError(null);
    try {
      const transferWindow = await window.ic.plug.requestTransfer({
        to,
        amount,
        memo,
      });
      return transferWindow;
    } catch (err) {
      setError(err.message || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { transfer, loading, error };
};

export default usePaymentTransfer;
