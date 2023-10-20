package com.tmsgrp3.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tmsgrp3.backend.service.BackendService;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class BackendController {

	@Autowired
	BackendService service;

	/*********************************
	 * Authorisation Functionalities *
	 *********************************/
	@PostMapping("/verify")
	public HashMap<String, String> VerifyController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean result = service.VerifyService(token, ipaddress, browser);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Please Log In");
		}

		return map;
	}

	@PostMapping("/checkgroups")
	public HashMap<String, Object> CheckgroupController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String group = (body.get("groupname"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, Object> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.CheckgroupService(token, group);

		HashMap<String, Object> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", true);
		} else {

			map.put("error", null);
			map.put("response", false);
		}

		return map;
	}

	/***************************************
	 * End of Authorisation Functionalities*
	 ***************************************/

	/******************************
	 * Basic User Functionalities *
	 ******************************/
	@PostMapping("/log_out")
	public HashMap<String, String> LogoutController(HttpServletRequest req) {

		System.out.println("this is calling log out");
		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));

		System.out.println("token at controller" + token);

		boolean result = service.UpdatingLogoutService(token);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Please Log In");
		}
		return map;
	}

	@PostMapping("/updateownpassword")
	public HashMap<String, String> UpdateOwnPasswordController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String newpassword = (body.get("newpassword"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.UpdateOwnPasswordService(token, newpassword);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Password");
		}

		return map;
	}

	@PostMapping("/updateownemail")
	public HashMap<String, String> UpdateOwnEmailController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String email = (body.get("email"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		System.out.println("update email at controller" + email);

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.UpdateOwnEmailService(token, email);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Please enter valid email format");
		}

		return map;
	}

	@PostMapping("/groups")
	public HashMap<String, Object> GetGroupsController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (verify == false) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		List<Map<String, String>> result = service.GetGroupsService();

		HashMap<String, Object> map = new HashMap<>();

		if (result != null) {

			map.put("error", null);
			map.put("response", "ok");
			map.put("groups", result);
		} else {

			map.put("error", "Failed to get groups");
		}

		return map;
	}

	/*************************************
	 * End of Basic User Functionalities *
	 *************************************/

	/******************************
	 * Admin User Functionalities *
	 ******************************/
	@PostMapping("/updatepassword")
	public HashMap<String, String> UpdatePasswordController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String userid = (body.get("userid"));
		String newpassword = (body.get("newpassword"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.UpdatePasswordService(token, newpassword, userid);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Password");
		}

		return map;
	}

	@PostMapping("/updateemail")
	public HashMap<String, String> UpdateEmailController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String userid = (body.get("userid"));
		String email = (body.get("email"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		System.out.println("update email at controller" + email);
		System.out.println("update userid at controller" + userid);

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.UpdateEmailService(token, email, userid);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Transaction");
		}

		return map;
	}

	@PostMapping("/creategroup")
	public HashMap<String, String> CreateGroupController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String groupname = (body.get("groupname"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.CreateGroupService(token, groupname);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Group Name");
		}

		return map;
	}

	@PostMapping("/updategroups")
	public HashMap<String, String> UpdateGroupsController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String userid = (body.get("userid"));
		String groups = (body.get("groups"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		System.out.println("update groups at controller" + userid);

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.UpdateGroupsService(token, groups, userid);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Group Name");
		}

		return map;
	}

	@PostMapping("/users")
	public HashMap<String, Object> GetUsersController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String userid = (body.get("userid"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, Object> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.CheckgroupService(token, "admin");

		if (!checkgroup) {

			System.out.println("no rights");

			HashMap<String, Object> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		List<Map<String, Object>> result = service.GetUsersService(userid);
		// List<Account> result = service.GetUsersService(userid);

		HashMap<String, Object> map = new HashMap<>();

		if (result != null) {

			map.put("error", null);
			map.put("response", "ok");
			map.put("groups", result);
		} else {

			map.put("error", "Invalid User");
		}

		return map;
	}

	@PostMapping("/updatestatus")
	public HashMap<String, String> UpdateStatusController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String userid = (body.get("userid"));
		int status = Integer.parseInt(body.get("status"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		// System.out.println("update status at controller" + userid);

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.CheckgroupService(token, "admin");

		if (!checkgroup) {

			System.out.println("no rights");

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.UpdateStatusService(status, userid);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Status");
		}

		return map;
	}

	@PostMapping("/createuser")
	public HashMap<String, String> CreateUserController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String userid = (body.get("newuserid"));
		String password = (body.get("newpassword"));
		String email = (body.get("newemail"));
		String groups = (body.get("newgroups"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.CheckgroupService(token, "admin");

		if (!checkgroup) {

			System.out.println("no rights");

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.CreateUserService(userid, password, email, groups);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid User Credentials");
		}

		return map;
	}

	/*************************************
	 * End of Admin User Functionalities *
	 *************************************/

	/*************************************
	 * Start of Kanban Functionalities *
	 *************************************/

	@PostMapping("/createapp")
	public HashMap<String, String> CreateAppController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String appacronym = (body.get("acronym"));
		String appdescription = (body.get("description"));
		int apprnumber = Integer.parseInt(body.get("rnumber"));
		String appstartdate = (body.get("start_date"));
		String appenddate = (body.get("end_date"));
		String apppermitopen = (body.get("permit_open"));
		String apppermittodo = (body.get("permit_todo"));
		String apppermitdoing = (body.get("permit_doing"));
		String apppermitdone = (body.get("permit_done"));
		String apppermitcreate = (body.get("permit_create"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.CheckgroupService(token, "ProjectLeader");

		if (!checkgroup) {

			System.out.println("no rights");

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.CreateAppService(appacronym, appdescription, apprnumber, appstartdate, appenddate,
				apppermitopen, apppermittodo, apppermitdoing, apppermitdone, apppermitcreate);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Application Details");
		}

		return map;
	}

	@PostMapping("/getapp")
	public HashMap<String, Object> GetSingleAppController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String appacronym = (body.get("acronym"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (verify == false) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		List<Map<String, Object>> result = service.GetAppsService(appacronym);

		HashMap<String, Object> map = new HashMap<>();

		if (result != null) {

			map.put("error", null);
			map.put("response", "ok");
			map.put("app", (result != null && !result.isEmpty()) ? result.get(0) : new HashMap<>());
		} else {

			map.put("error", "Failed to get app");
		}

		return map;
	}

	@PostMapping("/getapps")
	public HashMap<String, Object> GetAppsController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (verify == false) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		List<Map<String, Object>> result = service.GetAppsService(null);

		HashMap<String, Object> map = new HashMap<>();

		if (result != null) {

			map.put("error", null);
			map.put("response", "ok");
			map.put("apps", result);
		} else {

			map.put("error", "Failed to get apps");
		}

		return map;
	}

	@PostMapping("/editapp")
	public HashMap<String, String> EditAppController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String appacronym = (body.get("acronym"));
		String appdescription = (body.get("description"));
		String appstartdate = (body.get("start_date"));
		String appenddate = (body.get("end_date"));
		String apppermitopen = (body.get("permit_open"));
		String apppermittodo = (body.get("permit_todo"));
		String apppermitdoing = (body.get("permit_doing"));
		String apppermitdone = (body.get("permit_done"));
		String apppermitcreate = (body.get("permit_create"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.CheckgroupService(token, "ProjectLeader");

		if (!checkgroup) {

			System.out.println("no rights");

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.EditAppService(appacronym, appdescription, appstartdate, appenddate, apppermitopen,
				apppermittodo, apppermitdoing, apppermitdone, apppermitcreate);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Status");
		}

		return map;
	}

	@PostMapping("/createplan")
	public HashMap<String, String> CreatePlanController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String appacronym = (body.get("acronym"));
		String name = (body.get("name"));
		String planstartdate = (body.get("start_date"));
		String planenddate = (body.get("end_date"));
		String color = (body.get("color"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.CheckgroupService(token, "ProjectManager");

		if (!checkgroup) {

			System.out.println("no rights");

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.CreatePlanService(appacronym, name, planstartdate, planenddate, color);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Plan Details");
		}

		return map;
	}

	@PostMapping("/getplan")
	public HashMap<String, Object> GetPlanController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String appacronym = (body.get("acronym"));
		String name = (body.get("name"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (verify == false) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		List<Map<String, Object>> result = service.GetPlanService(appacronym, name);

		HashMap<String, Object> map = new HashMap<>();

		if (result != null) {

			map.put("error", null);
			map.put("response", "ok");
			map.put("plan", (result != null && !result.isEmpty()) ? result.get(0) : new HashMap<>());
		} else {

			map.put("error", "Failed to get plan");
		}

		return map;
	}

	@PostMapping("/getplans")
	public HashMap<String, Object> GetPlansController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String appacronym = (body.get("acronym"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (verify == false) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		List<Map<String, Object>> result = service.GetPlansService(appacronym);

		HashMap<String, Object> map = new HashMap<>();

		if (result != null) {

			map.put("error", null);
			map.put("response", "ok");
			map.put("plans", result);
		} else {

			map.put("error", "Failed to get plans");
		}

		return map;
	}
	
	@PostMapping("/editplan")
	public HashMap<String, String> EditPlanController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String appacronym = (body.get("acronym"));
		String name = (body.get("name"));
		String planstartdate = (body.get("start_date"));
		String planenddate = (body.get("end_date"));
		String color = (body.get("color"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.CheckgroupService(token, "ProjectManager");

		if (!checkgroup) {

			System.out.println("no rights");

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		boolean result = service.EditPlanService(appacronym, name, planstartdate, planenddate, color);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Status");
		}

		return map;
	}

	@PostMapping("/gettask")
	public HashMap<String, Object> GetSingleTaskController(HttpServletRequest req) {
		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String taskid = (body.get("task_id"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (verify == false) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		Map<String, Object> result = service.GetSingleTaskService(taskid);

		HashMap<String, Object> map = new HashMap<>();

		if (result != null) {

			map.put("error", null);
			map.put("response", "ok");
			map.put("task", result);
		} else {

			map.put("error", "Failed to get task");
		}

		return map;
	}

	@PostMapping("/gettasks")
	public HashMap<String, Object> GetTasksController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String appacronym = (body.get("acronym"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (verify == false) {

			HashMap<String, Object> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		List<Map<String, Object>> result = service.GetTasksService(appacronym);

		HashMap<String, Object> map = new HashMap<>();

		if (result != null) {

			map.put("error", null);
			map.put("response", "ok");
			map.put("tasks", result);
		} else {

			map.put("error", "Failed to get tasks");
		}

		return map;
	}

	@PostMapping("/createtask")
	public HashMap<String, String> CreateTaskController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String app_acronym = (body.get("acronym"));
		String taskname = (body.get("taskname"));
		String taskdesc = (body.get("description"));
		String task_plan = (body.get("plan"));

		if (taskname == null || taskname == "" || taskname.isEmpty()) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please enter Task Name");

			return map;
		}

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.VerifyStatusPerms(app_acronym, token, "Create");

		if (!checkgroup) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Not Permitted");

			return map;
		}

		boolean result = service.CreateTaskService(token, app_acronym, taskname, taskdesc, task_plan);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Task Details");
		}

		return map;
	}

	@PostMapping("/promotetask")
	public HashMap<String, String> PromoteTaskController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String acronym = (body.get("acronym"));
		String task_id = (body.get("task_id"));
		String promote = (body.get("promote"));
		String plan = (body.get("plan"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.VerifyTaskPerms(acronym, token, task_id);

		if (!checkgroup) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Not Permitted");

			return map;
		}

		boolean result = service.PromoteTaskService(token, acronym, task_id, plan, promote);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Failed to promote/demote task");
		}

		return map;
	}

	@PostMapping("/edittask")
	public HashMap<String, String> EditTaskController(HttpServletRequest req) {

		HashMap<String, String> body = service.GetReqBody(req);

		if (body == null) {

			HashMap<String, String> map = new HashMap<>();
			map.put("error", "Please Log In");

			return map;
		}

		String token = (body.get("tmptoken"));
		String acronym = (body.get("acronym"));
		String task_id = (body.get("task_id"));
		String plan = (body.get("plan"));
		String notes = (body.get("notes"));

		String ipaddress = req.getRemoteAddr();
		String browser = req.getHeader("User-Agent");

		boolean verify = service.VerifyService(token, ipaddress, browser);

		if (!verify) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Please Log In");

			return map;
		}

		Boolean checkgroup = service.VerifyTaskPerms(acronym, token, task_id);

		if (!checkgroup) {

			HashMap<String, String> map = new HashMap<>();

			map.put("error", "Not Permitted");

			return map;
		}

		boolean result = service.EditTaskService(token, acronym, task_id, plan, notes);

		HashMap<String, String> map = new HashMap<>();

		if (result) {

			map.put("error", null);
			map.put("response", "ok");
		} else {

			map.put("error", "Invalid Application Details");
		}

		return map;
	}
}
