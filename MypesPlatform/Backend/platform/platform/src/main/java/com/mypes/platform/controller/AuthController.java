package com.mypes.platform.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mypes.platform.dto.AuthResponse;
import com.mypes.platform.dto.LoginRequest;
import com.mypes.platform.dto.RegisterRequest;
import com.mypes.platform.dto.RegisterResponse;
import com.mypes.platform.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public RegisterResponse register(
            @RequestBody RegisterRequest request
    ) {

        return authService.register(request);

    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        return authService.login(request);

    }
}