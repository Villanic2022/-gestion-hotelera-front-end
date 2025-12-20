package com.miempresa.gestion_hotelera.service;

import com.miempresa.gestion_hotelera.dto.DisponibilidadHotelResponse;
import com.miempresa.gestion_hotelera.dto.ReservaCreateRequest;
import com.miempresa.gestion_hotelera.dto.ReservaResponse;
import com.miempresa.gestion_hotelera.entity.*;
import com.miempresa.gestion_hotelera.mapper.ReservaMapper;
import com.miempresa.gestion_hotelera.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.miempresa.gestion_hotelera.mapper.HabitacionMapper;
import com.miempresa.gestion_hotelera.dto.HabitacionResponse;
import com.miempresa.gestion_hotelera.dto.PagoSeniaRequest;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HotelRepository hotelRepository;
    private final TipoHabitacionRepository tipoHabitacionRepository;
    private final HabitacionRepository habitacionRepository;
    private final HuespedRepository huespedRepository;
    private final ReservaHuespedRepository reservaHuespedRepository;
    private final ReservaMapper reservaMapper;
    private final HabitacionMapper habitacionMapper;
    private final PagoRepository pagoRepository;

    // ========= CREAR RESERVA =========
    public ReservaResponse crear(ReservaCreateRequest req) {

        if (req.getCheckIn() == null || req.getCheckOut() == null ||
                !req.getCheckIn().isBefore(req.getCheckOut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fechas de check-in/out inválidas");
        }

        Hotel hotel = hotelRepository.findById(req.getHotelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel no encontrado"));

        TipoHabitacion tipo = tipoHabitacionRepository.findById(req.getTipoHabitacionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de habitación no encontrado"));

        Habitacion habitacion = null;
        if (req.getHabitacionId() != null) {
            habitacion = habitacionRepository.findById(req.getHabitacionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habitación no encontrada"));

            // Verificar superposición
            List<String> estadosActivos = List.of(
                    EstadoReserva.PENDIENTE.name(),
                    EstadoReserva.CONFIRMADA.name(),
                    EstadoReserva.CHECKIN.name()
            );

            boolean existeSuperposicion = reservaRepository.existeSuperposicionReserva(
                    habitacion.getId(),
                    estadosActivos,
                    req.getCheckIn(),
                    req.getCheckOut()
            );
            if (existeSuperposicion) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "La habitación ya está reservada en ese rango");
            }
        }

        Huesped titular = huespedRepository.findById(req.getHuespedTitularId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Huésped titular no encontrado"));

        List<Huesped> acompanantes = req.getAcompanianteIds() == null
                ? List.of()
                : req.getAcompanianteIds().stream()
                .map(id -> huespedRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Huésped acompañante no encontrado: " + id)))
                .collect(Collectors.toList());

        Reserva reserva = reservaMapper.toEntity(req, hotel, tipo, habitacion);

        // Estado inicial por defecto
        if (reserva.getEstado() == null) {
            reserva.setEstado(EstadoReserva.CONFIRMADA);
        }

        reserva.setCreadoEn(LocalDateTime.now());
        reserva.setActualizadoEn(LocalDateTime.now());

        Reserva guardada = reservaRepository.save(reserva);

        // vincular huésped titular + acompañantes
        ReservaHuesped rhTitular = ReservaHuesped.builder()
                .reserva(guardada)
                .huesped(titular)
                .esTitular(true)
                .build();
        reservaHuespedRepository.save(rhTitular);

        for (Huesped acomp : acompanantes) {
            ReservaHuesped rh = ReservaHuesped.builder()
                    .reserva(guardada)
                    .huesped(acomp)
                    .esTitular(false)
                    .build();
            reservaHuespedRepository.save(rh);
        }

        List<Long> acompanianteIds = acompanantes.stream()
                .map(Huesped::getId)
                .collect(Collectors.toList());

        return reservaMapper.toResponse(guardada, titular.getId(), acompanianteIds);
    }

    // ========= LISTAR / OBTENER =========

    public List<ReservaResponse> listar() {
        return reservaRepository.findAll().stream()
                .map(reserva -> {
                    List<ReservaHuesped> vinculos = reservaHuespedRepository.findAll()
                            .stream()
                            .filter(rh -> rh.getReserva().getId().equals(reserva.getId()))
                            .collect(Collectors.toList());

                    Long titularId = vinculos.stream()
                            .filter(ReservaHuesped::getEsTitular)
                            .map(rh -> rh.getHuesped().getId())
                            .findFirst()
                            .orElse(null);

                    List<Long> acompIds = vinculos.stream()
                            .filter(rh -> Boolean.FALSE.equals(rh.getEsTitular()))
                            .map(rh -> rh.getHuesped().getId())
                            .collect(Collectors.toList());

                    return reservaMapper.toResponse(reserva, titularId, acompIds);
                })
                .collect(Collectors.toList());
    }

    public ReservaResponse obtener(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        List<ReservaHuesped> vinculos = reservaHuespedRepository.findAll()
                .stream()
                .filter(rh -> rh.getReserva().getId().equals(reserva.getId()))
                .collect(Collectors.toList());

        Long titularId = vinculos.stream()
                .filter(ReservaHuesped::getEsTitular)
                .map(rh -> rh.getHuesped().getId())
                .findFirst()
                .orElse(null);

        List<Long> acompIds = vinculos.stream()
                .filter(rh -> Boolean.FALSE.equals(rh.getEsTitular()))
                .map(rh -> rh.getHuesped().getId())
                .collect(Collectors.toList());

        return reservaMapper.toResponse(reserva, titularId, acompIds);
    }

    // ========= CAMBIOS DE ESTADO =========

    public ReservaResponse cancelar(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setActualizadoEn(LocalDateTime.now());

        Reserva guardada = reservaRepository.save(reserva);
        return obtener(guardada.getId());
    }

    public ReservaResponse checkin(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (reserva.getEstado() != EstadoReserva.CONFIRMADA) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo reservas CONFIRMADAS pueden hacer check-in"
            );
        }

        reserva.setEstado(EstadoReserva.CHECKIN);
        reserva.setActualizadoEn(LocalDateTime.now());

        Reserva guardada = reservaRepository.save(reserva);
        return obtener(guardada.getId());
    }

    public ReservaResponse checkout(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (reserva.getEstado() != EstadoReserva.CHECKIN) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo reservas en CHECKIN pueden hacer check-out"
            );
        }

        reserva.setEstado(EstadoReserva.CHECKOUT);
        reserva.setActualizadoEn(LocalDateTime.now());

        Reserva guardada = reservaRepository.save(reserva);
        return obtener(guardada.getId());
    }

    // ========= DISPONIBILIDAD BÁSICA (por habitación) =========
    public boolean habitacionDisponible(Long habitacionId, LocalDate checkIn, LocalDate checkOut) {
        List<String> estadosActivos = List.of(
                EstadoReserva.PENDIENTE.name(),
                EstadoReserva.CONFIRMADA.name(),
                EstadoReserva.CHECKIN.name()
        );
        return !reservaRepository.existeSuperposicionReserva(habitacionId, estadosActivos, checkIn, checkOut);
    }

    // ========= DISPONIBILIDAD POR HOTEL (lista de habitaciones) =========
    public List<HabitacionResponse> disponibilidadHotel(Long hotelId,
                                                        LocalDate checkIn,
                                                        LocalDate checkOut) {

        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fechas de check-in/out inválidas");
        }

        // Validar que exista el hotel
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hotel no encontrado"));

        // Traer todas las habitaciones del hotel
        List<Habitacion> habitaciones = habitacionRepository.findByHotel_Id(hotelId);

        List<String> estadosActivos = List.of(
                EstadoReserva.PENDIENTE.name(),
                EstadoReserva.CONFIRMADA.name(),
                EstadoReserva.CHECKIN.name()
        );

        // Filtrar solo las que NO tienen superposición
        List<Habitacion> disponibles = habitaciones.stream()
                .filter(h -> !reservaRepository.existeSuperposicionReserva(
                        h.getId(),
                        estadosActivos,
                        checkIn,
                        checkOut
                ))
                .collect(Collectors.toList());

        // Mapear a DTO
        return disponibles.stream()
                .map(habitacionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public DisponibilidadHotelResponse disponibilidadHotelResumen(Long hotelId,
                                                                  LocalDate checkIn,
                                                                  LocalDate checkOut) {
        List<HabitacionResponse> libres = disponibilidadHotel(hotelId, checkIn, checkOut);

        return DisponibilidadHotelResponse.builder()
                .tieneDisponibilidad(!libres.isEmpty())
                .cantidadDisponibles(libres.size())
                .habitaciones(libres)
                .build();
    }
    public ReservaResponse registrarSenia(Long reservaId, PagoSeniaRequest req) {

        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (reserva.getEstado() == EstadoReserva.CANCELADA ||
                reserva.getEstado() == EstadoReserva.CHECKOUT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede registrar seña para una reserva cancelada o finalizada");
        }

        // Crear el pago (seña)
        Pago pago = Pago.builder()
                .reserva(reserva)
                .monto(req.getMonto())
                .moneda(req.getMoneda() != null ? req.getMoneda() : reserva.getMoneda())
                .metodo(req.getMetodo())
                .pagadoPorCanal(false)                // porque la carga el hotelero
                .referenciaPago(req.getReferenciaPago())
                .fechaPago(LocalDateTime.now())
                .build();

        pagoRepository.save(pago);

        // Si estaba PENDIENTE, ahora pasa a CONFIRMADA
        if (reserva.getEstado() == EstadoReserva.PENDIENTE) {
            reserva.setEstado(EstadoReserva.CONFIRMADA);
            reserva.setActualizadoEn(LocalDateTime.now());
            reservaRepository.save(reserva);
        }

        // devolvemos la reserva actualizada
        return obtener(reserva.getId());
    }
}
