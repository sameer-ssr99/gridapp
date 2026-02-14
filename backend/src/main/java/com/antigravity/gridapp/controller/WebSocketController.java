package com.antigravity.gridapp.controller;

import com.antigravity.gridapp.model.Block;
import com.antigravity.gridapp.service.GridService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final GridService gridService;

    @Autowired
    public WebSocketController(GridService gridService) {
        this.gridService = gridService;
    }

    @MessageMapping("/capture")
    @SendTo("/topic/updates")
    public Block handleCapture(String payload) {
        System.out.println("DEBUG: WS Received raw payload: " + payload);
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.antigravity.gridapp.dto.CaptureRequest request = mapper.readValue(payload,
                    com.antigravity.gridapp.dto.CaptureRequest.class);
            return gridService.captureBlock(
                    request.getX(),
                    request.getY(),
                    request.getOwnerName(),
                    request.getColor());
        } catch (Exception e) {
            System.err.println("DEBUG: Deserialization failed: " + e.getMessage());
            return null;
        }
    }
}
