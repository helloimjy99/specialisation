package com.tmsgrp3.backend.repository;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.query.NativeQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tmsgrp3.backend.ConfigProperties;
import com.tmsgrp3.backend.DatabaseConnection;
import com.tmsgrp3.backend.exceptions.EntityNotFoundException;

import org.hibernate.Transaction;

@Repository
@Component
public class BackendRepository {

	@Autowired
	ConfigProperties config;

	// Gets a specified user given a username
	// values returned are username and password
	public Object[] GetUser(String username) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT username, password FROM accounts WHERE username = :username AND user_status = 1";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("username", username);
			List<Object[]> list = query.list();

			if (list.isEmpty()) {

				throw new EntityNotFoundException("Failed to find username");
			}

			/*
			 * for (Object[] acc : list) {
			 * 
			 * System.out.println("printing dummy:\n\t" + acc[0]);
			 * }
			 */

			session.close();

			session.close();
			return list.get(0);
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public boolean UpdatingUserTokenRepository(String username, String token) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "UPDATE accounts SET current_session = :token WHERE username = :user";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("token", token)
					.setParameter("user", username);

			int list = query.executeUpdate();

			transaction.commit();

			session.close();

			session.close();
			return true;
		} catch (Exception e) {

			System.out.println(e.getMessage());
			return false;
		}
	}

	public boolean UpdatingLogoutRepository(String username, String token) {
		System.out.println(username);

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "UPDATE accounts SET current_session = :token WHERE username = :user";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("token", null)
					.setParameter("user", username);

			int list = query.executeUpdate();

			transaction.commit();

			session.close();
			return true;
		} catch (Exception e) {

			System.out.println(e.getMessage());
			return false;
		}
	}

	public String CheckGroupRepository(String username, String group) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT username FROM accounts " + "WHERE username = :username AND "
					+ "user_groups LIKE :groupPattern";
			String groupPattern = "%," + group + ",%";

			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("username", username)
					.setParameter("groupPattern", groupPattern);

			List<String> results = query.list();

			session.close();
			return (results.size() > 0) ? results.get(0) : null; /* return true if result list !empty */

		} catch (Exception e) {
			System.out.println("Error occurred, failed to read:\n\t" + e);
			return null;
		}
	}

	public boolean UpdateOwnPasswordRepository(String username, String hashedPassword) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "UPDATE accounts SET password=:hashedPassword WHERE username = :user";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("hashedPassword", hashedPassword)
					.setParameter("user", username);

			int updatedRowCount = query.executeUpdate();
			if (updatedRowCount == 0) {
				System.out.println("No rows were updated. Maybe the username is not present in the database?");
			}

			transaction.commit();
			session.close();
			return updatedRowCount > 0;

		} catch (Exception e) {

			System.out.println(e.getMessage());
			e.printStackTrace();

			return false;
		}
	}

	public boolean UpdateOwnEmailRepository(String username, String email) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "UPDATE accounts SET email=:newEmail WHERE username = :user";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("newEmail", email)
					.setParameter("user", username);

			int updatedRowCount = query.executeUpdate();

			transaction.commit();

			session.close();
			return (updatedRowCount > 0) ? true : false;

		} catch (Exception e) {

			System.out.println(e.getMessage());
			return false;
		}
	}

	public List<String> GetGroups() {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT user_groups FROM grouplist";

			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class);
			List<String> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public boolean CreateGroupRepository(String token, String groupname) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "INSERT INTO grouplist (user_groups) VALUES (:groupname)";
			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("groupname", groupname);

			int insertedRowCount = query.executeUpdate();
			transaction.commit();

			session.close();
			return insertedRowCount > 0;

		} catch (Exception e) {
			System.out.println("Error occurred while creating group:\n\t" + e);
			return false;
		}
	}

	public boolean UpdateGroupsRepository(String userid, String groups) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "UPDATE accounts SET user_groups= :user_groups WHERE username = :user";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("user_groups", groups)
					.setParameter("user", userid);

			int updatedRowCount = query.executeUpdate();

			transaction.commit();

			session.close();
			return (updatedRowCount > 0) ? true : false;

		} catch (Exception e) {

			System.out.println(e.getMessage());
			return false;
		}
	}

	public List<Object[]> GetSingleUserRepository(String userid) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT username, email, user_groups, user_status FROM accounts WHERE username = :user";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("user", userid);
			List<Object[]> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public List<Object[]> GetUsersRepository() {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT username, email, user_groups, user_status FROM accounts";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class);
			List<Object[]> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public boolean UpdateStatusRepository(String username, int status) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "UPDATE accounts SET user_status=:newStatus WHERE username = :user";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("newStatus", status)
					.setParameter("user", username);

			int updatedRowCount = query.executeUpdate();

			transaction.commit();

			session.close();
			return (updatedRowCount > 0) ? true : false;
		} catch (Exception e) {

			System.out.println(e.getMessage());
			return false;
		}
	}

	public List<Object> CheckUserEmailRepository(String email) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT email FROM accounts WHERE email = :email";

			NativeQuery<Object> query = session.createNativeQuery(sql_statement, Object.class)
					.setParameter("email", email);
			List<Object> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public boolean CreateUserRepository(String userid, String password, String email, String groups) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();
			String updatedEmail = email;
			if (email.isEmpty()) {
				updatedEmail = null;
			}
			String sql_statement = "INSERT INTO accounts VALUES (:username, :password, :email, :groups, 1, null)";
			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("username", userid)
					.setParameter("password", password)
					.setParameter("email", updatedEmail)
					.setParameter("groups", groups);
			System.out.println("updated email: " + updatedEmail);

			int insertedRowCount = query.executeUpdate();
			transaction.commit();

			session.close();
			return insertedRowCount > 0;

		} catch (Exception e) {
			System.out.println("Error occurred while creating group:\n\t" + e);
			return false;
		}
	}

	/******************************
	 * End of Admin User Repository *
	 ******************************/

	/******************************
	 * Start of Kanban Repository *
	 ******************************/

	public List<Object[]> GetSingleAppRepository(String appacronym) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT * FROM application WHERE app_acronym = :appacronym";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("appacronym", appacronym);
			List<Object[]> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public List<Object[]> GetAppsRepository() {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT * FROM application";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class);
			List<Object[]> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public boolean CreateAppRepository(String appacronym, String appdescription, int apprnumber,
			String appstartdate, String appenddate, String apppermitopen, String apppermittodo,
			String apppermitdoing, String apppermitdone, String apppermitcreate) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String updatedDescription = appdescription;
			if (appdescription.isEmpty()) {
				updatedDescription = null;
			}
			String updatedStartDate = appstartdate;
			if (appstartdate != null && appstartdate.isEmpty()) {
				updatedStartDate = null;
			}
			String updatedEndDate = appenddate;
			if (appenddate != null && appenddate.isEmpty()) {
				updatedEndDate = null;
			}
			String updatedPermitOpen = apppermitopen;
			if (apppermitopen != null && apppermitopen.isEmpty()) {
				updatedPermitOpen = null;
			}
			String updatedPermitToDo = apppermittodo;
			if (apppermittodo != null && apppermittodo.isEmpty()) {
				updatedPermitToDo = null;
			}
			String updatedPermitDoing = apppermitdoing;
			if (apppermitdoing != null && apppermitdoing.isEmpty()) {
				updatedPermitDoing = null;
			}
			String updatedPermitDone = apppermitdone;
			if (apppermitdone != null && apppermitdone.isEmpty()) {
				updatedPermitDone = null;
			}
			String updatedPermitCreate = apppermitcreate;
			if (apppermitcreate != null && apppermitcreate.isEmpty()) {
				updatedPermitCreate = null;
			}

			String sql_statement = "INSERT INTO application VALUES (:acronym, :description, :rnumber, :startdate, :enddate, :permitopen, :permittodo, :permitdoing, :permitdone, :permitcreate)";
			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("acronym", appacronym)
					.setParameter("description", updatedDescription)
					.setParameter("rnumber", apprnumber)
					.setParameter("startdate", updatedStartDate)
					.setParameter("enddate", updatedEndDate)
					.setParameter("permitopen", updatedPermitOpen)
					.setParameter("permittodo", updatedPermitToDo)
					.setParameter("permitdoing", updatedPermitDoing)
					.setParameter("permitdone", updatedPermitDone)
					.setParameter("permitcreate", updatedPermitCreate);

			int insertedRowCount = query.executeUpdate();
			transaction.commit();

			session.close();
			return insertedRowCount > 0;

		} catch (Exception e) {
			System.out.println("Error occurred while creating application:\n\t" + e);
			return false;
		}
	}

	public List<Object[]> GetPlanRepository(String appacronym, String name) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT * FROM plan WHERE plan_app_acronym = :appacronym AND plan_mvp_name = :name";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("appacronym", appacronym)
					.setParameter("name", name);
			List<Object[]> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public List<Object[]> GetPlansRepository(String appacronym) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT * FROM plan WHERE plan_app_acronym = :appacronym";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("appacronym", appacronym);
			List<Object[]> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to read:\n\t" + e);

			return null;
		}
	}

	public boolean CreatePlanRepository(String appacronym, String name, String planstartdate, String planenddate,
			String color) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String updatedStartDate = planstartdate;
			if (planstartdate != null && planstartdate.isEmpty()) {
				updatedStartDate = null;
			}
			String updatedEndDate = planenddate;
			if (planenddate != null && planenddate.isEmpty()) {
				updatedEndDate = null;
			}
			String updatedcolor = color;
			if (color != null && color.isEmpty()) {
				updatedcolor = null;
			}

			String sql_statement = "INSERT INTO plan VALUES (:name, :planstartdate, :planenddate, :appacronym, :color)";
			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("name", name)
					.setParameter("planstartdate", updatedStartDate)
					.setParameter("planenddate", updatedEndDate)
					.setParameter("appacronym", appacronym)
					.setParameter("color", updatedcolor);

			int insertedRowCount = query.executeUpdate();
			transaction.commit();

			session.close();
			return insertedRowCount > 0;

		} catch (Exception e) {
			System.out.println("Error occurred while creating application:\n\t" + e);
			return false;
		}
	}

	public boolean EditPlanRepository(String appacronym, String name, String planstartdate, String planenddate,
			String color) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String updatedStartDate = planstartdate;
			if (planstartdate != null && planstartdate.isEmpty()) {
				updatedStartDate = null;
			}
			String updatedEndDate = planenddate;
			if (planenddate != null && planenddate.isEmpty()) {
				updatedEndDate = null;
			}
			String updatedColor = color;
			if (color != null && color.isEmpty()) {
				updatedColor = null;
			}

			String sql_statement = "UPDATE plan SET plan_startdate=:startdate, plan_enddate=:enddate, plan_color=:color WHERE plan_app_acronym=:appacronym AND plan_mvp_name=:name";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("startdate", updatedStartDate)
					.setParameter("enddate", updatedEndDate)
					.setParameter("color", updatedColor)
					.setParameter("name", name)
					.setParameter("appacronym", appacronym);

			int updatedRowCount = query.executeUpdate();

			transaction.commit();

			session.close();
			return (updatedRowCount > 0) ? true : false;

		} catch (Exception e) {

			System.out.println(e.getMessage());
			return false;
		}
	}

	public boolean EditAppRepository(String appacronym, String appdescription, String appstartdate, String appenddate,
			String apppermitopen, String apppermittodo, String apppermitdoing, String apppermitdone,
			String apppermitcreate) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String updatedDescription = appdescription;
			if (appdescription.isEmpty()) {
				updatedDescription = null;
			}
			String updatedStartDate = appstartdate;
			if (appstartdate != null && appstartdate.isEmpty()) {
				updatedStartDate = null;
			}
			String updatedEndDate = appenddate;
			if (appenddate != null && appenddate.isEmpty()) {
				updatedEndDate = null;
			}
			String updatedPermitOpen = apppermitopen;
			if (apppermitopen != null && apppermitopen.isEmpty()) {
				updatedPermitOpen = null;
			}
			String updatedPermitToDo = apppermittodo;
			if (apppermittodo != null && apppermittodo.isEmpty()) {
				updatedPermitToDo = null;
			}
			String updatedPermitDoing = apppermitdoing;
			if (apppermitdoing != null && apppermitdoing.isEmpty()) {
				updatedPermitDoing = null;
			}
			String updatedPermitDone = apppermitdone;
			if (apppermitdone != null && apppermitdone.isEmpty()) {
				updatedPermitDone = null;
			}
			String updatedPermitCreate = apppermitcreate;
			if (apppermitcreate != null && apppermitcreate.isEmpty()) {
				updatedPermitCreate = null;
			}

			String sql_statement = "UPDATE application SET app_description=:appdescription, app_startdate=:startdate, app_enddate=:enddate, app_permit_open=:permitopen, app_permit_todolist=:permittodo, app_permit_doing=:permitdoing, app_permit_done=:permitdone, app_permit_create=:permitcreate WHERE app_acronym=:appacronym";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("appdescription", updatedDescription)
					.setParameter("startdate", updatedStartDate)
					.setParameter("enddate", updatedEndDate)
					.setParameter("permitopen", updatedPermitOpen)
					.setParameter("permittodo", updatedPermitToDo)
					.setParameter("permitdoing", updatedPermitDoing)
					.setParameter("permitdone", updatedPermitDone)
					.setParameter("permitcreate", updatedPermitCreate)
					.setParameter("appacronym", appacronym);

			int updatedRowCount = query.executeUpdate();

			transaction.commit();

			session.close();
			return (updatedRowCount > 0) ? true : false;

		} catch (Exception e) {

			System.out.println(e.getMessage());
			return false;
		}
	}

	public boolean CreateTaskRepository(String appacronym, String task_name, String taskdesc, String notes,
			String task_plan, String state, String creator, String owner, String date, String task_id) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String updatedDescription = taskdesc;
			if (taskdesc.isEmpty()) {
				updatedDescription = null;
			}
			String updatedplan = task_plan;
			if (task_plan != null && task_plan.isEmpty()) {
				updatedplan = null;
			}

			String sql_statement = "INSERT INTO task VALUES (:task_name, :updatedDescription, :notes, :updatedplan, :appacronym, :state, :creator, :owner, :date, :task_id)";
			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("task_name", task_name)
					.setParameter("updatedDescription", updatedDescription)
					.setParameter("notes", notes)
					.setParameter("updatedplan", updatedplan)
					.setParameter("appacronym", appacronym)
					.setParameter("state", state)
					.setParameter("creator", creator)
					.setParameter("owner", owner)
					.setParameter("date", date)
					.setParameter("task_id", task_id);

			int insertedRowCount = query.executeUpdate();

			if (insertedRowCount > 0) {
				boolean isUpdated = UpdateAppRNumberRepository(session, appacronym);
				if (!isUpdated) {
					transaction.rollback(); // Rollback transaction if rnumber update fails
					session.close();
					return false;
				}
			} else {
				transaction.rollback(); // Rollback transaction if the app is not found
				session.close();
				return false;
			}

			transaction.commit();
			return true;
		}

		catch (Exception e) {
			System.out.println("Error occurred while creating task:\n\t" + e);
			return false;
		}
	}

	private boolean UpdateAppRNumberRepository(Session session, String appAcronym) {
		try {
			String sql_statement = "UPDATE application SET app_rnumber = app_rnumber + 1 WHERE app_acronym = :appAcronym";

			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("appAcronym", appAcronym);

			int updatedRowCount = query.executeUpdate();

			return (updatedRowCount > 0) ? true : false;

		} catch (Exception e) {
			System.out.println("Error occurred while updating rnumber:\n\t" + e);
			return false;
		}
	}

	public List<Object[]> GetSingleTaskRepository(String taskid) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT * FROM task WHERE task_id = :taskid";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("taskid", taskid);
			List<Object[]> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to get task:\n\t" + e);

			return null;
		}
	}

	public List<Object[]> GetTasksRepository(String appacronym) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT * FROM task WHERE task_app_acronym = :appacronym";

			NativeQuery<Object[]> query = session.createNativeQuery(sql_statement, Object[].class)
					.setParameter("appacronym", appacronym);
			List<Object[]> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to get tasks:\n\t" + e);

			return null;
		}
	}

	public boolean PromoteTaskRepository(String user, String notes, String task_state, String plan, String task_id) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "UPDATE task SET task_notes = :notes, task_state = :state, task_owner = :user, task_plan = :plan WHERE task_id = :id";
			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("notes", notes)
					.setParameter("state", task_state)
					.setParameter("user", user)
					.setParameter("plan", plan)
					.setParameter("id", task_id);

			int updated_count = query.executeUpdate();
			transaction.commit();

			session.close();
			return updated_count > 0;

		} catch (Exception e) {
			System.out.println("Error occurred while promoting task:\n\t" + e);
			return false;
		}
	}

	public List<String> GetEmailsGroup(String group_name) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			String sql_statement = "SELECT email FROM accounts WHERE user_groups LIKE :group";

			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("group", "%," + group_name + ",%");
			List<String> list = query.list();

			session.close();

			return list;
		} catch (Exception e) {

			System.out.println("Error occurred, failed to get emails:\n\t" + e);

			return null;
		}
	}

	public boolean EditTaskRepository(String notes, String plan, String user, String task_id) {

		try (Session session = DatabaseConnection.getSessionFactory(config).openSession()) {

			Transaction transaction = session.beginTransaction();

			String sql_statement = "UPDATE task SET task_notes = :notes, task_plan = :plan, task_owner = :user WHERE task_id = :task_id";
			NativeQuery<String> query = session.createNativeQuery(sql_statement, String.class)
					.setParameter("notes", notes)
					.setParameter("plan", plan)
					.setParameter("user", user)
					.setParameter("task_id", task_id);

			int insertedRowCount = query.executeUpdate();
			transaction.commit();

			session.close();
			return insertedRowCount > 0;

		} catch (Exception e) {
			System.out.println("Error occurred while editing task:\n\t" + e);
			return false;
		}
	}
}
