import { Switch, Route, Router } from "wouter";
import Dashboard from "./pages/Dashboard";
import ProcessManager from "./pages/ProcessManager";
import Scheduler from "./pages/Scheduler";
import IPC from "./pages/IPC";
import Deadlock from "./pages/Deadlock";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/processes" component={ProcessManager} />
        <Route path="/scheduler" component={Scheduler} />
        <Route path="/ipc" component={IPC} />
        <Route path="/deadlock" component={Deadlock} />
        <Route path="/analytics" component={Analytics} />
        <Route>
          <div className="flex items-center justify-center h-screen text-[#94A3B8]">404 — Not Found</div>
        </Route>
      </Switch>
    </Router>
  );
}
