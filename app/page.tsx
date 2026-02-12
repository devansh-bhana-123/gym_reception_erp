"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase"; 
import { collection, getDocs, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./reception_style.css"; 

export default function ReceptionPortal() {
  const router = useRouter();

  // --- 1. AUTHENTICATION STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  // --- 2. DASHBOARD STATES ---
  const [activeTab, setActiveTab] = useState("A");
  const [loading, setLoading] = useState(true);

  // --- REAL DATA STATES ---
  const [followUpList, setFollowUpList] = useState<any[]>([]);
  const [trainersList, setTrainersList] = useState<any[]>([]);
  const [allocationsList, setAllocationsList] = useState<any[]>([]); // <--- NEW STATE FOR TAB C

  // --- 3. LOGIN LOGIC ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (creds.username === "receptionist" && creds.password === "admin1234") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid Username or Password");
    }
  };

  // --- 4. FETCH REAL DATA ---
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        // A. FETCH MEMBERS (Users Collection)
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);

        const loadedMembers: any[] = [];
        const loadedAllocations: any[] = []; // <--- Temp array for Allocations

        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          
          if (data.role === 'member') {
            // --- 1. FOLLOW UP LOGIC (Existing) ---
            let reason = null;
            let attendancePct = 0;
            let daysSinceJoining = 0;
            let expectedSessions = 2;

            if (data.createdAt) {
              let joinDate: Date | null = null;
              if (data.createdAt?.toDate) joinDate = data.createdAt.toDate();
              else if (typeof data.createdAt === "string") joinDate = new Date(data.createdAt);

              if (joinDate) {
                const diffTime = Math.abs(new Date().getTime() - joinDate.getTime());
                daysSinceJoining = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                expectedSessions = Math.max(daysSinceJoining * 2, 2); 
              }
            }
            const actualAttended = data.attendance?.attended || 0;
            if (expectedSessions > 0) attendancePct = Math.round((actualAttended / expectedSessions) * 100);

            if (daysSinceJoining > 2 && attendancePct < 40) reason = `Low Attendance (${attendancePct}%)`;
            const daysLeft = data.plan?.daysLeft || 0;
            if (daysLeft > 0 && daysLeft <= 5) reason = "Membership Expiring";
            if (data.plan?.name === "Trial" && daysLeft === 0) reason = "Trial Completed";

            if (reason) {
              loadedMembers.push({
                id: doc.id,
                name: data.name,
                phone: data.phone,
                reason: reason,
                stats: `${actualAttended}/${expectedSessions} Sessions`
              });
            }

            // --- 2. ALLOCATION LOGIC (NEW) ---
            // We check the 'assignedTrainer' map from your screenshot
            loadedAllocations.push({
              id: doc.id,
              memberName: data.name || "Unknown Member",
              memberPhone: data.phone || "No Phone",
              // If assignedTrainer exists, use its 'name', otherwise 'Unassigned'
              trainerName: data.assignedTrainer?.name || "Unassigned", 
              trainerEmail: data.assignedTrainer?.email || ""
            });
          }
        });

        setFollowUpList(loadedMembers);
        setAllocationsList(loadedAllocations); // <--- SAVE TO STATE

        // B. FETCH TRAINERS (Trainers Collection)
        const trainersQuery = query(collection(db, "trainers"));
        const trainersSnapshot = await getDocs(trainersQuery);
        const loadedTrainers: any[] = [];
        
        trainersSnapshot.forEach((doc) => {
          const data = doc.data();
          loadedTrainers.push({
            id: doc.id,
            name: data.name || "Unknown",
            phone: data.phone || "No Phone",
            role: data.role || "Trainer"
          });
        });
        setTrainersList(loadedTrainers);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]); 

  // --- ACTIONS ---
  const handleCall = (phone: string) => { window.location.href = `tel:${phone}`; };
  const handleLogout = async () => { window.location.reload(); };

  // --- RENDER FUNCTIONS ---
  
  const renderTabA = () => (
    <div className="fade-in">
      <h2 className="page-title">Follow Up List</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Reason</th><th>Stats</th><th>Action</th></tr></thead>
          <tbody>
            {followUpList.length > 0 ? followUpList.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td><span className={`badge ${item.reason.includes("Expiring") ? "badge-red" : "badge-yellow"}`}>{item.reason}</span></td>
                <td style={{fontSize:'0.85rem', color:'#aaa'}}>{item.stats}</td>
                <td><button className="btn-action" onClick={() => handleCall(item.phone)}>Call</button></td>
              </tr>
            )) : <tr><td colSpan={5} style={{textAlign:'center'}}>All clear!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabB = () => (
    <div className="fade-in">
      <h2 className="page-title">Active Trainers</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Role</th></tr></thead>
          <tbody>
            {trainersList.map((t) => (
              <tr key={t.id}><td>{t.name}</td><td>{t.phone}</td><td>{t.role}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- NEW: RENDER TAB C (ALLOCATIONS) ---
  const renderTabC = () => (
    <div className="fade-in">
      <h2 className="page-title">Member Allocations</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Phone</th>
              <th>Assigned Trainer</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allocationsList.map((item) => (
              <tr key={item.id}>
                <td style={{fontWeight:'bold'}}>{item.memberName}</td>
                <td>{item.memberPhone}</td>
                <td>
                  {/* Color code based on assignment status */}
                  <span style={{ 
                    color: item.trainerName === "Unassigned" ? "var(--danger-red)" : "var(--success-green)",
                    fontWeight: 'bold'
                  }}>
                    {item.trainerName}
                  </span>
                </td>
                <td>
                  <button className="btn-action" style={{backgroundColor: '#333'}}>Edit</button>
                </td>
              </tr>
            ))}
            {allocationsList.length === 0 && <tr><td colSpan={4}>No members found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabD = () => <div className="fade-in"><h2>Plans Management (Coming Soon)</h2></div>;
  const renderTabE = () => <div className="fade-in"><h2 className="page-title">My Info</h2><div className="stat-card"><h3>Logged In</h3><p>User: receptionist</p></div></div>;

  // --- MAIN RENDER ---
  if (!isAuthenticated) return (
    <div className="login-wrapper" style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#1a1a2e", color: "white"}}>
      <div style={{background: "#16213e", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "400px", textAlign: "center"}}>
         <img src="https://cdn-icons-png.flaticon.com/512/2964/2964514.png" alt="Logo" style={{ width: "60px", marginBottom: "20px" }}/>
        <h2 style={{ marginBottom: "20px", color: "#fbbf24" }}>Reception Portal</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input type="text" placeholder="Username" value={creds.username} onChange={(e) => setCreds({...creds, username: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#0f3460", color: "white" }}/>
          <input type="password" placeholder="Password" value={creds.password} onChange={(e) => setCreds({...creds, password: e.target.value})} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#0f3460", color: "white" }}/>
          {error && <p style={{ color: "#ff4d4d", fontSize: "0.9rem" }}>{error}</p>}
          <button type="submit" style={{padding: "12px", background: "#fbbf24", color: "black", fontWeight: "bold", border: "none", borderRadius: "8px", cursor: "pointer"}}>Access Portal</button>
        </form>
      </div>
    </div>
  );

  if (loading) return <div className="dashboard-container" style={{color:'white', padding:'50px'}}>Loading Portal...</div>;

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="sidebar-brand">ICONIC <span>PORTAL</span></div>
        <div className="nav-menu">
          <button className={`nav-btn ${activeTab === 'A' ? 'active' : ''}`} onClick={() => setActiveTab('A')}>Follow Up</button>
          <button className={`nav-btn ${activeTab === 'B' ? 'active' : ''}`} onClick={() => setActiveTab('B')}>Trainers</button>
          <button className={`nav-btn ${activeTab === 'C' ? 'active' : ''}`} onClick={() => setActiveTab('C')}>Allocations</button>
          <button className={`nav-btn ${activeTab === 'D' ? 'active' : ''}`} onClick={() => setActiveTab('D')}>Plans</button>
          <button className={`nav-btn ${activeTab === 'E' ? 'active' : ''}`} onClick={() => setActiveTab('E')}>My Info</button>
        </div>
      </nav>

      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-left">
            <span className="gym-title">Iconic Gym Karnal</span>
          </div>
          <div className="header-right">
            <button className="btn-header btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="content-area">
          {activeTab === 'A' && renderTabA()}
          {activeTab === 'B' && renderTabB()}
          {activeTab === 'C' && renderTabC()}
          {activeTab === 'D' && renderTabD()}
          {activeTab === 'E' && renderTabE()}
        </main>
      </div>
    </div>
  );
}