package com.tmsgrp3.backend.security.filter;

import java.io.IOException;

import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.tmsgrp3.backend.exceptions.EntityNotFoundException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class ExceptionHandlerFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain filter_chain) throws ServletException, IOException {

        try {

            filter_chain.doFilter(req, res);
        }
        catch (EntityNotFoundException e) {

            res.setContentType("application/json");
            res.setCharacterEncoding("UTF-8");
            res.setStatus(HttpServletResponse.SC_NOT_FOUND);
            res.getWriter().write("{\n" 
                                    + "\"error\":\"Invalid Username/Password\""
                                    + "\n}");
            res.getWriter().flush();
        }
        catch (JWTVerificationException e) {

            res.setContentType("application/json");
            res.setCharacterEncoding("UTF-8");
            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            res.getWriter().write("{\n" 
                                    + "\"error\":\"Invalid Token\""
                                    + "\n}");
            res.getWriter().flush();
        }
        catch (RuntimeException e) {

            System.out.println(e.getMessage());
            res.setContentType("application/json");
            res.setCharacterEncoding("UTF-8");
            res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            res.getWriter().write("{\n" 
                                    + "\"error\":\"Invalid Request\""
                                    + "\n}");
            res.getWriter().flush();
        }
    }
}
