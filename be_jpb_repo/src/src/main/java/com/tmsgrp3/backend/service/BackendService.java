package com.tmsgrp3.backend.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.tmsgrp3.backend.ConfigProperties;
import com.tmsgrp3.backend.EmailHandlerService;
import com.tmsgrp3.backend.entities.TMSUser;
import com.tmsgrp3.backend.repository.BackendRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
@EnableAsync
public class BackendService {

    @Autowired
    BackendRepository repo;

    @Autowired
    ConfigProperties config;

    @Autowired
    EmailHandlerService emailer;

    /*******************
     * Helper Functions*
     *******************/

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    public DecodedJWT DecodeJWT(String token) {

        DecodedJWT result;

        try {

            result = JWT.require(Algorithm.HMAC512(
                    config.getJwtsecret()))
                    .build()
                    .verify(token);
        } catch (Exception e) {

            System.out.println("Failed to decode JWT");
            result = null;
        }

        return result;
    }

    public HashMap<String, String> GetReqBody(HttpServletRequest req) {

        ObjectMapper mapper = new ObjectMapper();

        TypeFactory type_factory = mapper.getTypeFactory();

        MapType map_type = type_factory.constructMapType(HashMap.class, String.class, String.class);

        HashMap<String, String> body;

        try {

            body = mapper.readValue(req.getInputStream(), map_type);
        } catch (Exception e) {

            System.out.println(e.getMessage());
            return null;
        }

        return body;
    }

    private boolean isValidPassword(String password) {

        if (password == null) {

            return false;
        }

        String pattern = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&$%^()-_+=;:'\"<,>./`~])[A-Za-z\\d@$!%*#?&$%^()-_+=;:'\"<,>./`~]{8,10}$";
        // 8-10 total char, min 1 alphabet, 1 number, 1 special character
        return password.matches(pattern);
    }

    public boolean EmailRegexService(String email) {

        if (email == null) {

            return true;
        }

        String regexPattern = "^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@"
                + "[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$";
        // {1-64 alphanumeric or ._-}@{cant start with hyphens, subdomain separate w
        // dots}.{min 2 alphabets}
        Pattern pattern = Pattern.compile(regexPattern);
        Matcher matcher = pattern.matcher(email);
        return (matcher.matches()) ? true : false;
    }

    // verifies if a user is granted permission for a particular state for a
    // specified app
    public boolean VerifyStatusPerms(String app_acronym, String token, String task_state) {

        List<Map<String, Object>> app = GetAppsService(app_acronym);

        if (app == null || app.isEmpty()) {

            return false;
        }

        String current_permitted_group = null;

        switch (task_state) {

            case "Open": {

                current_permitted_group = (app.get(0).get("app_permit_open") != null)
                        ? app.get(0).get("app_permit_open").toString()
                        : null;
                break;
            }
            case "ToDo": {

                current_permitted_group = (app.get(0).get("app_permit_todolist") != null)
                        ? app.get(0).get("app_permit_todolist").toString()
                        : null;

                break;
            }
            case "Doing": {

                current_permitted_group = (app.get(0).get("app_permit_doing") != null)
                        ? app.get(0).get("app_permit_doing").toString()
                        : null;
                break;
            }
            case "Done": {

                current_permitted_group = (app.get(0).get("app_permit_done") != null)
                        ? app.get(0).get("app_permit_done").toString()
                        : null;
                break;
            }
            case "Create": {

                current_permitted_group = (app.get(0).get("app_permit_create") != null)
                        ? app.get(0).get("app_permit_create").toString()
                        : null;
                break;
            }
            default: {

                current_permitted_group = null;
            }
        }

        System.out.println(current_permitted_group);

        return CheckgroupService(token, current_permitted_group);
    }

    // verifies if a user is granted permission given a task's current state
    public boolean VerifyTaskPerms(String app_acronym, String token, String task_id) {

        Map<String, Object> task = GetSingleTaskService(task_id);

        if (task == null || task.isEmpty()) {

            return false;
        }

        String task_state = task.get("task_state").toString();

        return VerifyStatusPerms(app_acronym, token, task_state);
    }

