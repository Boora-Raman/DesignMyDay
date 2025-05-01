package online.raman_boora.DesignMyDay.Services;

import online.raman_boora.DesignMyDay.Models.Images;
import online.raman_boora.DesignMyDay.Models.Service;
import online.raman_boora.DesignMyDay.Models.Venue;
import online.raman_boora.DesignMyDay.Repositories.ImageRepository;
import online.raman_boora.DesignMyDay.Repositories.ServiceRepository;
import online.raman_boora.DesignMyDay.Repositories.VenueRepository;
import online.raman_boora.DesignMyDay.configurations.FileStorageConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

@org.springframework.stereotype.Service
public class VenueServices {

    private static final Logger logger = LoggerFactory.getLogger(VenueServices.class);

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private FileStorageConfig fileStorageConfig;

    @Transactional
    public Venue addVenue(Venue venue, List<MultipartFile> images) throws IOException {
        logger.info("Adding new venue: {}", venue.getVenueName());
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
                    logger.debug("Saved image: {} for venue: {}", fileName, venue.getVenueName());
                }
            }
        }

        venue.setImages(savedImages);
        Venue savedVenue = venueRepository.save(venue);

        logger.info("Venue '{}' added successfully with ID: {}", venue.getVenueName(), savedVenue.getVenueId());
        return savedVenue;
    }

    public List<Venue> getAllVenues() {
        logger.info("Fetching all venues");
        List<Venue> venues = venueRepository.findAll();
        logger.debug("Found {} venues", venues.size());
        return venues;
    }

    public Optional<Venue> getVenueById(String venueId) {
        logger.info("Fetching venue with ID: {}", venueId);
        Optional<Venue> venue = venueRepository.findById(venueId);
        if (venue.isEmpty()) {
            logger.warn("Venue with ID '{}' not found", venueId);
        }
        return venue;
    }

    @Transactional
    public boolean addServicesToVenue(String venueId, List<String> serviceIds) {
        logger.info("Adding services to venue ID: {}", venueId);
        Optional<Venue> venueOpt = venueRepository.findById(venueId);
        if (venueOpt.isEmpty()) {
            logger.warn("Venue with ID '{}' not found", venueId);
            return false;
        }

        Venue venue = venueOpt.get();
        List<Service> servicesToAdd = new ArrayList<>();
        for (String serviceId : serviceIds) {
            Optional<Service> serviceOpt = serviceRepository.findById(serviceId);
            if (serviceOpt.isPresent()) {
                servicesToAdd.add(serviceOpt.get());
            } else {
                logger.warn("Service with ID '{}' not found", serviceId);
            }
        }

        if (!servicesToAdd.isEmpty()) {
            venue.getServices().addAll(servicesToAdd);
            venueRepository.save(venue);
            logger.info("Added {} services to venue ID: {}", servicesToAdd.size(), venueId);
            return true;
        }

        logger.warn("No valid services provided for venue ID: {}", venueId);
        return false;
    }

    @Transactional
    public boolean removeServiceFromVenue(String venueId, String serviceId) {
        logger.info("Removing service ID: {} from venue ID: {}", serviceId, venueId);
        Optional<Venue> venueOpt = venueRepository.findById(venueId);
        if (venueOpt.isEmpty()) {
            logger.warn("Venue with ID '{}' not found", venueId);
            return false;
        }

        Venue venue = venueOpt.get();
        boolean removed = venue.getServices().removeIf(service -> service.getServiceId().equals(serviceId));
        if (removed) {
            venueRepository.save(venue);
            logger.info("Service ID: {} removed from venue ID: {}", serviceId, venueId);
            return true;
        }

        logger.warn("Service ID: {} not found in venue ID: {}", serviceId, venueId);
        return false;
    }
}