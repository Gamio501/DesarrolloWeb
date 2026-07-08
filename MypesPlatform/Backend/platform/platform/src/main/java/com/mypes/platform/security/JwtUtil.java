package com.mypes.platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET = "mypesplataformaseguridadjwt2026proyectofinal";

    private final long EXPIRATION = 6000000;

    private Key getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String username) {

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis() + EXPIRATION
                        )
                )
                .signWith(
                        getKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    public String extractUsername(String token) {

        return extractClaims(token).getSubject();

    }

    public boolean validateToken(String token,String username){

        String extractedUsername=extractUsername(token);

        return extractedUsername.equals(username)
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token){

        return extractClaims(token)
                .getExpiration()
                .before(new Date());

    }

    private Claims extractClaims(String token){

        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

    }

}