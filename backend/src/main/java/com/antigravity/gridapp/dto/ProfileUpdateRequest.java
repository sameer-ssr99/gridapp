package com.antigravity.gridapp.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String oldName;
    private String newName;
    private String newColor;
}
