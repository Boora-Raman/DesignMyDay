package online.raman_boora.DesignMyDay.Repositories;

import online.raman_boora.DesignMyDay.Models.Booking;
import online.raman_boora.DesignMyDay.Models.Users;
import online.raman_boora.DesignMyDay.Models.Venue;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
//    List<Booking> findByUser(Users user);
    List<Booking> findByVenue(Venue venue);
}