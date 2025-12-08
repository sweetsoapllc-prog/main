import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    due_date: "",
    recurring: false,
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API}/bills/${USER_ID}`);
      setBills(res.data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (e) => {
    e.preventDefault();
    if (!newBill.name.trim() || !newBill.amount || !newBill.due_date) return;

    try {
      await axios.post(`${API}/bills`, {
        user_id: USER_ID,
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        due_date: newBill.due_date,
        recurring: newBill.recurring,
      });
      setNewBill({ name: "", amount: "", due_date: "", recurring: false });
      setShowAdd(false);
      fetchBills();
      toast.success("Bill added");
    } catch (error) {
      console.error("Error adding bill:", error);
      toast.error("Failed to add bill");
    }
  };

  const payBill = async (billId) => {
    try {
      await axios.patch(`${API}/bills/${billId}/pay`);
      fetchBills();
      toast.success("Bill marked as paid");
    } catch (error) {
      toast.error("Failed to mark bill as paid");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bills...</p>
        </div>
      </div>
    );
  }

  const unpaidBills = bills.filter((b) => !b.paid);
  const paidBills = bills.filter((b) => b.paid);

  return (
    <div className="space-y-8" data-testid="bills-page">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4" data-testid="bills-title">Bills & Payments</h1>
        <p className="text-lg text-stone-600 leading-relaxed font-caveat">
          I'll help you remember, so you don't have to.
        </p>
      </div>

      {/* Add Bill Button */}
      {!showAdd && (
        <div className="text-center">
          <button
            onClick={() => setShowAdd(true)}
            data-testid="show-add-bill-btn"
            className="bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 px-6 py-3 rounded-full inline-flex items-center gap-2"
          >
            <Plus strokeWidth={1.5} size={18} />
            Add New Bill
          </button>
        </div>
      )}

      {/* Add Bill Form */}
      {showAdd && (
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6">
          <form onSubmit={addBill} className="space-y-4" data-testid="add-bill-form">
            <input
              type="text"
              value={newBill.name}
              onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
              placeholder="Bill name (e.g., Electric, Rent)"
              data-testid="bill-name-input"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            />

            <input
              type="number"
              step="0.01"
              value={newBill.amount}
              onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
              placeholder="Amount ($)"
              data-testid="bill-amount-input"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            />

            <input
              type="date"
              value={newBill.due_date}
              onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
              data-testid="bill-date-input"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newBill.recurring}
                onChange={(e) => setNewBill({ ...newBill, recurring: e.target.checked })}
                data-testid="bill-recurring-checkbox"
                className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/10"
              />
              <span className="text-stone-600">Recurring monthly</span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                data-testid="cancel-bill-btn"
                className="flex-1 bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-300 py-3 rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="save-bill-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300 py-3 rounded-full"
              >
                Save Bill
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Unpaid Bills */}
      <div data-testid="unpaid-bills-section">
        <h2 className="text-2xl mb-4">Upcoming</h2>
        {unpaidBills.length === 0 ? (
          <p className="text-stone-500 font-caveat text-lg">All caught up! Nothing due right now.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {unpaidBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6"
                data-testid={`bill-${bill.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                      <DollarSign className="text-warning" strokeWidth={1.5} size={20} />
                    </div>
                    <div>
                      <h3 className="font-fraunces text-lg">{bill.name}</h3>
                      <p className="text-sm text-stone-500">
                        Due: {new Date(bill.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => payBill(bill.id)}
                    data-testid={`pay-bill-btn-${bill.id}`}
                    className="text-stone-300 hover:text-success transition-colors duration-300"
                  >
                    <CheckCircle2 strokeWidth={1.5} size={24} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="text-2xl font-fraunces text-primary">${bill.amount.toFixed(2)}</span>
                  {bill.recurring && (
                    <span className="text-xs bg-info/10 text-info px-3 py-1 rounded-full">Recurring</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div data-testid="paid-bills-section">
          <h2 className="text-2xl mb-4">Paid</h2>
          <div className="space-y-2">
            {paidBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-stone-50 rounded-2xl p-4 flex items-center justify-between opacity-60"
                data-testid={`paid-bill-${bill.id}`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-success" strokeWidth={1.5} size={20} />
                  <span>{bill.name}</span>
                </div>
                <span className="text-stone-600">${bill.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}