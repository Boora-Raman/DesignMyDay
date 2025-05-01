package online.raman_boora.DesignMyDay.Controller;

import online.raman_boora.DesignMyDay.configurations.FileStorageConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);

    @Autowired
    private FileStorageConfig fileStorageConfig;

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String fileName) {
        logger.info("Serving image: {}", fileName);
        try {
            Path filePath = Paths.get(fileStorageConfig.getVenueUploadDir()).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg";
                if (fileName.endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.endsWith(".gif")) {
                    contentType = "image/gif";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                logger.warn("Image '{}' not found or not readable", fileName);
                Path defaultPath = Paths.get(fileStorageConfig.getVenueUploadDir()).resolve("default.jpg").normalize();
                Resource defaultResource = new UrlResource(defaultPath.toUri());
                if (defaultResource.exists() && defaultResource.isReadable()) {
                    return ResponseEntity.ok()
                            .contentType(MediaType.IMAGE_JPEG)
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"default.jpg\"")
                            .body(defaultResource);
                }
                logger.error("Default image not found");
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            logger.error("Error serving image '{}': {}", fileName, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}