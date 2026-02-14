package com.antigravity.gridapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "players")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Player {
    @Id
    private String username;
    private String color;
    private LocalDateTime lastCaptureAt;

    public Player(String username, String color) {
        this.username = username;
        this.color = color;
    }
}
