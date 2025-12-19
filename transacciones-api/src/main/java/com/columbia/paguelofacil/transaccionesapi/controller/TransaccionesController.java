package controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import services.TransaccionesServices;

@RestController
@RequestMapping("/api/v1/transacciones")
public class TransaccionesController {


    private final TransaccionesServices transaccionesServices;
    private static final Logger logger = LoggerFactory.getLogger(TransaccionesController.class);

    public TransaccionesController(TransaccionesServices transaccionesServices) {
        this.transaccionesServices = transaccionesServices;
        logger.info("TransaccionesController ha sido inicializado correctamente.");
    }

    @GetMapping("/MerchantTransactions")
    public ResponseEntity<String> consultarTransacciones(
            // El token de autenticación
            @RequestHeader(HttpHeaders.AUTHORIZATION) String accessToken,

            // Parámetros de consulta
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) String conditional,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String field) {

        // 1. Validar el token de acceso
        // NOTA: Es común que el token venga como "Bearer token-value", debes asegurarte de enviarlo completo.
        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Access token is required");
        }

        // 2. Definir el PATH de la API de PagueloFácil
        // La URL base (https://sandbox.paguelofacil.com) ya está en el WebClient
        String apiPath = "/PFManagementServices/api/v1/MerchantTransactions";

        // 3. Llamar al servicio, pasando el path y TODOS los parámetros de consulta
        String response = transaccionesServices.obtenerTransacciones(
                apiPath,
                accessToken,
                filter,
                conditional,
                limit,
                offset,
                sort,
                field
        );

        return ResponseEntity.ok(response);
    }
}