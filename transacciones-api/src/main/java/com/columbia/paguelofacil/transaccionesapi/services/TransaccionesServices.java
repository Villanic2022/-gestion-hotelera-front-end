package services;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Optional;

@Service
public class TransaccionesServices {

    private final WebClient webClient;

    public TransaccionesServices(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://sandbox.paguelofacil.com").build();
    }

    public String obtenerTransacciones(
            String apiPath,
            String accessToken,
            String filter,
            String conditional,
            Integer limit,
            Integer offset,
            String sort,
            String field
    ) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(apiPath)
                        // Usa queryParamIfPresent o lógica similar para añadir los parámetros solo si no son null
                        .queryParamIfPresent("Filter", Optional.ofNullable(filter))
                        .queryParamIfPresent("Conditional", Optional.ofNullable(conditional))
                        .queryParamIfPresent("Limit", Optional.ofNullable(limit))
                        .queryParamIfPresent("Offset", Optional.ofNullable(offset))
                        .queryParamIfPresent("Sort", Optional.ofNullable(sort))
                        .queryParamIfPresent("Field", Optional.ofNullable(field))
                        .build())
                .header("Authorization", accessToken) // Usamos el token directamente como viene del controlador
                .retrieve()
                .bodyToMono(String.class)
                .block(); // Recuerda que .block() no es ideal en producción
    }
}