package online.raman_boora.DesignMyDay.Controller;

import online.raman_boora.DesignMyDay.Models.Service;
import online.raman_boora.DesignMyDay.Services.ServiceServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/services")
public class ServiceController {

    private static final Logger logger = LoggerFactory.getLogger(ServiceController.class);

    @Autowired
    private ServiceServices serviceServices;

    @PostMapping
    public ResponseEntity<Service> addService(@RequestBody Service service) {
        logger.info("Adding service: {}", service.getServiceName());
        Service savedService = serviceServices.addService(service);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedService);
    }

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        logger.info("Fetching all services");
        List<Service> services = serviceServices.getAllServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{serviceId}")
    public ResponseEntity<Service> getServiceById(@PathVariable String serviceId) {
        logger.info("Fetching service with ID: {}", serviceId);
        Optional<Service> service = serviceServices.getServiceById(serviceId);
        if (service.isPresent()) {
            return ResponseEntity.ok(service.get());
        }
        logger.warn("Service with ID '{}' not found", serviceId);
        return ResponseEntity.notFound().build();
    }
}