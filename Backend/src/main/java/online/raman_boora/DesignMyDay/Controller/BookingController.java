package online.raman_boora.DesignMyDay.Controller;

import online.raman_boora.DesignMyDay.Models.Booking;
import online.raman_boora.DesignMyDay.Services.BookingServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingServices bookingServices;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> requestBody) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : null;
        if (username == null) {
            logger.warn("No authenticated user found for booking creation");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            String venueId = (String) requestBody.get("venueId");
            String bookingDate = (String) requestBody.get("bookingDate");
            List<String> vendorIds = (List<String>) requestBody.get("vendorIds");
            List<String> carterIds = (List<String>) requestBody.get("carterIds");

            logger.info("Creating booking for user: {}", username);
            Booking booking = bookingServices.createBooking(
                    username,
                    venueId,
                    bookingDate,
                    vendorIds,
                    carterIds
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to create booking: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUserId(@PathVariable String userId) {
        logger.info("Fetching bookings for user ID: {}", userId);
        List<Booking> bookings = bookingServices.getBookingsByUserId(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<Booking>> getBookingsByVenueId(@PathVariable String venueId) {
        logger.info("Fetching bookings for venue ID: {}", venueId);
        List<Booking> bookings = bookingServices.getBookingsByVenueId(venueId);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId) {
        logger.info("Cancelling booking with ID: {}", bookingId);
        boolean cancelled = bookingServices.cancelBooking(bookingId);
        if (cancelled) {
            return ResponseEntity.ok("Booking cancelled successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        logger.info("Fetching all bookings");
        List<Booking> bookings = bookingServices.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
}