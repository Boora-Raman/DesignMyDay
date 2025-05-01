package online.raman_boora.DesignMyDay.Services;

import online.raman_boora.DesignMyDay.Models.Images;
import online.raman_boora.DesignMyDay.Models.Vendor;
import online.raman_boora.DesignMyDay.Repositories.ImageRepository;
import online.raman_boora.DesignMyDay.Repositories.VendorRepository;
import online.raman_boora.DesignMyDay.configurations.FileStorageConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VendorServices {

    private static final Logger logger = LoggerFactory.getLogger(VendorServices.class);

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private FileStorageConfig fileStorageConfig;

    @Transactional
    public Vendor addVendor(Vendor vendor, List<MultipartFile> images) throws IOException {
        logger.info("Adding new vendor: {}", vendor.getVendorName()); // Updated to vendorName
        List<Images> savedImages = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    Path filePath = Paths.get(fileStorageConfig.getVenueUploadDir(), fileName);
                    Files.createDirectories(filePath.getParent());
                    Files.write(filePath, image.getBytes());
                    Images img = new Images();
                    img.setImgid(UUID.randomUUID().toString());
                    img.setImgName(fileName);
                    savedImages.add(imageRepository.save(img));
                    logger.debug("Saved image: {} for vendor: {}", fileName, vendor.getVendorName());
                }
            }
        }

        vendor.setImages(savedImages);
        Vendor savedVendor = vendorRepository.save(vendor);

        logger.info("Vendor '{}' added successfully with ID: {}", vendor.getVendorName(), savedVendor.getVendorId());
        return savedVendor;
    }

    public List<Vendor> getAllVendors() {
        logger.info("Fetching all vendors");
        List<Vendor> vendors = vendorRepository.findAll();
        logger.debug("Found {} vendors", vendors.size());
        return vendors;
    }

    public Optional<Vendor> getVendorById(String vendorId) {
        logger.info("Fetching vendor with ID: {}", vendorId);
        Optional<Vendor> vendor = vendorRepository.findById(vendorId);
        if (vendor.isEmpty()) {
            logger.warn("Vendor with ID '{}' not found", vendorId);
        }
        return vendor;
    }
}