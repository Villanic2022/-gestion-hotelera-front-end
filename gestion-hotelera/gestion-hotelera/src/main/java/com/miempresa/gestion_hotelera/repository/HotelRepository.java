package com.miempresa.gestion_hotelera.repository;

import com.miempresa.gestion_hotelera.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
}
