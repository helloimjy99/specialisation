package com.tmsgrp3.backend;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

import com.tmsgrp3.backend.repository.BackendRepository;


@Service
@EnableAsync
public class EmailHandlerService {
    
    @Autowired
    private JavaMailSender mail_sender;

    @Autowired
    private ConfigProperties config;

    @Autowired
    private BackendRepository repo;

    public void SendEmail(String to, String subject, String body) {

        SimpleMailMessage msg = new SimpleMailMessage();

        msg.setFrom(config.getEmailsender());
        msg.setTo(config.getEmailsender());
        msg.setSubject(subject);
        msg.setText(body);

        mail_sender.send(msg);
    }


    @Async
    public void EmailOnPromoteDone(String acronym, String task_name, List<Map<String, Object>> app_list) {

        Map<String, Object> app = app_list.get(0);

        String group = app.get("app_permit_done").toString();

        System.out.println(group);
        if (group == null) {

            System.out.println("null group");
            return;
        }

        List<String> emails = repo.GetEmailsGroup(group);

        if (emails.isEmpty()) {

            System.out.println("No email");
            return;
        }

        String subject = "Task Management System: Please Review Task " + task_name;
        String body = "Task \"" + task_name + "\" in the Application \"" + acronym + "\" has been promoted to the Done status for your approval. Please check the Task Management System to review the task.";

        for (String email : emails) {

            System.out.println("sending");
            if (email != null) {
            
                SendEmail(email, subject, body);
            }
        }
    }
}
