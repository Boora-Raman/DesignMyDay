package online.raman_boora.DesignMyDay.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Value("${file.upload-dir.users}")
    private String userUploadDir;

    @Value("${file.upload-dir.venues}")
    private String venueUploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(userUploadDir));
            Files.createDirectories(Paths.get(venueUploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directories!", e);
        }
    }

    public String getUserUploadDir() {
        return userUploadDir;
    }

    public String getVenueUploadDir() {
        return venueUploadDir;
    }
}