package online.raman_boora.DesignMyDay.Controller;

import online.raman_boora.DesignMyDay.Models.Vendor;
import online.raman_boora.DesignMyDay.Services.VendorServices;
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
@RequestMapping("/vendors")
public class VendorController {

    private static final Logger logger = LoggerFactory.getLogger(VendorController.class);

    @Autowired
    private VendorServices vendorServices;

    @PostMapping
    public ResponseEntity<?> addVendor(
            @RequestPart("vendor") Vendor vendor,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        logger.info("Adding vendor: {}", vendor.getVendorName()); // Updated to vendorName
        try {
            Vendor savedVendor = vendorServices.addVendor(vendor, images);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedVendor);
        } catch (IOException e) {
            logger.error("Error adding vendor '{}': {}", vendor.getVendorName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save images: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error adding vendor '{}': {}", vendor.getVendorName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid request: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors() {
        logger.info("Fetching all vendors");
        List<Vendor> vendors = vendorServices.getAllVendors();
        return ResponseEntity.ok(vendors);
    }

    @GetMapping("/{vendorId}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable String vendorId) {
        logger.info("Fetching vendor with ID: {}", vendorId);
        Optional<Vendor> vendor = vendorServices.getVendorById(vendorId);
        if (vendor.isPresent()) {
            return ResponseEntity.ok(vendor.get());
        }
        logger.warn("Vendor with ID '{}' not found", vendorId);
        return ResponseEntity.notFound().build();
    }
}