package com.miempresa.gestion_hotelera.service;

import com.miempresa.gestion_hotelera.dto.HotelRequest;
import com.miempresa.gestion_hotelera.dto.HotelResponse;
import com.miempresa.gestion_hotelera.entity.Hotel;
import com.miempresa.gestion_hotelera.mapper.HotelMapper;
import com.miempresa.gestion_hotelera.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final HotelMapper hotelMapper;

    // CREATE
    public HotelResponse crear(HotelRequest request) {
        Hotel hotel = hotelMapper.toEntity(request);
        Hotel guardado = hotelRepository.save(hotel);
        return hotelMapper.toResponse(guardado);
    }

    // READ (all)
    public List<HotelResponse> listar() {
        return hotelRepository.findAll()
                .stream()
                .map(hotelMapper::toResponse)
                .collect(Collectors.toList());
    }

    // READ (by ID)
    public HotelResponse obtenerPorId(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel no encontrado"));
        return hotelMapper.toResponse(hotel);
    }

    // UPDATE
    public HotelResponse actualizar(Long id, HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel no encontrado"));

        hotel.setNombre(request.getNombre());
        hotel.setDireccion(request.getDireccion());
        hotel.setCiudad(request.getCiudad());
        hotel.setPais(request.getPais());
        hotel.setTelefono(request.getTelefono());
        hotel.setEmail(request.getEmail());
        hotel.setActivo(request.getActivo());

        Hotel guardado = hotelRepository.save(hotel);
        return hotelMapper.toResponse(guardado);
    }

    // DELETE
    public void eliminar(Long id) {
        if (!hotelRepository.existsById(id)) {
            throw new RuntimeException("Hotel no encontrado");
        }
        hotelRepository.deleteById(id);
    }
}
