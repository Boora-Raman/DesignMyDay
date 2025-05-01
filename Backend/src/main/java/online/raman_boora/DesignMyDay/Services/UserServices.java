package online.raman_boora.DesignMyDay.Services;

import online.raman_boora.DesignMyDay.Models.Users;
import online.raman_boora.DesignMyDay.Repositories.UserRepository;
import online.raman_boora.DesignMyDay.configurations.FileStorageConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServices {

    private static final Logger logger = LoggerFactory.getLogger(UserServices.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private FileStorageConfig fileStorageConfig;

    @Autowired
    private JwtService jwtService;

    @Transactional
    public String saveUser(Users user, MultipartFile image) throws IOException {
        logger.info("Registering new user: {}", user.getEmail());
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("Email '{}' already exists", user.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(fileStorageConfig.getVenueUploadDir(), fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, image.getBytes());
            user.setProfileImagePath(fileName);
            logger.debug("Saved profile image: {} for user: {}", fileName, user.getEmail());
        }

        Users savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        logger.info("User '{}' registered successfully with ID: {}", user.getEmail(), savedUser.getUserId());
        return token;
    }

    public String validate(Users user) {
        logger.info("Validating user: {}", user.getEmail());
        Optional<Users> userOpt = userRepository.findByEmail(user.getEmail());
        if (userOpt.isPresent()) {
            Users existingUser = userOpt.get();
            if (passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
                String token = jwtService.generateToken(existingUser);
                logger.info("Validation successful for user: {}", user.getEmail());
                return token;
            }
        }
        logger.warn("Validation failed for user: {}", user.getEmail());
        return null;
    }

    public List<Users> getUsers() {
        logger.info("Fetching all users");
        return userRepository.findAll();
    }

    public Optional<Users> getUserByUserId(String userId) {
        logger.info("Fetching user with ID: {}", userId);
        Optional<Users> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            logger.warn("User with ID '{}' not found", userId);
        }
        return user;
    }

    public Optional<Users> getUserByname(String name) {
        logger.info("Fetching user with name: {}", name);
        Optional<Users> user = userRepository.findByName(name);
        if (user.isEmpty()) {
            logger.warn("User with name '{}' not found", name);
        }
        return user;
    }

    @Transactional
    public Optional<Users> updateUserProfile(String userId, Users updatedUser, MultipartFile profileImage) throws IOException {
        logger.info("Updating profile for user ID: {}", userId);
        Optional<Users> existingUserOpt = userRepository.findById(userId);
        if (existingUserOpt.isEmpty()) {
            logger.warn("User with ID '{}' not found", userId);
            return Optional.empty();
        }

        Users user = existingUserOpt.get();
        if (updatedUser.getName() != null && !updatedUser.getName().isBlank()) {
            user.setName(updatedUser.getName());
        }
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().isBlank()) {
            if (!user.getEmail().equals(updatedUser.getEmail()) && userRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
                logger.warn("Email '{}' already exists", updatedUser.getEmail());
                throw new IllegalArgumentException("Email already exists");
            }
            user.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        if (profileImage != null && !profileImage.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + profileImage.getOriginalFilename();
            Path filePath = Paths.get(fileStorageConfig.getVenueUploadDir(), fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, profileImage.getBytes());
            if (user.getProfileImagePath() != null) {
                Path oldFilePath = Paths.get(fileStorageConfig.getVenueUploadDir(), user.getProfileImagePath());
                Files.deleteIfExists(oldFilePath);
            }
            user.setProfileImagePath(fileName);
            logger.debug("Updated profile image: {} for user: {}", fileName, user.getEmail());
        }

        Users savedUser = userRepository.save(user);
        logger.info("User profile updated successfully for ID: {}", userId);
        return Optional.of(savedUser);
    }
}