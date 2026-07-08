package com.mypes.platform.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.mypes.platform.dto.AuthResponse;
import com.mypes.platform.dto.LoginRequest;
import com.mypes.platform.dto.ProductoDTO;
import com.mypes.platform.service.AuthService;
import com.mypes.platform.service.ProductoService;
import com.mypes.platform.service.TiendaService;

@Controller
@RequestMapping("/vista")
public class viewController {

    private final AuthService authService;
    private final ProductoService productoService;
    private final TiendaService tiendaService;

    viewController(AuthService authService, ProductoService productoService, TiendaService tiendaService) {
        this.authService = authService;
        this.productoService = productoService;
        this.tiendaService = tiendaService;
    }

    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("tiendas", tiendaService.findAll());
        model.addAttribute("productos", productoService.findAll());
        return "home";
    }

    @GetMapping("/tienda/{id}")
    public String tienda(@PathVariable Long id, Model model) {
        model.addAttribute("tienda", tiendaService.findById(id));
        model.addAttribute("productos", productoService.findByTiendaId(id));
        return "tienda";
    }

    @GetMapping("/agregarProducto")
    public String mostrarForm(Model model) {
        model.addAttribute("ProductoDTO", new ProductoDTO());
        return "agregarProducto";
    }

    @GetMapping("/formlogin")
    public String mostratlogin(Model model) {
        model.addAttribute("loginRequest", new LoginRequest());
        return "formlogin";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/miTienda")
    public String miTienda() {
        return "miTienda";
    }

    @PostMapping("/login")
    public AuthResponse login(LoginRequest request) {
        return authService.login(request);
    }
}
