"use client";
import { useState } from "react";
import "./reception_style.css";

export default function ReceptionPortal() {
  const [activeTab, setActiveTab] = useState("A");

  // --- DRILL-DOWN STATES ---
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // --- MOCK DATA ---
  const followUpData = [
    { id: 1, name: "Rahul Sharma", phone: "9876543210", reason: "Membership Expiring" },
    { id: 2, name: "Sneha Gupta", phone: "9876500000", reason: "Trial Completed" },
    { id: 3, name: "Amit Verma", phone: "9988776655", reason: "Inconsistency (<40%)" },
    { id: 4, name: "Priya Singh", phone: "9123456789", reason: "Upgrade Plan" },
    { id: 5, name: "Arjun Rampal", phone: "8123456780", reason: "Trial Completed" },
  ];

  const trainersData = [
    { id: 101, name: "Vikram Singh", phone: "8888888888", rating: 9.2 },
    { id: 102, name: "Anjali Mehta", phone: "7777777777", rating: 8.5 },
    { id: 103, name: "Rohan Das", phone: "6666666666", rating: 9.8 },
  ];

  const trainerClients: Record<number, any[]> = {
    101: [{ id: 1, name: "Client A", phone: "111-111", plan: "Gold" }, { id: 2, name: "Client B", phone: "222-222", plan: "Regular" }],
    102: [{ id: 3, name: "Client C", phone: "333-333", plan: "Platinum" }],
    103: [],
  };

  const tiersData = [
    { id: "reg", name: "Regular", basePrice: 1500 },
    { id: "gold", name: "Gold", basePrice: 2500 },
    { id: "plat", name: "Platinum", basePrice: 4000 },
  ];

  const timeSlotsData = [
    { id: "s1", time: "5 AM - 7 AM", duration: "1 Month", price: "Base Price" },
    { id: "s2", time: "7 AM - 9 AM", duration: "3 Months", price: "Base + 10%" },
  ];

  const slotClientsData = [
    { id: 901, name: "Karan Johar", phone: "999-000-1234" },
    { id: 902, name: "Manish Malhotra", phone: "888-000-5678" },
  ];

  const receptionAttendance = {
    percentage: 92,
    shiftsAttended: 24,
    shiftsScheduled: 26,
    messages: [
      "Submit monthly sales report by Friday.",
      "Server maintenance scheduled for Sunday 2 AM."
    ]
  };

  // --- RENDER FUNCTIONS ---
  
  const renderTabA = () => (
    <div className="fade-in">
      <h2 className="page-title">Follow Up List</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {followUpData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>
                  <span className={`badge ${item.reason.includes("Expiring") ? "badge-red" : item.reason.includes("Trial") ? "badge-green" : "badge-yellow"}`}>
                    {item.reason}
                  </span>
                </td>
                <td><button className="btn-action">Call</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabB = () => (
    <div className="fade-in">
      <h2 className="page-title">Trainer List</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {trainersData.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.phone}</td>
                <td><strong>{t.rating}</strong> / 10</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabC = () => {
    if (selectedTrainer) {
      const clients = trainerClients[selectedTrainer.id] || [];
      return (
        <div className="fade-in">
          <button className="btn-action btn-back" onClick={() => setSelectedTrainer(null)}>← Back</button>
          <h2 className="page-title">Clients: {selectedTrainer.name}</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Client Name</th><th>Phone</th><th>Plan</th></tr>
              </thead>
              <tbody>
                {clients.length > 0 ? clients.map((c) => (
                  <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.plan}</td></tr>
                )) : <tr><td colSpan={3}>No clients assigned</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return (
      <div className="fade-in">
        <h2 className="page-title">Trainer Allocations</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Trainer</th><th>Phone</th><th>Rating</th><th>Action</th></tr>
            </thead>
            <tbody>
              {trainersData.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td><td>{t.phone}</td><td>{t.rating}</td>
                  <td><button className="btn-action" onClick={() => setSelectedTrainer(t)}>View Clients</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTabD = () => {
    if (selectedSlot) {
      return (
        <div className="fade-in">
          <button className="btn-action btn-back" onClick={() => setSelectedSlot(null)}>← Back</button>
          <h2 className="page-title">Clients in {selectedSlot.time}</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Phone</th></tr></thead>
              <tbody>
                {slotClientsData.map((c) => (
                  <tr key={c.id}><td>#{c.id}</td><td>{c.name}</td><td>{c.phone}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (selectedTier) {
      return (
        <div className="fade-in">
          <button className="btn-action btn-back" onClick={() => setSelectedTier(null)}>← Back</button>
          <h2 className="page-title">{selectedTier.name} Slots</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Time</th><th>Duration</th><th>Price</th><th>Action</th></tr></thead>
              <tbody>
                {timeSlotsData.map((s) => (
                  <tr key={s.id}>
                    <td>{s.time}</td><td>{s.duration}</td><td>{s.price}</td>
                    <td><button className="btn-action" onClick={() => setSelectedSlot(s)}>View Clients</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return (
      <div className="fade-in">
        <h2 className="page-title">Membership Tiers</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>Tier Name</th><th>Base Price</th><th>Action</th></tr></thead>
            <tbody>
              {tiersData.map((tier) => (
                <tr key={tier.id}>
                  <td style={{fontWeight: 'bold', color: tier.name === 'Gold' ? 'var(--mnc-gold)' : 'inherit'}}>{tier.name}</td>
                  <td>₹{tier.basePrice}</td>
                  <td><button className="btn-action" onClick={() => setSelectedTier(tier)}>View Time Slots</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTabE = () => (
    <div className="fade-in">
      <h2 className="page-title">My Attendance</h2>
      <div className="stat-card">
        <h3>Attendance Score</h3>
        <div className="stat-big">{receptionAttendance.percentage}%</div>
        <p>Attended <strong>{receptionAttendance.shiftsAttended}</strong> / {receptionAttendance.shiftsScheduled} shifts.</p>
      </div>
      <div className="stat-card" style={{borderLeftColor: 'var(--status-blue)'}}>
        <h3>Important Messages</h3>
        <ul style={{marginTop: '10px', paddingLeft: '15px'}}>
          {receptionAttendance.messages.map((msg, i) => <li key={i} style={{marginBottom:'5px'}}>{msg}</li>)}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      
      {/* 1. RESPONSIVE SIDEBAR / BOTTOM NAV */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          ICONIC <span>PORTAL</span>
        </div>
        <div className="nav-menu">
          <button className={`nav-btn ${activeTab === 'A' ? 'active' : ''}`} onClick={() => setActiveTab('A')}>
            Follow Up
          </button>
          <button className={`nav-btn ${activeTab === 'B' ? 'active' : ''}`} onClick={() => setActiveTab('B')}>
            Trainers
          </button>
          <button className={`nav-btn ${activeTab === 'C' ? 'active' : ''}`} onClick={() => setActiveTab('C')}>
            Allocations
          </button>
          <button className={`nav-btn ${activeTab === 'D' ? 'active' : ''}`} onClick={() => setActiveTab('D')}>
            Plans
          </button>
          <button className={`nav-btn ${activeTab === 'E' ? 'active' : ''}`} onClick={() => setActiveTab('E')}>
            My Info
          </button>
        </div>
      </nav>

      {/* 2. MAIN WRAPPER */}
      <div className="main-wrapper">
        
        {/* HEADER */}
        <header className="top-header">
          <div className="header-left">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2964/2964514.png" 
              alt="Gym Logo" 
              className="gym-logo" 
            />
            <span className="gym-title">Iconic Gym Karnal</span>
          </div>
          <div className="header-right">
            <button className="btn-header">Attendance</button>
            <button className="btn-header btn-logout">Logout</button>
          </div>
        </header>

        {/* CONTENT AREA */}
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