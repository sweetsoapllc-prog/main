import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Tasks from "@/pages/Tasks";
import Routines from "@/pages/Routines";
import Bills from "@/pages/Bills";
import WeeklyView from "@/pages/WeeklyView";
import Layout from "@/components/Layout";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/weekly" element={<WeeklyView />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;