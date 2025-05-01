//package online.raman_boora.DesignMyDay.jwt;
//
//import com.sun.jdi.event.StepEvent;
//import io.jsonwebtoken.ExpiredJwtException;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.MalformedJwtException;
//import io.jsonwebtoken.UnsupportedJwtException;
//import io.jsonwebtoken.io.Decoders;
//import io.jsonwebtoken.security.Keys;
//import jakarta.servlet.http.HttpServletRequest;
//import online.raman_boora.DesignMyDay.Models.Users;
//import org.apache.tomcat.util.http.parser.Authorization;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import javax.crypto.SecretKey;
//import java.security.Key;
//import java.util.Date;
//import java.util.logging.Logger;
//
//@Component
//public class JwtUtils {
//
//    @Value("${spring.app.jwtSecret}")
//    private int jwtSecret;
//    @Value("${spring.app.jwtExpirationMs}")
//    private int jwtExpirationMs;
//
//    public String getJwtFromHeader(HttpServletRequest request)
//    {
//        String bearerToken = request.getHeader("Authorization");
//
//        if(bearerToken!=null && bearerToken.startsWith("Bearer "))
//        {
//            return bearerToken.substring(7);
//        }
//        return null;
//
//    }
//
//
//    public String generateTokenFromUsername(Users user)
//    {
//        String username = user.getName();
//        return Jwts.builder()
//                .subject(username)
//                .issuedAt(new Date())
//                .expiration(new Date( (new Date()).getTime() + jwtExpirationMs ))
//                .signWith(key())
//                .compact();
//
//    }
//
//    public String getUsernameFromJwtToken(String Token)
//    {
//
//        return Jwts.parser()
//                .verifyWith(SecretKey key())
//                .build().parseSignedClaims(Token)
//                .getPayload().getSubject();
//
//    }
//
//    private Key key() {
//        byte[] decode = Decoders.BASE64.decode(jwtSecret);
//        return Keys.hmacShaKeyFor(decode);
//    }
//
//    public boolean validateJwtToken(String authToken) {
//        try {
//
//            System.out.println("Validating");
//
//            Jwts.parser()
//                    .verifyWith(SecretKey key())
//                    .build().parseSignedClaims(authToken);
//
//            return true;
//
//        } catch (MalformedJwtException e)
//        {
//            System.out.println(e.getMessage());
//        }
//
//        catch (ExpiredJwtException e)
//        {
//            System.out.println(e.getMessage());
//        }
//
//        catch (UnsupportedJwtException e)
//        {
//            System.out.println(e.getMessage());
//        }
//
//        catch (IllegalArgumentException e)
//        {
//            System.out.println(e.getMessage());
//        }
//return false;
//    }
//
//
//
//}
