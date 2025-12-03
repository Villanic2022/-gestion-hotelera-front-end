package com.miempresa.gestion_hotelera.service;

import com.miempresa.gestion_hotelera.dto.HabitacionRequest;
import com.miempresa.gestion_hotelera.dto.HabitacionResponse;
import com.miempresa.gestion_hotelera.entity.Habitacion;
import com.miempresa.gestion_hotelera.entity.Hotel;
import com.miempresa.gestion_hotelera.entity.TipoHabitacion;
import com.miempresa.gestion_hotelera.mapper.HabitacionMapper;
import com.miempresa.gestion_hotelera.repository.HabitacionRepository;
import com.miempresa.gestion_hotelera.repository.HotelRepository;
import com.miempresa.gestion_hotelera.repository.TipoHabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    private final HotelRepository hotelRepository;
    private final TipoHabitacionRepository tipoHabitacionRepository;
    private final HabitacionMapper mapper;

    public HabitacionResponse crear(HabitacionRequest request) {

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel no encontrado"));

        TipoHabitacion tipo = tipoHabitacionRepository.findById(request.getTipoHabitacionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de habitación no encontrado"));

        Habitacion entity = mapper.toEntity(request, hotel, tipo);

        Habitacion guardada = habitacionRepository.save(entity);

        return mapper.toResponse(guardada);
    }

    public List<HabitacionResponse> listar() {
        return habitacionRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public HabitacionResponse obtener(Long id) {
        Habitacion entity = habitacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habitación no encontrada"));

        return mapper.toResponse(entity);
    }

    public HabitacionResponse actualizar(Long id, HabitacionRequest request) {

        Habitacion entity = habitacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habitación no encontrada"));

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel no encontrado"));

        TipoHabitacion tipo = tipoHabitacionRepository.findById(request.getTipoHabitacionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de habitación no encontrado"));

        entity.setHotel(hotel);
        entity.setTipoHabitacion(tipo);
        entity.setCodigo(request.getCodigo());
        entity.setPiso(request.getPiso());
        entity.setEstado(request.getEstado());
        entity.setActivo(request.getActivo());

        Habitacion guardada = habitacionRepository.save(entity);

        return mapper.toResponse(guardada);
    }

    public void eliminar(Long id) {
        if (!habitacionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Habitación no encontrada");
        }
        habitacionRepository.deleteById(id);
    }
}
