package com.miempresa.gestion_hotelera.service;

import com.miempresa.gestion_hotelera.dto.HuespedRequest;
import com.miempresa.gestion_hotelera.dto.HuespedResponse;
import com.miempresa.gestion_hotelera.entity.Huesped;
import com.miempresa.gestion_hotelera.mapper.HuespedMapper;
import com.miempresa.gestion_hotelera.repository.HuespedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HuespedService {

    private final HuespedRepository huespedRepository;
    private final HuespedMapper mapper;

    public HuespedResponse crear(HuespedRequest request) {
        Huesped entity = mapper.toEntity(request);
        entity.setCreadoEn(LocalDateTime.now());
        Huesped guardado = huespedRepository.save(entity);
        return mapper.toResponse(guardado);
    }

    public List<HuespedResponse> listar() {
        return huespedRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public HuespedResponse obtener(Long id) {
        Huesped entity = huespedRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Huésped no encontrado"));

        return mapper.toResponse(entity);
    }

    public HuespedResponse actualizar(Long id, HuespedRequest request) {
        Huesped entity = huespedRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Huésped no encontrado"));

        entity.setNombre(request.getNombre());
        entity.setApellido(request.getApellido());
        entity.setEmail(request.getEmail());
        entity.setTelefono(request.getTelefono());
        entity.setPais(request.getPais());
        entity.setTipoDocumento(request.getTipoDocumento());
        entity.setNumeroDocumento(request.getNumeroDocumento());
        entity.setNotas(request.getNotas());

        Huesped guardado = huespedRepository.save(entity);

        return mapper.toResponse(guardado);
    }

    public void eliminar(Long id) {
        if (!huespedRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Huésped no encontrado");
        }
        huespedRepository.deleteById(id);
    }
}
