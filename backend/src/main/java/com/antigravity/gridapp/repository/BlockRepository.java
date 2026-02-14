package com.antigravity.gridapp.repository;

import com.antigravity.gridapp.model.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlockRepository extends JpaRepository<Block, Long> {
    Optional<Block> findByXAndY(int x, int y);

    java.util.List<Block> findByOwnerName(String ownerName);
}
