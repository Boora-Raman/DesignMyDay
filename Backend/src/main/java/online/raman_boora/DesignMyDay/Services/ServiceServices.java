package online.raman_boora.DesignMyDay.Services;

import online.raman_boora.DesignMyDay.Models.Service;
import online.raman_boora.DesignMyDay.Repositories.ServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ServiceServices {

    private static final Logger logger = LoggerFactory.getLogger(ServiceServices.class);

    @Autowired
    private ServiceRepository serviceRepository;

    public Service addService(Service service) {
        logger.info("Adding new service: {}", service.getServiceName());
        service.setServiceId(UUID.randomUUID().toString());
        Service savedService = serviceRepository.save(service);
        logger.info("Service '{}' added successfully with ID: {}", service.getServiceName(), savedService.getServiceId());
        return savedService;
    }

    public List<Service> getAllServices() {
        logger.info("Fetching all services");
        List<Service> services = serviceRepository.findAll();
        logger.debug("Found {} services", services.size());
        return services;
    }

    public Optional<Service> getServiceById(String serviceId) {
        logger.info("Fetching service with ID: {}", serviceId);
        Optional<Service> service = serviceRepository.findById(serviceId);
        if (service.isEmpty()) {
            logger.warn("Service with ID '{}' not found", serviceId);
        }
        return service;
    }
}