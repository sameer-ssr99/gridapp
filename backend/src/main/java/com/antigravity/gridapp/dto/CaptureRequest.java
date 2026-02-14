package com.antigravity.gridapp.dto;

import lombok.Data;

@Data
public class CaptureRequest {
    private int x;
    private int y;
    private String ownerName;
    private String color;
}
