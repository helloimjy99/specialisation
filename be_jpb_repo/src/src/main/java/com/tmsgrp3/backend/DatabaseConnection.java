package com.tmsgrp3.backend;

import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.boot.registry.StandardServiceRegistry;

public class DatabaseConnection {
    
    private static StandardServiceRegistry registry;
    private static SessionFactory sessionFactory;
    
    public static SessionFactory getSessionFactory(ConfigProperties config) {

        if (sessionFactory == null) {

            try {

                Configuration hibernate_config = new Configuration();

                hibernate_config.setProperty("hibernate.connection.driver_class", "com.mysql.jdbc.Driver");
                hibernate_config.setProperty("hibernate.connection.url", config.getUrl());
                hibernate_config.setProperty("hibernate.connection.username", config.getUsername());
                hibernate_config.setProperty("hibernate.connection.password", config.getPassword());
                hibernate_config.setProperty("hibernate.connection.pool_size", "50");
                hibernate_config.setProperty("hibernate.show_sql", "true");
                hibernate_config.setProperty("hibernate.current_session_context_class", "thread");
                hibernate_config.setProperty("hibernate.dbcp.initialSize", "100");
                hibernate_config.setProperty("hibernate.dbcp.maxTotal", "100");
                hibernate_config.setProperty("hibernate.dbcp.maxIdle", "50");
                hibernate_config.setProperty("hibernate.dbcp.minIdle", "5");
                hibernate_config.setProperty("hibernate.dbcp.maxWaitMillis", "-1");

                //registry = new StandardServiceRegistryBuilder().configure().build();
                //registry = new StandardServiceRegistryBuilder().applySettings(hibernate_config.getProperties()).build();

                //MetadataSources sources = new MetadataSources(registry);

                //Metadata metadata = sources.getMetadataBuilder().build();

                //sessionFactory = metadata.getSessionFactoryBuilder().build();
                sessionFactory = hibernate_config.buildSessionFactory();
            }
            catch (Exception e) {

                System.out.println("Failed to create session:");
                e.printStackTrace();

                if (registry != null) {

                    StandardServiceRegistryBuilder.destroy(registry);
                }
            }
        }

        return sessionFactory;
    }
    
    public static void shutdown() {

        if (registry != null) {

            StandardServiceRegistryBuilder.destroy(registry);
        }
    }
}
