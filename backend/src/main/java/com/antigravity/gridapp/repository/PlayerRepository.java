package com.antigravity.gridapp.repository;

import com.antigravity.gridapp.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, String> {
    boolean existsByColor(String color);
}
