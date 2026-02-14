package com.antigravity.gridapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "blocks", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "x", "y" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int x;
    private int y;

    private String color; // Hex code, e.g., "#FF5733"
    private String ownerName; // Username of the owner

    public Block(int x, int y) {
        this.x = x;
        this.y = y;
        this.color = "#1a1a2e"; // Default dark color (unclaimed)
        this.ownerName = null;
    }
}
