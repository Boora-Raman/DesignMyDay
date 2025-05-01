    package online.raman_boora.DesignMyDay.Controller;

    import online.raman_boora.DesignMyDay.Models.Venue;
    import online.raman_boora.DesignMyDay.Services.VenueServices;
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.multipart.MultipartFile;

    import java.io.IOException;
    import java.util.List;
    import java.util.Optional;

    @RestController
    @RequestMapping("/venues")
    public class VenueController {

        private static final Logger logger = LoggerFactory.getLogger(VenueController.class);

        @Autowired
        private VenueServices venueServices;

        @PostMapping
        public ResponseEntity<Venue> addVenue(
                @RequestPart("venue") Venue venue,
                @RequestPart(value = "images", required = false) List<MultipartFile> images) {
            logger.info("Adding venue: {}", venue.getVenueName());
            try {
                Venue savedVenue = venueServices.addVenue(venue, images);
                return ResponseEntity.status(HttpStatus.CREATED).body(savedVenue);
            } catch (IOException e) {
                logger.error("Error adding venue '{}': {}", venue.getVenueName(), e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            }
        }

        @GetMapping
        public ResponseEntity<List<Venue>> getAllVenues() {
            logger.info("Fetching all venues");
            List<Venue> venues = venueServices.getAllVenues();
            return ResponseEntity.ok(venues);
        }

        @GetMapping("/{venueId}")
        public ResponseEntity<Venue> getVenueById(@PathVariable String venueId) {
            logger.info("Fetching venue with ID: {}", venueId);
            Optional<Venue> venue = venueServices.getVenueById(venueId);
            if (venue.isPresent()) {
                return ResponseEntity.ok(venue.get());
            }
            logger.warn("Venue with ID '{}' not found", venueId);
            return ResponseEntity.notFound().build();
        }

        @PostMapping("/{venueId}/services")
        public ResponseEntity<Void> addServicesToVenue(
                @PathVariable String venueId,
                @RequestBody List<String> serviceIds) {
            logger.info("Adding services to venue ID: {}", venueId);
            boolean added = venueServices.addServicesToVenue(venueId, serviceIds);
            if (added) {
                return ResponseEntity.ok().build();
            }
            logger.warn("Failed to add services to venue ID: {}", venueId);
            return ResponseEntity.badRequest().build();
        }

        @DeleteMapping("/{venueId}/services/{serviceId}")
        public ResponseEntity<Void> removeServiceFromVenue(
                @PathVariable String venueId,
                @PathVariable String serviceId) {
            logger.info("Removing service ID: {} from venue ID: {}", serviceId, venueId);
            boolean removed = venueServices.removeServiceFromVenue(venueId, serviceId);
            if (removed) {
                return ResponseEntity.ok().build();
            }
            logger.warn("Failed to remove service ID: {} from venue ID: {}", serviceId, venueId);
            return ResponseEntity.notFound().build();
        }
    }