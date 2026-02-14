package com.antigravity.gridapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardEntry {
    private String ownerName;
    private long blockCount;
    private String color;
}
