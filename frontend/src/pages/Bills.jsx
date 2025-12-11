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
      toast.error("We couldn't save this right now. Your information is safe — try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (e) => {
    e.preventDefault();
    
    // Validate each field individually
    if (!newBill.name.trim()) {
      toast.error("Please enter a bill name.");
      return;
    }
    
    if (!newBill.due_date) {
      toast.error("Please choose a due date.");
      return;
    }
    
    if (newBill.amount === "" || newBill.amount === null || newBill.amount === undefined) {
      toast.error("Please enter an amount.");
      return;
    }

    // Validate amount
    const amount = parseFloat(newBill.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      await axios.post(`${API}/bills`, {
        user_id: USER_ID,
        name: newBill.name,
        amount: amount,
        due_date: newBill.due_date,
        recurring: newBill.recurring,
        autopay: newBill.autopay,
        frequency: newBill.frequency,
      });
      setNewBill({ name: "", amount: "", due_date: "", recurring: false, autopay: false, frequency: "Monthly" });
      setShowAdd(false);
      fetchBills();
      toast.success("Your bill has been added.");
    } catch (error) {
      console.error("Error adding bill:", error);
      toast.error("That didn't save this time. Try again in a moment.");
    }
  };

  const payBill = async (bill) => {
    try {
      await axios.patch(`${API}/bills/${bill.id}/pay`);
      fetchBills();
      toast.success("Marked as paid. One less thing to hold.");
    } catch (error) {
      toast.error("That didn't go through. Let's try that again slowly.");
    }
  };

  const startEditBill = (bill) => {
    setEditingBill(bill.id);
    // Ensure date is in YYYY-MM-DD format for date input
    const dateValue = bill.due_date.includes('T') 
      ? bill.due_date.split('T')[0] 
      : bill.due_date;
    
    setNewBill({
      name: bill.name,
      amount: bill.amount.toString(),
      due_date: dateValue,
      recurring: bill.recurring,
      autopay: bill.autopay,
      frequency: bill.frequency || "Monthly",
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
      toast.success("Your bill has been updated.");
    } catch (error) {
      console.error("Error updating bill:", error);
      toast.error("That didn't save this time. Try again in a moment.");
    }
  };

  const deleteBill = async (billId) => {
    try {
      await axios.delete(`${API}/bills/${billId}`);
      fetchBills();
      toast.success("Removed. You're all set.");
    } catch (error) {
      toast.error("That didn't save this time. Try again in a moment.");
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const BillCard = ({ bill, isPaid }) => (
    <div
      className="bg-white rounded-2xl border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 space-y-4"
      data-testid={`bill-${bill.id}`}
    >
      {/* Bill Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="text-primary" strokeWidth={1.5} size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-fraunces text-lg text-stone-800">{bill.name}</h3>
            <p className="text-sm text-stone-500">Due: {formatDate(bill.due_date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
              className="text-sm bg-stone-100 hover:bg-success/10 text-stone-600 hover:text-success px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 font-medium whitespace-nowrap"
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
          I'll keep track of these softly, so your mind doesn't have to hold them.
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
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-8 my-8">
          <h2 className="text-2xl mb-6 font-fraunces">{editingBill ? "Edit Bill" : "Add a New Bill"}</h2>
          <form onSubmit={editingBill ? saveEditBill : addBill} className="space-y-4" data-testid="add-bill-form">
            <input
              type="text"
              value={newBill.name}
              onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
              placeholder="Enter bill name…"
              data-testid="bill-name-input"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            />

            <input
              type="date"
              value={newBill.due_date}
              onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
              placeholder="Choose due date…"
              data-testid="bill-date-input"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            />

            <input
              type="number"
              step="0.01"
              value={newBill.amount}
              onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
              placeholder="Enter amount…"
              data-testid="bill-amount-input"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            />

            <select
              value={newBill.frequency}
              onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value })}
              data-testid="bill-frequency-select"
              className="w-full bg-stone-50 border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 rounded-2xl h-12 px-4 outline-none"
            >
              <option value="">Select frequency…</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
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
                  Is this on autopay?
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

      {/* Upcoming Bills Section */}
      <div data-testid="upcoming-bills-section">
        <div className="mb-4">
          <h2 className="text-2xl">Upcoming Bills</h2>
          <p className="text-sm text-stone-500 mt-1">These are coming up soon.</p>
        </div>
        {unpaidBills.length === 0 ? (
          <p className="text-stone-500 font-caveat text-lg">Nothing due yet. I'll let you know when something needs attention.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {unpaidBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} isPaid={false} />
            ))}
          </div>
        )}
      </div>

      {/* Paid Bills Section */}
      {paidBills.length > 0 && (
        <div data-testid="paid-bills-section">
          <div className="mb-4">
            <h2 className="text-2xl">Paid Recently</h2>
            <p className="text-sm text-stone-500 mt-1">These are taken care of.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {paidBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} isPaid={true} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stone-500 font-caveat text-lg">No reminders yet. Add the next important date and I'll remember it for you.</p>
        </div>
      )}

      {/* Footer Note */}
      <div className="max-w-3xl mx-auto text-center" data-testid="bills-footer">
        <p className="text-stone-500 leading-relaxed font-caveat text-lg">
          You're not doing this alone. I'll keep track of the details so you don't have to.
        </p>
      </div>
    </div>
  );
}
