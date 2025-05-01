package online.raman_boora.DesignMyDay.Services;

import online.raman_boora.DesignMyDay.Models.Carter;
import online.raman_boora.DesignMyDay.Models.Images;
import online.raman_boora.DesignMyDay.Repositories.CarterRepository;
import online.raman_boora.DesignMyDay.Repositories.ImageRepository;
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
public class CarterServices {

    private static final Logger logger = LoggerFactory.getLogger(CarterServices.class);

    @Autowired
    private CarterRepository carterRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private FileStorageConfig fileStorageConfig;

    @Transactional
    public Carter addCarter(Carter carter, List<MultipartFile> images) throws IOException {
        logger.info("Adding new carter: {}", carter.getCarterName()); // Updated to carterName
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
                    logger.debug("Saved image: {} for carter: {}", fileName, carter.getCarterName());
                }
            }
        }

        carter.setImages(savedImages);
        Carter savedCarter = carterRepository.save(carter);

        logger.info("Carter '{}' added successfully with ID: {}", carter.getCarterName(), savedCarter.getCarterId());
        return savedCarter;
    }

    public List<Carter> getAllCarters() {
        logger.info("Fetching all carters");
        List<Carter> carters = carterRepository.findAll();
        logger.debug("Found {} carters", carters.size());
        return carters;
    }

    public Optional<Carter> getCarterById(String carterId) {
        logger.info("Fetching carter with ID: {}", carterId);
        Optional<Carter> carter = carterRepository.findById(carterId);
        if (carter.isEmpty()) {
            logger.warn("Carter with ID '{}' not found", carterId);
        }
        return carter;
    }
}