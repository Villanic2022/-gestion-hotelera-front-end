package config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration // Le dice a Spring que esta clase define beans
public class WebClientConfig {

    @Bean // Este método crea y proporciona un objeto WebClient.Builder
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
