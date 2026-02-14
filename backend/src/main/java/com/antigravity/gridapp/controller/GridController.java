package com.antigravity.gridapp.controller;

import com.antigravity.gridapp.model.Block;
import com.antigravity.gridapp.service.GridService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/grid")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }) // Allow Vite frontend
public class GridController {

    private final GridService gridService;

    @Autowired
    public GridController(GridService gridService) {
        this.gridService = gridService;
    }

    @GetMapping
    public List<Block> getGrid() {
        System.out.println("DEBUG: GET /api/grid called");
        return gridService.getAllBlocks();
    }

    @org.springframework.web.bind.annotation.PostMapping("/profile")
    public org.springframework.http.ResponseEntity<?> updateProfile(
            @org.springframework.web.bind.annotation.RequestBody com.antigravity.gridapp.dto.ProfileUpdateRequest request) {
        try {
            List<Block> updatedBlocks = gridService.updateProfile(request.getOldName(), request.getNewName(),
                    request.getNewColor());
            return org.springframework.http.ResponseEntity.ok(updatedBlocks);
        } catch (IllegalArgumentException e) {
            return org.springframework.http.ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.PostMapping("/capture")
    public Block captureBlock(
            @org.springframework.web.bind.annotation.RequestBody com.antigravity.gridapp.dto.CaptureRequest request) {
        System.out.println("DEBUG: REST Received capture request: " + request);
        return gridService.captureBlock(request.getX(), request.getY(), request.getOwnerName(), request.getColor());
    }

    @GetMapping("/active-users")
    public int getActiveUsers() {
        return com.antigravity.gridapp.config.WebSocketEventListener.activeUsers.get();
    }
}
