package com.miempresa.gestion_hotelera.repository;


import com.miempresa.gestion_hotelera.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, Long> {
}