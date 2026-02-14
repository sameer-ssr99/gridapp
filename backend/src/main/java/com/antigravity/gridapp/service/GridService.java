package com.antigravity.gridapp.service;

import com.antigravity.gridapp.model.Block;
import com.antigravity.gridapp.model.Player;
import com.antigravity.gridapp.repository.BlockRepository;
import com.antigravity.gridapp.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.antigravity.gridapp.dto.ProfileUpdateDTO;
import com.antigravity.gridapp.dto.LeaderboardEntry;

@Service
public class GridService {

    private final BlockRepository blockRepository;
    private final PlayerRepository playerRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final int COOLDOWN_SECONDS = 3;

    public GridService(BlockRepository blockRepository, PlayerRepository playerRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.blockRepository = blockRepository;
        this.playerRepository = playerRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Block> getAllBlocks() {
        return blockRepository.findAll();
    }

    public List<LeaderboardEntry> getLeaderboard() {
        return blockRepository.findAll().stream()
                .filter(b -> b.getOwnerName() != null)
                .collect(Collectors.groupingBy(Block::getOwnerName, Collectors.counting()))
                .entrySet().stream()
                .map(entry -> {
                    String color = playerRepository.findById(entry.getKey()).map(Player::getColor).orElse("#ffffff");
                    return new LeaderboardEntry(entry.getKey(), entry.getValue(), color);
                })
                .sorted((a, b) -> Long.compare(b.getBlockCount(), a.getBlockCount()))
                .limit(10)
                .collect(Collectors.toList());
    }

    @Transactional
    public Block captureBlock(int x, int y, String ownerName, String color) {
        if (x < 0 || x >= 10 || y < 0 || y >= 10) {
            System.out.println("DEBUG: Coordinate OUT OF RANGE: " + x + "," + y);
        }
        Optional<Block> optionalBlock = blockRepository.findByXAndY(x, y);
        if (optionalBlock.isPresent()) {
            Block block = optionalBlock.get();
            System.out.println("DEBUG: Found block. Current owner: " + block.getOwnerName());

            // 1. Fetch Player
            Optional<Player> playerOpt = playerRepository.findById(ownerName);
            Player player;
            if (playerOpt.isPresent()) {
                player = playerOpt.get();
            } else {
                player = new Player(ownerName, color);
                System.out.println("DEBUG: Created new player: " + ownerName);
            }

            // 2. Anti-Stealing & Unown Logic
            if (block.getOwnerName() != null) {
                if (block.getOwnerName().equals(ownerName)) {
                    // ALWAYS allow unowning your own block
                    System.out.println("DEBUG: Unowning block for " + ownerName);
                    block.setOwnerName(null);
                    block.setColor("#1a1a2e");
                } else {
                    System.out.println("DEBUG: Rejection - Block owned by " + block.getOwnerName());
                    return block; // Stealing attempt rejected
                }
            } else {
                // 3. Capture logic - Check Cooldown
                if (player.getLastCaptureAt() != null) {
                    if (player.getLastCaptureAt().plusSeconds(COOLDOWN_SECONDS).isAfter(LocalDateTime.now())) {
                        System.out.println("DEBUG: Player on cooldown until "
                                + player.getLastCaptureAt().plusSeconds(COOLDOWN_SECONDS));
                        return block; // Still on cooldown
                    }
                }

                System.out.println("DEBUG: Proceeding with capture.");
                block.setOwnerName(ownerName);
                block.setColor(player.getColor());
                player.setLastCaptureAt(LocalDateTime.now());
                playerRepository.save(player);
            }

            Block saved = blockRepository.save(block);
            messagingTemplate.convertAndSend("/topic/updates", saved);
            broadcastLeaderboard();
            System.out.println("DEBUG: Broadcasted update for " + x + "," + y);
            return saved;
        } else {
            System.out.println("DEBUG: Block NOT FOUND at " + x + "," + y);
            throw new RuntimeException("Block not found at " + x + "," + y);
        }
    }

    public void broadcastLeaderboard() {
        messagingTemplate.convertAndSend("/topic/leaderboard", getLeaderboard());
    }

    @Transactional
    public List<Block> updateProfile(String oldName, String newName, String newColor) {
        // 1. Validate Color Uniqueness
        Optional<Player> oldPlayerOpt = playerRepository.findById(oldName);
        boolean isSameColor = oldPlayerOpt.map(p -> p.getColor().equals(newColor)).orElse(false);

        if (!isSameColor && playerRepository.existsByColor(newColor)) {
            throw new IllegalArgumentException("Color " + newColor + " is already taken.");
        }

        // 2. Update or Create Player
        if (oldPlayerOpt.isPresent()) {
            Player player = oldPlayerOpt.get();
            if (!oldName.equals(newName)) {
                playerRepository.delete(player);
                Player newPlayer = new Player(newName, newColor);
                newPlayer.setLastCaptureAt(player.getLastCaptureAt());
                playerRepository.save(newPlayer);
            } else {
                player.setColor(newColor);
                playerRepository.save(player);
            }
        } else {
            playerRepository.save(new Player(newName, newColor));
        }

        // 3. Bulk Update Blocks & Broadcast
        List<Block> ownedBlocks = blockRepository.findByOwnerName(oldName);
        for (Block block : ownedBlocks) {
            block.setOwnerName(newName);
            block.setColor(newColor);
            blockRepository.save(block);
        }

        messagingTemplate.convertAndSend("/topic/profile-updates", new ProfileUpdateDTO(oldName, newName, newColor));
        broadcastLeaderboard();

        return ownedBlocks;
    }
}
