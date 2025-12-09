import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, DollarSign, CheckCircle2, AlertCircle, Zap, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const USER_ID = "demo-user-123";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    due_date: "",
    recurring: false,
    autopay: false,
    frequency: "Monthly",
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
      toast.error("I'm having trouble loading your bills right now. Can we try again in a moment?");
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
        autopay: newBill.autopay,
        frequency: newBill.frequency,
      });
      setNewBill({ name: "", amount: "", due_date: "", recurring: false, autopay: false, frequency: "Monthly" });
      setShowAdd(false);
      fetchBills();
      toast.success("I've got this bill noted. You don't have to remember it now.");
    } catch (error) {
      console.error("Error adding bill:", error);
      toast.error("Something went wrong");
    }
  };

  const payBill = async (bill) => {
    try {
      await axios.patch(`${API}/bills/${bill.id}/pay`);
      fetchBills();
      toast.success(`Got it. I've marked ${bill.name} as paid.`);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const startEditBill = (bill) => {
    setEditingBill(bill.id);
    setNewBill({
      name: bill.name,
      amount: bill.amount.toString(),
      due_date: bill.due_date,
      recurring: bill.recurring,
      autopay: bill.autopay,
      frequency: bill.frequency,
    });
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditingBill(null);
    setNewBill({ name: "", amount: "", due_date: "", recurring: false, autopay: false, frequency: "Monthly" });
  };

  const saveEditBill = async (e) => {
    e.preventDefault();
    if (!newBill.name.trim() || !newBill.amount || !newBill.due_date) return;

    try {
      await axios.patch(`${API}/bills/${editingBill}`, {
        user_id: USER_ID,
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        due_date: newBill.due_date,
        recurring: newBill.recurring,
        autopay: newBill.autopay,
        frequency: newBill.frequency,
      });
      setNewBill({ name: "", amount: "", due_date: "", recurring: false, autopay: false, frequency: "Monthly" });
      setEditingBill(null);
      fetchBills();
      toast.success("Bill updated. I've got that saved.");
    } catch (error) {
      console.error("Error updating bill:", error);
      toast.error("Something didn't save properly. It's okay — let's try that again.");
    }
  };

  const deleteBill = async (billId) => {
    try {
      await axios.delete(`${API}/bills/${billId}`);
      fetchBills();
      toast.success("Bill removed gently.");
    } catch (error) {
      toast.error("Something didn't save properly. It's okay — let's try that again.");
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

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const unpaidBills = bills.filter((b) => !b.paid);
  const dueSoon = unpaidBills.filter((b) => {
    const dueDate = new Date(b.due_date);
    return dueDate >= today && dueDate <= nextWeek;
  });
  const paidBills = bills.filter((b) => b.paid);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const BillCard = ({ bill, isPaid }) => (
    <div
      className="bg-white rounded-2xl border border-stone-200 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 space-y-4"
      data-testid={`bill-${bill.id}`}
    >
      {/* Bill Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <DollarSign className="text-primary" strokeWidth={1.5} size={20} />
          </div>
          <div>
            <h3 className="font-fraunces text-lg text-stone-800">{bill.name}</h3>
            <p className="text-sm text-stone-500">Due: {formatDate(bill.due_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => startEditBill(bill)}
            data-testid={`edit-bill-btn-${bill.id}`}
            className="text-stone-400 hover:text-primary transition-colors duration-300"
          >
            <Edit2 strokeWidth={1.5} size={18} />
          </button>
          <button
            onClick={() => deleteBill(bill.id)}
            data-testid={`delete-bill-btn-${bill.id}`}
            className="text-stone-400 hover:text-red-500 transition-colors duration-300"
          >
            <Trash2 strokeWidth={1.5} size={18} />
          </button>
          {isPaid ? (
            <span className="text-xs bg-success/10 text-success px-3 py-1.5 rounded-full flex items-center gap-1 font-medium">
              <CheckCircle2 strokeWidth={2} size={14} />
              Paid
            </span>
          ) : (
            <button
              onClick={() => payBill(bill)}
              data-testid={`pay-bill-btn-${bill.id}`}
              className="text-sm bg-stone-100 hover:bg-success/10 text-stone-600 hover:text-success px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 font-medium"
            >
              <CheckCircle2 strokeWidth={1.5} size={16} />
              Mark as Paid
            </button>
          )}
        </div>
      </div>

      {/* Bill Details */}
      <div className="border-t border-stone-100 pt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-500">Amount</span>
          <span className="text-2xl font-fraunces text-primary">${bill.amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-500">Autopay</span>
          <span className="text-sm text-stone-700">
            {bill.autopay ? (
              <span className="flex items-center gap-1 text-success">
                <Zap size={14} />
                Yes
              </span>
            ) : (
              "No"
            )}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-500">Frequency</span>
          <span className="text-sm text-stone-700">{bill.frequency || "Monthly"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8" data-testid="bills-page">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4" data-testid="bills-title">Bills & Payments</h1>
        <p className="text-lg text-stone-600 leading-relaxed font-caveat">
          I'll remember these softly, so your mind doesn't have to.
        </p>
      </div>

      {/* Add Bill Button */}
      {!showAdd && !editingBill && (
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

      {/* Add/Edit Bill Form */}
      {(showAdd || editingBill) && (
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6">
          <form onSubmit={editingBill ? saveEditBill : addBill} className="space-y-4" data-testid="add-bill-form">
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

            <select
              value={newBill.frequency}
              onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value })}
              data-testid="bill-frequency-select"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBill.recurring}
                  onChange={(e) => setNewBill({ ...newBill, recurring: e.target.checked })}
                  data-testid="bill-recurring-checkbox"
                  className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/10"
                />
                <span className="text-stone-600">Recurring</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBill.autopay}
                  onChange={(e) => setNewBill({ ...newBill, autopay: e.target.checked })}
                  data-testid="bill-autopay-checkbox"
                  className="w-5 h-5 rounded border-stone-300 text-success focus:ring-2 focus:ring-success/10"
                />
                <span className="text-stone-600 flex items-center gap-2">
                  <Zap className="text-success" size={16} />
                  On autopay
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  cancelEdit();
                }}
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
                {editingBill ? "Update Bill" : "Save Bill"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Due Soon Section */}
      {dueSoon.length > 0 && (
        <div data-testid="due-soon-section">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-warning" strokeWidth={1.5} size={20} />
            <h2 className="text-2xl">Due Soon (Next 7 Days)</h2>
          </div>
          <p className="text-stone-600 font-caveat text-lg mb-6">
            Gentle reminders for what needs your attention soon.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {dueSoon.map((bill) => (
              <BillCard key={bill.id} bill={bill} isPaid={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {dueSoon.length === 0 && unpaidBills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stone-500 font-caveat text-xl">All caught up! Nothing due right now.</p>
        </div>
      )}

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div data-testid="paid-bills-section">
          <h2 className="text-2xl mb-4">Paid Recently</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {paidBills.slice(0, 6).map((bill) => (
              <BillCard key={bill.id} bill={bill} isPaid={true} />
            ))}
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="max-w-3xl mx-auto bg-primary/5 rounded-2xl p-6 border border-primary/20" data-testid="bills-footnote">
        <p className="text-stone-600 leading-relaxed text-center">
          Update anything anytime. Your Attic Mind will always remind you gently.
        </p>
      </div>
    </div>
  );
}