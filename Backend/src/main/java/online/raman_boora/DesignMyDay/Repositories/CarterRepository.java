package online.raman_boora.DesignMyDay.Repositories;

import online.raman_boora.DesignMyDay.Models.Carter;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CarterRepository extends MongoRepository<Carter, String> {
}