import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Tasks from "@/pages/Tasks";
import Routines from "@/pages/Routines";
import Bills from "@/pages/Bills";
import WeeklyView from "@/pages/WeeklyView";
import BrainOffload from "@/pages/BrainOffload";
import Layout from "@/components/Layout";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/brain-offload" element={<BrainOffload />} />
                  <Route path="/routines" element={<Routines />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/weekly" element={<WeeklyView />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;