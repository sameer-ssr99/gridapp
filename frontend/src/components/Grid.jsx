import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const GRID_SIZE = 10;

const Grid = ({ blocks, onBlockClick }) => {
    // We expect 900 blocks for a 30x30 grid.
    // Ensure they are sorted for CSS Grid layout (y row then x col)
    const sortedBlocks = useMemo(() => {
        return [...blocks].sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });
    }, [blocks]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-xl overflow-hidden border border-white/10 glass-panel">
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
            >
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-fit !h-fit">
                    <div
                        className="grid gap-px p-4 bg-white/5"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(20px, 1fr))`,
                            width: `${GRID_SIZE * 25}px`,
                            height: `${GRID_SIZE * 25}px`
                        }}
                    >
                        {sortedBlocks.map((block) => (
                            <Block
                                key={`${block.x}-${block.y}`}
                                block={block}
                                onClick={() => onBlockClick(block.x, block.y)}
                            />
                        ))}
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

const Block = React.memo(({ block, onClick }) => {
    const isUnclaimed = block.color === "#1a1a2e";

    return (
        <motion.div
            layout
            animate={{
                backgroundColor: isUnclaimed ? "rgba(255, 255, 255, 0.03)" : block.color,
                borderColor: isUnclaimed ? "rgba(255, 255, 255, 0.1)" : block.color,
                boxShadow: isUnclaimed ? "none" : `0 0 15px ${block.color}, 0 0 30px ${block.color}80`
            }}
            transition={{ duration: 0.3 }}
            whileHover={{
                scale: 1.1,
                zIndex: 10,
                backgroundColor: isUnclaimed ? "rgba(255, 255, 255, 0.1)" : block.color,
                boxShadow: `0 0 20px ${isUnclaimed ? "rgba(255,255,255,0.4)" : block.color}`
            }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="w-full h-full cursor-pointer relative rounded-sm border transition-colors aspect-square"
            title={block.ownerName ? `Owned by ${block.ownerName}` : "Unclaimed"}
        >
            {/* Inner "shine" effect */}
            {!isUnclaimed && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none opacity-50" />
            )}
        </motion.div>
    );
}, (prev, next) => {
    return prev.block.color === next.block.color && prev.block.ownerName === next.block.ownerName;
});

export default Grid;
