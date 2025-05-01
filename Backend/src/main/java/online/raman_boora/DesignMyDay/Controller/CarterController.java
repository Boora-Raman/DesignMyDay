package online.raman_boora.DesignMyDay.Controller;

import online.raman_boora.DesignMyDay.Models.Carter;
import online.raman_boora.DesignMyDay.Services.CarterServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/carters")
public class CarterController {

    private static final Logger logger = LoggerFactory.getLogger(CarterController.class);

    @Autowired
    private CarterServices carterServices;

    @PostMapping
    public ResponseEntity<?> addCarter(
            @RequestPart("carter") Carter carter,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        logger.info("Adding carter: {}", carter.getCarterName()); // Updated to carterName
        try {
            Carter savedCarter = carterServices.addCarter(carter, images);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCarter);
        } catch (IOException e) {
            logger.error("Error adding carter '{}': {}", carter.getCarterName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save images: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error adding carter '{}': {}", carter.getCarterName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Carter>> getAllCarters() {
        logger.info("Fetching all carters");
        List<Carter> carters = carterServices.getAllCarters();
        return ResponseEntity.ok(carters);
    }

    @GetMapping("/{carterId}")
    public ResponseEntity<Carter> getCarterById(@PathVariable String carterId) {
        logger.info("Fetching carter with ID: {}", carterId);
        Optional<Carter> carter = carterServices.getCarterById(carterId);
        if (carter.isPresent()) {
            return ResponseEntity.ok(carter.get());
        }
        logger.warn("Carter with ID '{}' not found", carterId);
        return ResponseEntity.notFound().build();
    }
}