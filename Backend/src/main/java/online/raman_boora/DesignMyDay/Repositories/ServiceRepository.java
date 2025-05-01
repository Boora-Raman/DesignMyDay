package online.raman_boora.DesignMyDay.Repositories;

import online.raman_boora.DesignMyDay.Models.Service;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ServiceRepository extends MongoRepository<Service, String> {
}