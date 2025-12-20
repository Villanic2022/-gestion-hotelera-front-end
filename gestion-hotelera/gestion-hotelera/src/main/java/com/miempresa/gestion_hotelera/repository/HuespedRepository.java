package com.miempresa.gestion_hotelera.repository;

import com.miempresa.gestion_hotelera.entity.Huesped;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HuespedRepository extends JpaRepository<Huesped, Long> {
    Optional<Huesped> findByEmail(String email);

    Optional<Huesped> findByNumeroDocumento(String numeroDocumento);
}