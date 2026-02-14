package com.antigravity.gridapp.config;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.concurrent.atomic.AtomicInteger;

@Component
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    public static final AtomicInteger activeUsers = new AtomicInteger(0);

    public WebSocketEventListener(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        int count = activeUsers.incrementAndGet();
        System.out.println("DEBUG: WebSocket Connected. Total active: " + count);
        broadcastActiveUsers(count);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        int count = activeUsers.decrementAndGet();
        System.out.println("DEBUG: WebSocket Disconnected. Total active: " + count);
        broadcastActiveUsers(count);
    }

    private void broadcastActiveUsers(int count) {
        messagingTemplate.convertAndSend("/topic/active-users", count);
    }
}