    public boolean PromotingTask(String user, Map<String, Object> task, String new_state, String plan) {

        String log = "Promoted/Demoted Task state from " + task.get("task_state").toString() + " to " + new_state + ". ";
        String current_state = task.get("task_state").toString();
        String set_plan = plan;

        String current_plan = (task.get("task_plan") != null) ? task.get("task_plan").toString() : null; 

        if((set_plan != null && current_plan != null && !set_plan.equals(current_plan)) || (set_plan == null && set_plan != current_plan)) {

            log += "Updated plan from " + ((current_plan != null) ? current_plan : "-") + " to " + ((set_plan != null) ? set_plan : "-") + ". ";
        } else {

            set_plan = current_plan;
        }

        ObjectMapper mapper = new ObjectMapper();
        String json = task.get("task_notes").toString();
        Map<String, List<Map<String, String>>> map;

        try {
            map = mapper.readValue(json, new TypeReference<Map<String, List<Map<String, String>>>>(){});
        }
        catch (Exception e) {

            System.out.println(e.getMessage());
            return false;
        }

        //System.out.println(map.get("notes").toString());
        if (!log.isEmpty()) {
            
            Map<String, String> new_log = new HashMap<>();

            new_log.put("date", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")).toString());
            new_log.put("note", log);
            new_log.put("creator", user);
            new_log.put("state", current_state);

            map.get("notes").add(new_log);
        }

        String set_notes = "";

        try {

            set_notes = mapper.writeValueAsString(map);
        }
        catch (Exception e) {

            System.out.println("Exception when JSON Stringing notes:\n\t" + e.getMessage());
            return false;
        }

        boolean result = repo.PromoteTaskRepository(user, set_notes, new_state, set_plan, task.get("task_id").toString()); 

        System.out.println("get result: " + result);

        return result;
    }

    /**************************
     * End of Helper Functions*
     **************************/

    /**************************
     * Authorisation Services *
     **************************/

    public TMSUser GetUserCredentials(String username) {

        Object[] data = repo.GetUser(username);

        if (data == null) {

            return null;
        }

        TMSUser user = new TMSUser(data[0].toString(), data[1].toString());
        return user;
    }

    public boolean UpdatingUserTokenService(String username, String token) {

        return repo.UpdatingUserTokenRepository(username, token);
    }

    public boolean VerifyService(String req_token, String req_ip, String req_browser) {

        DecodedJWT decoded_jwt = DecodeJWT(req_token);

        if (decoded_jwt == null) {

            return false;
        }

        String user = decoded_jwt.getClaim("username").asString();
        String ipaddress = decoded_jwt.getClaim("ipaddress").asString();
        String browser_type = decoded_jwt.getClaim("browser").asString();

        System.out.println("username readback: " + user);
        System.out.println("browser readback: " + browser_type);
        System.out.println("ipaddress readback: " + ipaddress);

        // verify that username exists
        TMSUser verify_username = GetUserCredentials(user);

        if (verify_username == null) {

            System.out.println("Failed to find user: " + user);
            return false;
        }

        // name exists, confirm that ipaddress and browser type same

        if (!ipaddress.equals(req_ip) || !browser_type.equals(req_browser)) {

            System.out.println("Failed ip & browser type check");
            System.out.println("\tip address: " + ipaddress + " vs " + req_ip);
            System.out.println("\tbrowser type: " + browser_type + " vs " + req_browser);
            return false;
        }

        return true;
    }

    public boolean CheckgroupService(String token, String group) {

        DecodedJWT decoded_jwt;

        try {
            decoded_jwt = JWT.require(Algorithm.HMAC512(
                    "9CXbcgP+4C2Bbvgnx9K3mPXeeOV1gHmsJyQ0/JzfAEnMoPb0dk2PLvup7lzINkKy3qABG19jdgFdYAOHLWGMWbWbgPYx5QJMjLOng3OUt4A="))
                    .build()
                    .verify(token);
        } catch (Exception e) {
            System.out.println(e.getMessage());

            return false;
        }

        String user = decoded_jwt.getClaim("username").asString();

        String result = repo.CheckGroupRepository(user, group);
        return (result != null);
    }

    /*********************************
     * End of Authorisation Functions*
     *********************************/

    /***********************
     * Basic User Services *
     ***********************/

    public boolean UpdatingLogoutService(String token) {
        DecodedJWT decoded_jwt;

        try {

            decoded_jwt = JWT.require(Algorithm.HMAC512(
                    "9CXbcgP+4C2Bbvgnx9K3mPXeeOV1gHmsJyQ0/JzfAEnMoPb0dk2PLvup7lzINkKy3qABG19jdgFdYAOHLWGMWbWbgPYx5QJMjLOng3OUt4A="))
                    .build()
                    .verify(token);
        } catch (Exception e) {
            System.out.println(e.getMessage());

            return false;
        }

        String user = decoded_jwt.getClaim("username").asString();
        System.out.println("username logout readback: " + user);
        if (user == null) {
            return false;
        }

        return repo.UpdatingLogoutRepository(user, token);
    }

    public boolean UpdateOwnPasswordService(String token, String password) {

        DecodedJWT decoded_jwt;

        try {
            decoded_jwt = JWT.require(Algorithm.HMAC512(
                    "9CXbcgP+4C2Bbvgnx9K3mPXeeOV1gHmsJyQ0/JzfAEnMoPb0dk2PLvup7lzINkKy3qABG19jdgFdYAOHLWGMWbWbgPYx5QJMjLOng3OUt4A="))
                    .build()
                    .verify(token);
        } catch (Exception e) {
            System.out.println(e.getMessage());

            return false;
        }

        String user = decoded_jwt.getClaim("username").asString();

        if (!isValidPassword(password)) {
            System.out.println("The provided password did not match the required pattern.");
            return false;
        }

        String hashedPassword = bCryptPasswordEncoder.encode(password);

        return repo.UpdateOwnPasswordRepository(user, hashedPassword);
    }

    public boolean UpdateOwnEmailService(String token, String email) {
        Boolean validEmail = EmailRegexService(email);

        if (!validEmail) {
            System.out.println("Email error: " + email);

            return false;
        }
        DecodedJWT decoded_jwt = DecodeJWT(token);

        if (decoded_jwt == null) {
            return false;
        }

        String user = decoded_jwt.getClaim("username").asString();
        System.out.println("username update own email: " + user);

        return repo.UpdateOwnEmailRepository(user, email);
    }

    public List<Map<String, String>> GetGroupsService() {

        List<String> groups = repo.GetGroups();

        if (groups == null) {
            return null;
        }

        List<Map<String, String>> result = new Vector<Map<String, String>>();

        if (!groups.isEmpty()) {

            for (String group_name : groups) {

                // System.out.println(group_name);
                Map<String, String> element = new HashMap<>();
                element.put("user_groups", group_name);
                result.add(element);
            }
        }

        return result;
    }

    /******************************
     * End of Basic User Services *
     ******************************/

    /***********************
     * Admin User Services *
     ***********************/

    public boolean UpdatePasswordService(String token, String password, String userid) {

        DecodedJWT decoded_jwt = DecodeJWT(token);

        if (decoded_jwt == null) {
            return false;
        }

        Boolean checkgroup = CheckgroupService(token, "admin");
        if (!checkgroup) {
            System.out.println("no rights: " + userid);
            return false;
        }

        if (!isValidPassword(password)) {
            System.out.println("The provided password did not match the required pattern.");
            return false;
        }

        TMSUser verify_username = GetUserCredentials(userid);

        if (verify_username == null) {

            System.out.println("Failed to find user: " + userid);
            return false;
        }

        String hashedPassword = bCryptPasswordEncoder.encode(password);

        return repo.UpdateOwnPasswordRepository(userid, hashedPassword);
    }

    public boolean UpdateEmailService(String token, String email, String userid) {
        Boolean validEmail = EmailRegexService(email);

        if (!validEmail) {
            System.out.println("Email error: " + email);

            return false;
        }
        DecodedJWT decoded_jwt = DecodeJWT(token);

        if (decoded_jwt == null) {
            return false;
        }

        Boolean checkgroup = CheckgroupService(token, "admin");
        if (!checkgroup) {
            System.out.println("no rights: " + userid);
            return false;
        }
        System.out.println("username email: " + userid);

        // verify that username exists
        TMSUser verify_username = GetUserCredentials(userid);

        if (verify_username == null) {

            System.out.println("Failed to find user: " + userid);
            return false;
        }

        return repo.UpdateOwnEmailRepository(userid, email);
    }

    public boolean CreateGroupService(String token, String groupname) {

        DecodedJWT decoded_jwt = DecodeJWT(token);

        if (decoded_jwt == null) {
            return false;
        }

        Boolean checkgroup = CheckgroupService(token, "admin");
        if (!checkgroup) {

            return false;
        }

        // Need to check if groupname = null then how?
        List<String> existingGroups = repo.GetGroups();
        if (existingGroups != null && existingGroups.contains(groupname)) {
            return false;
        }

        return repo.CreateGroupRepository(token, groupname);
    }

    public boolean UpdateGroupsService(String token, String groups, String userid) {

        DecodedJWT decoded_jwt = DecodeJWT(token);

        if (decoded_jwt == null) {
            return false;
        }

        Boolean checkgroup = CheckgroupService(token, "admin");
        if (!checkgroup) {
            System.out.println("no rights: " + userid);
            return false;
        }
        System.out.println("user groups: " + groups);

        return repo.UpdateGroupsRepository(userid, groups);
    }

    public List<Map<String, Object>> GetUsersService(String user_id) {

        List<Object[]> users = (user_id == null) ? repo.GetUsersRepository() : repo.GetSingleUserRepository(user_id);

        List<Map<String, Object>> result = new Vector<Map<String, Object>>();

        if (!users.isEmpty()) {

            for (Object[] acc : users) {

                // System.out.println("User: \n\t" + acc[0] + "\n\t" + acc[1] + "\n\t" + acc[2]
                // + "\n\t" + acc[3]);

                Map<String, Object> element = new HashMap<>();
                element.put("username", acc[0].toString());
                element.put("email", (acc[1] == null) ? null : acc[1].toString());
                element.put("user_groups", (acc[2] == null) ? null : acc[2].toString());
                element.put("user_status", acc[3]);
                result.add(element);
                // System.out.println(element.toString());
            }
        }

        return result;
    }

    public boolean UpdateStatusService(int status, String userid) {
        return repo.UpdateStatusRepository(userid, status);
    }

    public boolean CreateUserService(String userid, String password, String email, String groups) {

        List<Object[]> existingUser = repo.GetSingleUserRepository(userid);
        if (existingUser == null || !existingUser.isEmpty()) {

            return false;
        }

        List<Object> existingEmail = (email != null) ? repo.CheckUserEmailRepository(email) : null;
        if (existingEmail != null && !existingEmail.isEmpty()) {

            return false;
        }

        if (!isValidPassword(password)) {
            System.out.println("The provided password did not match the required pattern.");
            return false;
        }
        String hashedPassword = bCryptPasswordEncoder.encode(password);

        return repo.CreateUserRepository(userid, hashedPassword, email, groups);
    }

    /******************************
     * End of Admin User Services *
     ******************************/

    /******************************
     * Start of Kanban Services *
     ******************************/

    /*
     * App Acronym: cannot be null
     * App Desription: can be null/empty string
     * App R_number: cannot be null, return in int
     * App Start_date: can be null
     * App End_date: can be null
     * Others : can be null
     */

    public boolean CreateAppService(String appacronym, String appdescription, int apprnumber, String appstartdate,
            String appenddate, String apppermitopen, String apppermittodo, String apppermitdoing, String apppermitdone,
            String apppermitcreate) {

        List<Object[]> existingApp = repo.GetSingleAppRepository(appacronym);
        if (existingApp == null || !existingApp.isEmpty()) {
            return false;
        }

        return repo.CreateAppRepository(appacronym, appdescription, apprnumber, appstartdate, appenddate, apppermitopen,
                apppermittodo, apppermitdoing, apppermitdone, apppermitcreate);
    }

    public List<Map<String, Object>> GetAppsService(String appacronym) {
        List<Object[]> appData;

        if (appacronym != null) {
            appData = repo.GetSingleAppRepository(appacronym);
        } else {
            appData = repo.GetAppsRepository();
        }

        List<Map<String, Object>> result = new Vector<Map<String, Object>>();

        if (appData != null && !appData.isEmpty()) {
            for (Object[] app : appData) {
                Map<String, Object> element = new HashMap<>();
                element.put("app_acronym", app[0]);
                element.put("app_description", app[1]);
                element.put("app_rnumber", app[2]);
                element.put("app_startdate", app[3]);
                element.put("app_enddate", app[4]);
                element.put("app_permit_open", app[5]);
                element.put("app_permit_todolist", app[6]);
                element.put("app_permit_doing", app[7]);
                element.put("app_permit_done", app[8]);
                element.put("app_permit_create", app[9]);
                result.add(element);
            }
        }

        return result;
    }

    public boolean CreatePlanService(String appacronym, String name, String planstartdate, String planenddate,
            String color) {

        List<Object[]> existingApp = repo.GetPlanRepository(appacronym, name);
        if (existingApp == null || !existingApp.isEmpty()) {
            return false;
        }

        return repo.CreatePlanRepository(appacronym, name, planstartdate, planenddate, color);
    }

    public List<Map<String, Object>> GetPlanService(String appacronym, String name) {
        List<Object[]> planData = repo.GetPlanRepository(appacronym, name);

        List<Map<String, Object>> result = new Vector<Map<String, Object>>();

        if (planData != null && !planData.isEmpty()) {
            for (Object[] plan : planData) {
                Map<String, Object> element = new HashMap<>();
                element.put("plan_mvp_name", plan[0]);
                element.put("plan_startdate", plan[1]);
                element.put("plan_enddate", plan[2]);
                element.put("plan_app_acronym", plan[3]);
                element.put("plan_color", plan[4]);
                result.add(element);
            }
        }

        return result;
    }

    public List<Map<String, Object>> GetPlansService(String appacronym) {
        List<Object[]> planData = repo.GetPlansRepository(appacronym);

        List<Map<String, Object>> result = new Vector<Map<String, Object>>();

        if (planData != null && !planData.isEmpty()) {
            for (Object[] plan : planData) {
                Map<String, Object> element = new HashMap<>();
                element.put("plan_mvp_name", plan[0]);
                element.put("plan_startdate", plan[1]);
                element.put("plan_enddate", plan[2]);
                element.put("plan_app_acronym", plan[3]);
                element.put("plan_color", plan[4]);
                result.add(element);
            }
        }

        return result;
    }

    public boolean EditPlanService(String appacronym, String name, String planstartdate, String planenddate,
            String color) {
        return repo.EditPlanRepository(appacronym, name, planstartdate, planenddate, color);
    }

    public boolean EditAppService(String appacronym, String appdescription, String appstartdate, String appenddate,
            String apppermitopen, String apppermittodo, String apppermitdoing, String apppermitdone,
            String apppermitcreate) {
        return repo.EditAppRepository(appacronym, appdescription, appstartdate, appenddate, apppermitopen,
                apppermittodo, apppermitdoing, apppermitdone, apppermitcreate);
    }

    public Map<String, Object> GetSingleTaskService(String taskid) {

        List<Object[]> task = repo.GetSingleTaskRepository(taskid);

        if (task == null || task.isEmpty()) {
            return null;
        }

        List<Map<String, Object>> result = new Vector<Map<String, Object>>();

        for (Object[] taskData : task) {

            // System.out.println(group_name);
            Map<String, Object> element = new HashMap<>();
            element.put("task_name", taskData[0].toString());
            element.put("task_description", (taskData[1] == null) ? null : taskData[1].toString());
            element.put("task_notes", (taskData[2] == null) ? null : taskData[2].toString());
            element.put("task_plan", (taskData[3] == null) ? null : taskData[3].toString());
            element.put("task_app_acronym", taskData[4].toString());
            element.put("task_state", taskData[5].toString());
            element.put("task_creator", taskData[6].toString());
            element.put("task_owner", (taskData[7] == null) ? null : taskData[7].toString());
            element.put("task_createdate", taskData[8].toString());
            element.put("task_id", taskData[9].toString());
            result.add(element);
        }

        return (result.size() < 2) ? result.get(0) : new HashMap<>();
    }

    public List<Map<String, Object>> GetTasksService(String appacronym) {

        List<Object[]> tasks = repo.GetTasksRepository(appacronym);

        if (tasks == null || tasks.isEmpty()) {
            return null;
        }

        List<Map<String, Object>> result = new Vector<Map<String, Object>>();

        for (Object[] taskData : tasks) {

            // System.out.println(group_name);
            Map<String, Object> element = new HashMap<>();
            element.put("task_name", taskData[0].toString());
            element.put("task_description", (taskData[1] == null) ? null : taskData[1].toString());
            element.put("task_notes", (taskData[2] == null) ? null : taskData[2].toString());
            element.put("task_plan", (taskData[3] == null) ? null : taskData[3].toString());
            element.put("task_app_acronym", taskData[4].toString());
            element.put("task_state", taskData[5].toString());
            element.put("task_creator", taskData[6].toString());
            element.put("task_owner", (taskData[7] == null) ? null : taskData[7].toString());
            element.put("task_createdate", taskData[8].toString());
            element.put("task_id", taskData[9].toString());
            result.add(element);
        }

        return result;
    }

    public boolean EditTaskService(String token, String acronym, String task_id, String plan, String notes) {

        String log = "";
        String set_plan = plan;

        Map<String, Object> task = GetSingleTaskService(task_id);

        if (task == null || task.isEmpty()) {

            return false;
        }

        String current_state = task.get("task_state").toString();
        System.out.println(current_state);

        String current_plan = (task.get("task_plan") != null) ? task.get("task_plan").toString() : null; 
        
        if(!current_state.equals("Open") && !current_state.equals("Done")) {

            set_plan = current_plan;
        } else {

            if ((set_plan != null && current_plan != null && !set_plan.equals(current_plan)) || (set_plan == null && set_plan != current_plan)) {
            
                log += "Updated plan from " + ((current_plan != null) ? current_plan : "-") + " to " + ((set_plan != null) ? set_plan : "-") + ". ";
        
            }
        }

        DecodedJWT decoded_jwt = DecodeJWT(token);
        String user = decoded_jwt.getClaim("username").asString();

        ObjectMapper mapper = new ObjectMapper();
        String json = task.get("task_notes").toString();
        Map<String, List<Map<String, String>>> map;

        try {
            map = mapper.readValue(json, new TypeReference<Map<String, List<Map<String, String>>>>() {
            });
        } catch (Exception e) {

            System.out.println(e.getMessage());
            return false;
        }

        // System.out.println(map.get("notes").toString());

        if (notes != null && !notes.isEmpty()) {

            Map<String, String> new_log = new HashMap<>();

            new_log.put("date", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")).toString());
            new_log.put("note", notes);
            new_log.put("creator", user);
            new_log.put("state", current_state);

            map.get("notes").add(new_log);

            log += "Added Notes. ";
        }

        if (!log.isEmpty()) {

            Map<String, String> new_log = new HashMap<>();

            new_log.put("date", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")).toString());
            new_log.put("note", log);
            new_log.put("creator", user);
            new_log.put("state", current_state);

            map.get("notes").add(new_log);
        }

        // System.out.println("Printing post:\n\t" + map.get("notes").toString());

        String set_notes = "";

        try {

            set_notes = mapper.writeValueAsString(map);
        } catch (Exception e) {

            System.out.println("Exception when JSON Stringing notes:\n\t" + e.getMessage());
            return false;
        }

        return repo.EditTaskRepository(set_notes, set_plan, user, task_id);
    }

    public boolean PromoteTaskService(String token, String acronym, String task_id, String plan, String promote) {

        Map<String, Object> task = GetSingleTaskService(task_id);

        if (task == null || task.isEmpty()) {

            return false;
        }

        String current_state = task.get("task_state").toString();

        DecodedJWT decoded_jwt = DecodeJWT(token);
        String user = decoded_jwt.getClaim("username").asString();
        
        Boolean result = false;

        switch (current_state) {

            case "Open": {
    
                //only able to promote to todo
                result = PromotingTask(user, task, "ToDo", plan);
                break;
            }
            case "ToDo": {
    
                //only able to promote to doing
                //assign promoter as owner
                result = PromotingTask(user, task, "Doing", plan);
                break;
            }
            case "Doing": {
    
                //able to demote or promote
                //if demote, null owner
                //if promote, send email
                if (promote.equals("promote")) {
                    
                    result = PromotingTask(user, task, "Done", plan);
    
                    if (result == true) {
    
                        //send email on success
                        System.out.println("Attempting to send email");
                        
                        List<Map<String, Object>> app_list = GetAppsService(acronym);

                        if (app_list == null || app_list.isEmpty()) {

                            System.out.println("Found no app");
                            break;
                        }

                        emailer.EmailOnPromoteDone(acronym, task.get("task_name").toString(), app_list);
                    }
                }
                else {
    
                    result = PromotingTask(user, task, "ToDo", plan);
                }
                break;
            }
            case "Done": {
    
                //able to demote or promote
                if (promote.equals("promote")) {
                
                    result = PromotingTask(user, task, "Closed", plan);
                }
                else {
    
                    result = PromotingTask(user, task, "Doing", plan);
                }
                break;
            }
            default : {
                
                return false;
            }
        }

        return result;
    }
    // do repo, clear error
    public boolean CreateTaskService(String token, String app_acronym, String taskname, String taskdesc,
            String task_plan) {

        DecodedJWT decoded_jwt = DecodeJWT(token);

        if (decoded_jwt == null) {
            return false;
        }

        String user = decoded_jwt.getClaim("username").asString();

        if (user == null) {
            return false;
        }

        List<Map<String, Object>> appData;
        appData = GetAppsService(app_acronym);

        int rnum = Integer.parseInt(appData.get(0).get("app_rnumber").toString()) + 1;
        String task_id = app_acronym + "_" + rnum;

        Map<String, List<Map<String, String>>> map = new HashMap<>();
        List<Map<String, String>> list = new Vector<Map<String, String>>();

        Map<String, String> new_log = new HashMap<>();

        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")).toString();
        new_log.put("date", date);
        new_log.put("note", "Created Task");
        new_log.put("creator", user);
        new_log.put("state", "Open");

        list.add(new_log);

        map.put("notes", list);

        String set_notes = "";

        try {

            ObjectMapper mapper = new ObjectMapper();
            set_notes = mapper.writeValueAsString(map);
        } catch (Exception e) {

            System.out.println("Exception when JSON Stringing notes:\n\t" + e.getMessage());
            return false;
        }

        System.out.println(set_notes);

        return repo.CreateTaskRepository(app_acronym, taskname, taskdesc, set_notes, task_plan, "Open",
                user, user, date, task_id);
    }

}
