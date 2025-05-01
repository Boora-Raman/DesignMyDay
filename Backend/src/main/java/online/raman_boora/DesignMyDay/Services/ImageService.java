package online.raman_boora.DesignMyDay.Services;

import online.raman_boora.DesignMyDay.Models.Images;
import online.raman_boora.DesignMyDay.configurations.FileStorageConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ImageService {

    private static final Logger logger = LoggerFactory.getLogger(ImageService.class);

    @Autowired
    private FileStorageConfig fileStorageConfig;

    public Images saveUserImage(MultipartFile image) throws IOException {
        if (!isValidImage(image)) {
            logger.warn("Invalid image: {} (type: {}, size: {})", image.getOriginalFilename(), image.getContentType(), image.getSize());
            throw new IllegalArgumentException("Invalid image type or size. Only JPEG/PNG allowed, max 5MB.");
        }

        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path filePath = Paths.get(fileStorageConfig.getVenueUploadDir(), fileName);

        logger.info("Saving user image: {} to path: {}", fileName, filePath);
        Files.write(filePath, image.getBytes());

        Images imageEntity = new Images();
        imageEntity.setImgid(UUID.randomUUID().toString());
        imageEntity.setImgName(fileName);

        return imageEntity;
    }

    public List<Images> saveVenueImages(List<MultipartFile> images) throws IOException {
        List<Images> savedImages = new ArrayList<>();
        if (images == null || images.isEmpty()) {
            logger.info("No images to save for venue");
            return savedImages;
        }

        for (MultipartFile image : images) {
            if (!isValidImage(image)) {
                logger.warn("Invalid image: {} (type: {}, size: {})", image.getOriginalFilename(), image.getContentType(), image.getSize());
                throw new IllegalArgumentException("Invalid image type or size. Only JPEG/PNG allowed, max 5MB.");
            }

            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(fileStorageConfig.getVenueUploadDir(), fileName);

            logger.info("Saving venue image: {} to path: {}", fileName, filePath);
            Files.write(filePath, image.getBytes());

            Images imageEntity = new Images();
            imageEntity.setImgid(UUID.randomUUID().toString());
            imageEntity.setImgName(fileName);

            savedImages.add(imageEntity);
        }

        logger.info("Saved {} images for venue", savedImages.size());
        return savedImages;
    }

    private boolean isValidImage(MultipartFile image) {
        String contentType = image.getContentType();
        long maxSize = 5 * 1024 * 1024; // 5MB
        return contentType != null &&
                (contentType.equals("image/jpeg") || contentType.equals("image/png")) &&
                image.getSize() <= maxSize;
    }
}