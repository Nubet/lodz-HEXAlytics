package com.norbertfila.hexa;

import com.norbertfila.hexa.config.importing.AccidentImportProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AccidentImportProperties.class)
public class HexaApplication {

	public static void main(String[] args) {
		SpringApplication.run(HexaApplication.class, args);
	}

}
