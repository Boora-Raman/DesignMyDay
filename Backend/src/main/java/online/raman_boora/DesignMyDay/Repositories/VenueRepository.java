package online.raman_boora.DesignMyDay.Repositories;

import java.util.List;
import java.util.Optional;
import online.raman_boora.DesignMyDay.Models.Venue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface VenueRepository extends MongoRepository<Venue, String> {

    Optional<Venue> findByVenueName(String venueName);

    List<Venue> findByVenueAddressContainingIgnoreCase(String address);
}