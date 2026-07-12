package com.norbertfila.hexa.service.importing;

import com.norbertfila.hexa.config.importing.AccidentImportProperties;
import com.norbertfila.hexa.dto.importing.ImportSummary;
import java.io.IOException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AccidentImportRunner implements ApplicationRunner {

    private final AccidentImportProperties properties;
    private final AccidentImportService importService;
    private final ConfigurableApplicationContext applicationContext;

    public AccidentImportRunner(
        AccidentImportProperties properties,
        AccidentImportService importService,
        ConfigurableApplicationContext applicationContext
    ) {
        this.properties = properties;
        this.importService = importService;
        this.applicationContext = applicationContext;
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        if (!properties.enabled()) {
            return;
        }

        String command = properties.command();
        if (command == null || command.isBlank()) {
            throw new IllegalStateException("Import is enabled but app.import.command is missing.");
        }

        switch (command) {
            case "import-all", "import-year" -> {
                List<Integer> years = resolveYears();
                log.info("Starting import command '{}' for years {}", command, years);
                for (Integer year : years) {
                    log.info("Importing year {}", year);
                    logSummary(importService.importYear(year));
                }
                log.info("Import command '{}' finished. Shutting down application.", command);
                SpringApplication.exit(applicationContext, () -> 0);
            }
            default -> throw new IllegalStateException("Unsupported import command: " + command);
        }
    }

    private List<Integer> resolveYears() {
        List<Integer> years = properties.years();
        if (years == null || years.isEmpty()) {
            throw new IllegalStateException("app.import.years must contain at least one year.");
        }
        return years;
    }

    private void logSummary(ImportSummary summary) {
        log.info(
            "Imported year {}: accidents={}, participants={}, victims={}, fatal={}, serious={}, light={}, uninjured={}",
            summary.year(),
            summary.accidents(),
            summary.participants(),
            summary.victims(),
            summary.fatalVictims(),
            summary.seriousVictims(),
            summary.lightVictims(),
            summary.uninjuredVictims()
        );
    }
}
