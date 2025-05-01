package online.raman_boora.DesignMyDay.configurations;

import online.raman_boora.DesignMyDay.Services.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public WebSecurityConfiguration(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())// Disable CSRF for API usage
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/signup", "/login" , "/api/images/**").permitAll()// Public endpoints
                        .requestMatchers(HttpMethod.GET, "/vendors/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/carters/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/venues/**").permitAll()
                        .requestMatchers("/users").authenticated() // Secure /users endpoint explicitly
                        .anyRequest().authenticated() // All other endpoints require authentication
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtService, userDetailsService), UsernamePasswordAuthenticationFilter.class); // JWT filter

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        return authenticationProvider()::authenticate;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }




     @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Match all endpoints
                        .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3001","http://127.0.0.1:5500" , "http://127.0.0.1:3000","http://13.53.163.51:3000/","http://13.53.163.51:80")  // Specify frontend origins
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow specific HTTP methods
                        .allowedHeaders("*") // Allow all headers
                        .allowCredentials(true);
            }
        };
    }














}
