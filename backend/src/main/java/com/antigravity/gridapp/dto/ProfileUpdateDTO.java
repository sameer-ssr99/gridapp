package com.antigravity.gridapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateDTO {
    private String oldName;
    private String newName;
    private String newColor;
}
