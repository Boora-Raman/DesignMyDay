package online.raman_boora.DesignMyDay.Controller;

import jakarta.validation.Valid;
import online.raman_boora.DesignMyDay.Models.Users;
import online.raman_boora.DesignMyDay.Services.JwtService;
import online.raman_boora.DesignMyDay.Services.UserServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.awt.print.Book;
import java.io.IOException;
import java.util.*;

@RestController
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserServices userServices;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/users")
    public List<Users> getUsers() {
        logger.info("Fetching all users");
        return userServices.getUsers();
    }

    @PostMapping("/signup")
    public ResponseEntity<String> saveUser(
            @Valid @RequestPart("user") Users user,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        logger.info("Signup request for user: {}", user.getName());
        String result = userServices.saveUser(user, image);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/username/{token}")
    public String getUsernameFromToken(@PathVariable String token) {
        logger.info("Fetching user by token: {}", token);
        return jwtService.extractUserName(token);
    }

    @GetMapping("/expired/{token}")
    public Boolean isTokenValid(@PathVariable String token) {
        logger.info("Checking Token For  expiration : {}", token);
        return jwtService.isTokenExpired(token);
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<Users> getUserByUserId(@PathVariable String userId) {
        logger.info("Fetching user by ID: {}", userId);
        Optional<Users> user = userServices.getUserByUserId(userId);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/users/name/{name}")
    public ResponseEntity<Users> getUserByName(@PathVariable String name) {
        logger.info("Fetching user by name: {}", name);
        Optional<Users> user = userServices.getUserByname(name);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Users user) {
        logger.info("Login request for user: {}", user.getEmail());
        String token = userServices.validate(user);
        if (token == null) {
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid credentials"));
        }
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login successful");
        return ResponseEntity.ok(response);
    }
}