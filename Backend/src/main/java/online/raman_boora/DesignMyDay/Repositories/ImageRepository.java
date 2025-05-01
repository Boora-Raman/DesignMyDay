package online.raman_boora.DesignMyDay.Repositories;

import online.raman_boora.DesignMyDay.Models.Images;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ImageRepository extends MongoRepository<Images, String> {
}