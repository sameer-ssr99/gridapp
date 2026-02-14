import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import Grid from './components/Grid';
import Leaderboard from './components/Leaderboard';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [blocks, setBlocks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const [username, setUsername] = useState(() => sessionStorage.getItem('grid_username') || `User-${Math.floor(Math.random() * 900) + 100}`);
  const [color, setColor] = useState(() => sessionStorage.getItem('grid_color') || generateRandomColor());
  const [showConfig, setShowConfig] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('grid_username', username);
    sessionStorage.setItem('grid_color', color);
  }, [username, color]);

  const handleSaveProfile = () => {
    axios.post('/api/grid/profile', {
      oldName: sessionStorage.getItem('grid_username_synced') || username,
      newName: username,
      newColor: color
    })
      .then(() => {
        console.log("Profile saved successfully");
        sessionStorage.setItem('grid_username_synced', username);
        setShowConfig(false);
      })
      .catch(err => console.error("Save profile error:", err));
  };

  useEffect(() => {
    if (!sessionStorage.getItem('grid_username_synced')) {
      sessionStorage.setItem('grid_username_synced', username);
    }
  }, []);

  useEffect(() => {
    axios.get('/api/grid')
      .then(response => {
        console.log("Fetched blocks:", response.data.length);
        setBlocks(response.data);
      })
      .catch(error => {
        console.error("Error fetching grid:", error);
        alert("Failed to connect to backend server. Make sure it is running at 127.0.0.1:8080");
      });

    axios.get('/api/grid/active-users')
      .then(res => setActiveUsers(res.data))
      .catch(err => console.error("Error fetching active users:", err));

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const client = new Client({
      brokerURL: `${protocol}//${window.location.host}/ws`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      onConnect: () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);

        // Fetch current active users as soon as we connect
        axios.get('/api/grid/active-users')
          .then(res => setActiveUsers(res.data))
          .catch(err => console.error("Active users fetch error:", err));

        client.subscribe('/topic/updates', (msg) => {
          const updated = JSON.parse(msg.body);
          setBlocks(prev => {
            const idx = prev.findIndex(b => b.x === updated.x && b.y === updated.y);
            if (idx !== -1) {
              const next = [...prev];
              next[idx] = updated;
              return next;
            }
            return [...prev, updated];
          });
        });

        client.subscribe('/topic/leaderboard', (msg) => setLeaderboard(JSON.parse(msg.body)));
        client.subscribe('/topic/active-users', (msg) => {
          console.log("Active users update received:", msg.body);
          setActiveUsers(JSON.parse(msg.body));
        });

        client.subscribe('/topic/profile-updates', (msg) => {
          const { oldName, newName, newColor } = JSON.parse(msg.body);
          setBlocks(prev => prev.map(b => b.ownerName === oldName ? { ...b, ownerName: newName, color: newColor } : b));
        });

        // Test publish
        client.publish({ destination: '/app/ping', body: 'ping' });
      },
      onDisconnect: () => {
        console.warn("Disconnected from WebSocket");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket Error:', event);
      }
    });

    client.activate();
    stompClientRef.current = client;
    return () => client.deactivate();
  }, []);

  useEffect(() => {
    if (cooldownEndsAt > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000));
        setTimeLeft(remaining);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [cooldownEndsAt]);

  const handleBlockClick = React.useCallback((x, y) => {
    console.log(`Grid Click Event: ${x},${y}`);
    const block = blocks.find(b => b.x === x && b.y === y);

    if (block?.ownerName && block.ownerName !== username) {
      console.warn("Block owned by someone else:", block.ownerName);
      return;
    }

    if (Date.now() < cooldownEndsAt && (block?.ownerName === null || block?.ownerName === undefined)) {
      console.warn("On cooldown, can't capture new block");
      return;
    }

    if (block?.ownerName === null || block?.ownerName === undefined) {
      setCooldownEndsAt(Date.now() + 3000); // 3s cooldown
    }

    const payload = { x, y, ownerName: username, color };

    // Use REST for capture as it's more reliable for sending data, 
    // the backend will broadcast the result via WebSocket
    console.log("Sending capture request:", payload);
    axios.post('/api/grid/capture', payload)
      .then(response => {
        console.log("Capture result:", response.data);
      })
      .catch(err => {
        console.error("Capture error:", err);
      });
  }, [blocks, username, color, cooldownEndsAt]);

  const myCount = useMemo(() => blocks.filter(b => b.ownerName === username).length, [blocks, username]);

  return (
    <div className="h-screen w-screen bg-[#0d0221] text-white overflow-hidden flex relative font-sans">

      {/* Sidebar */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-4 pointer-events-none w-80">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass-panel p-6 rounded-3xl pointer-events-auto shadow-2xl border-white/10"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              GRID.IO
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{activeUsers} Online</span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-red-500'}`} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl cursor-pointer transition-transform hover:scale-110 shadow-lg"
                  style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}40` }}
                  onClick={() => setShowConfig(!showConfig)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Commander</div>
                  <div className="text-lg font-black truncate">{username}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Blocks Controlled</span>
              <span className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">{myCount}</span>
            </div>

            {timeLeft > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
                <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Cooldown</div>
                <div className="text-xl font-black text-red-500">{timeLeft}s</div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-white/10 space-y-4 overflow-hidden"
              >
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 block mb-2">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-cyan-400 transition-colors"
                    maxLength={15}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/40 block mb-2">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 p-0 border-0 rounded-xl cursor-pointer bg-transparent"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="w-full bg-cyan-500 text-black font-black py-3 rounded-xl hover:bg-cyan-400 transition-all uppercase text-xs tracking-widest"
                >
                  Apply Changes
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <Leaderboard players={leaderboard} />
      </div>

      {/* Grid Area */}
      <div className="flex-1 h-full relative">
        <Grid blocks={blocks} onBlockClick={handleBlockClick} />
      </div>

      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent_70%)]" />
    </div>
  );
}

export default App;
