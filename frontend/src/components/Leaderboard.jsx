import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = ({ players }) => {
    if (!players || players.length === 0) return null;

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full"
        >
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                Top Controllers
            </h3>
            <div className="space-y-2">
                <AnimatePresence>
                    {players.map((player, index) => (
                        <motion.div
                            key={player.ownerName}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex justify-between items-center text-sm p-2 rounded-lg leaderboard-item bg-white/5 border border-white/5"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: player.color, boxShadow: `0 0 10px ${player.color}` }}
                                />
                                <span className="truncate font-bold text-white/80" title={player.ownerName}>
                                    {player.ownerName}
                                </span>
                            </div>
                            <span className="font-black text-white px-2 py-0.5 rounded bg-white/10 text-[10px]">
                                {player.blockCount}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Leaderboard;
