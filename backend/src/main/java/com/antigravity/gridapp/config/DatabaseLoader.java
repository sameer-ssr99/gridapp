package com.antigravity.gridapp.config;

import com.antigravity.gridapp.model.Block;
import com.antigravity.gridapp.repository.BlockRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseLoader {

    @Bean
    CommandLineRunner initDatabase(BlockRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                int gridSize = 10; // 10x10 grid
                for (int x = 0; x < gridSize; x++) {
                    for (int y = 0; y < gridSize; y++) {
                        repository.save(new Block(x, y));
                    }
                }
                System.out.println("Initialized grid with " + (gridSize * gridSize) + " blocks.");
            }
        };
    }
}
