package com.miempresa.gestion_hotelera.service;

import com.miempresa.gestion_hotelera.dto.TipoHabitacionRequest;
import com.miempresa.gestion_hotelera.dto.TipoHabitacionResponse;
import com.miempresa.gestion_hotelera.entity.Hotel;
import com.miempresa.gestion_hotelera.entity.TipoHabitacion;
import com.miempresa.gestion_hotelera.mapper.TipoHabitacionMapper;
import com.miempresa.gestion_hotelera.repository.HotelRepository;
import com.miempresa.gestion_hotelera.repository.TipoHabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoHabitacionService {

    private final TipoHabitacionRepository tipoHabitacionRepository;
    private final HotelRepository hotelRepository;
    private final TipoHabitacionMapper mapper;

    public TipoHabitacionResponse crear(TipoHabitacionRequest request) {

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel no encontrado"));

        TipoHabitacion entity = mapper.toEntity(request, hotel);

        TipoHabitacion guardado = tipoHabitacionRepository.save(entity);

        return mapper.toResponse(guardado);
    }

    public List<TipoHabitacionResponse> listar() {
        return tipoHabitacionRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public TipoHabitacionResponse obtener(Long id) {
        TipoHabitacion entity = tipoHabitacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de habitación no encontrado"));

        return mapper.toResponse(entity);
    }

    public TipoHabitacionResponse actualizar(Long id, TipoHabitacionRequest request) {

        TipoHabitacion entity = tipoHabitacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de habitación no encontrado"));

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel no encontrado"));


        entity.setHotel(hotel);
        entity.setNombre(request.getNombre());
        entity.setDescripcion(request.getDescripcion());
        entity.setCapacidadBase(request.getCapacidadBase());
        entity.setCapacidadMax(request.getCapacidadMax());
        entity.setActivo(request.getActivo());

        TipoHabitacion guardado = tipoHabitacionRepository.save(entity);
        return mapper.toResponse(guardado);
    }

    public void eliminar(Long id) {
        if (!tipoHabitacionRepository.existsById(id)) {
            throw new RuntimeException("Tipo de habitación no encontrado");
        }
        tipoHabitacionRepository.deleteById(id);
    }
}