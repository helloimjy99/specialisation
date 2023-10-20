/** Definition for kanban page*/

import '../App.css';
import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logout from '../Logout';
import { GetToken, config, baseurl, VerifyKanbanPerm, VerifyCurrent, CheckGroup, VerifyPLPerms } from '../Utility';
import axios from 'axios';
import PlanList from '../PlanList';

import Button from '@mui/material/Button';
import { Grid, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHeadmui from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TaskModal from '../TaskModal';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';

function Kanban(props) {

    const [currentTaskID, setCurrentTaskID] = useState("");
    const [currentTaskName, setCurrentTaskName] = useState("");
    const [openTask, setOpenTask] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [openPlanList, setOpenPlanList] = useState(false);
    const [PM, setPM] = useState(false);
    const [create, setCreate] = useState(false);
    const [open, setOpen] = useState(false);
    const [todo, setTodo] = useState(false);
    const [doing, setDoing] = useState(false);
    const [done, setDone] = useState(false);
    const [refresh, setRefresh] = useState(true);
    const [promote, setPromote] = useState(false);
    const [allowedit, setAllowedit] = useState(false);
    const [plans, setPlans] = useState([]);

    const navigate = useNavigate();

    const defaultTheme = createTheme();

    const HandleRefresh = async () => {

        let verify = await VerifyCurrent();

        if (!verify) {

            HandleLogout(null);
            return;
        }

        setRefresh(true);
    }

    const HandleOpenPlanListModal = async () => {
        
        let verify = await VerifyCurrent()//VerifyPMPerms();

        if (!verify) {

            HandleLogout(null);
            return;
        }

        setOpenPlanList(true);
    }

    const setOpenEditTaskModal = async (taskid, taskname, state, promotetype = null) => {

        
        let verify;
        if (!state) {
            
            verify = await VerifyPLPerms();

            if (!verify) {
    
                HandleLogout(null);
                return;
            }

            setAllowedit(verify);
        }
        else {

            verify = await VerifyCurrent();

            if (!verify) {
    
                HandleLogout(null);
                return;
            }

            let editperm = await VerifyKanbanPerm(props.acronym, state);

            /*if (!editperm) {

                setRefresh(true);
                return;
            }*/

            setAllowedit(editperm);
            //console.log(editperm);
        } 

        //console.log(promotetype);
        setPromote(promotetype);
        setCurrentTaskID(taskid);
        setCurrentTaskName(taskname);
        setOpenTask(true);
    };

    function HandleLogout(event) {
    
        Logout(event, props.logout);
    }

    async function HandlePromote(taskid, state, promote, taskname) {

        let verify = await VerifyCurrent()

        if (!verify) {

            HandleLogout(null);
            return;
        }

        let kanban = await VerifyKanbanPerm(props.acronym, state);

        if (!kanban) {

            HandleLogout(null);
            return;
        }

        //console.log("opening");
        setOpenEditTaskModal(taskid, taskname, state, promote);
    }


    useEffect(() => {

        async function PermsCheck() {

            let verify = await VerifyCurrent();

            if (!verify) {

                Logout(null, props.logout);
                return;
            }

            let pmperm = await CheckGroup("ProjectManager");
            setPM(pmperm);

            let createperm = await VerifyKanbanPerm(props.acronym, "Create");
            let openperm = await VerifyKanbanPerm(props.acronym, "Open");
            let todoperm = await VerifyKanbanPerm(props.acronym, "Todo");
            let doingperm = await VerifyKanbanPerm(props.acronym, "Doing");
            let doneperm = await VerifyKanbanPerm(props.acronym, "Done");

            setCreate(createperm);
            setOpen(openperm);
            setTodo(todoperm);
            setDoing(doingperm);
            setDone(doneperm);
        }

        async function getTasks() {

            setTasks([]);

            let verify = await VerifyCurrent();

            if (!verify) {

                Logout(null, props.logout);
                return;
            }

            let token = GetToken();
            
            if (!token) {
            
                Logout(null, props.logout);
                return;
            }
            
            let response;
            
            try {

                response = await axios.post(baseurl + '/gettasks',
                    {
                    
                        tmptoken: token,
                        acronym: props.acronym
                    },
                    config
                );
            }
            catch (error) {

                //axios issue, likely no connection to server
                alert("An Error has occurred, please contact server administrator");
                return;
            }

            if (response && !response.data.error) {
            
                //no error on return, valid
                setTasks(response.data.tasks);
                //console.log(response.data.tasks);
                return;
            }
            
            //response not expected
            return; 
        }

        async function getPlans() {

            let verify = await VerifyCurrent();

            if (!verify) {

                Logout(null, props.logout);
                return false;
            }

            let token = GetToken();
            let response;

            try {

                response = await axios.post(baseurl + '/getplans',
                    {
                    
                        tmptoken: token,
                        acronym: props.acronym
                    },
                    config
                );
            }
            catch (error) {

                //axios issue, likely no connection to server
                alert("An Error has occurred, please contact server administrator");
                return;
            }

            if (response && !response.error) {

                //no error on return, valid
                //console.log(response.data.plans);
                setPlans(response.data.plans);

                return true;
            }

            //response not expected
            return false; 
        }

        if (refresh) {

            PermsCheck();
            getTasks();
            getPlans();
        }
        
        document.title ="Task Management | TMS"
        setRefresh(false);
    }, [refresh])
    
    return (
        <div>
            <ThemeProvider theme={defaultTheme}>
                <CssBaseline/>
                <Grid
                    align="left"
                >
                    <Stack direction="row" spacing={2}>
                        <Typography variant="h5" component="h5">
                            Task Management System {(props.acronym) ? (`: ${props.acronym}`) : ""}
                        </Typography>

                        <Button variant="contained" onClick={() => navigate("/home")}>Home</Button>
                        <Button variant="contained" onClick={HandleLogout}>Logout</Button>
                    </Stack>
                </Grid>
                <br/>
                <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={() => HandleOpenPlanListModal()}>Plans</Button>
                        {create &&
                        <Button variant="contained" onClick={() => setOpenEditTaskModal(null)}>Create New Task</Button>
                        }
                        <IconButton onClick={() => HandleRefresh()}>
                            <RefreshIcon/>
                        </IconButton>
                </Stack>
                <PlanList logout={props.logout} acronym={props.acronym} opened={openPlanList} setOpen={setOpenPlanList} refresh={setRefresh}/>
                <TaskModal taskname={currentTaskName} setTaskName={setCurrentTaskName} taskid={currentTaskID} setTaskID={setCurrentTaskID} logout={props.logout} acronym={props.acronym} opened={openTask} setOpen={setOpenTask} refresh={setRefresh} promote={promote} setPromote={setPromote} edit={allowedit} setEdit={setAllowedit}/>
                <br/>
                <br/>

                <Stack direction="row" spacing={1}>

                    
                    <TableContainer component={Paper} className="tableAlt">
                        <Table sx={{ minWidth: 50 }} size="small" aria-label="a dense table">
                            <TableHeadmui>
                                <TableRow>
                                    <TableCell>Open</TableCell>
                                </TableRow>
                            </TableHeadmui>
                            
                            <TableBody>
                                {tasks.filter(task => task.task_state === "Open").map((item) => (
                                    <TableRow key={item.task_id}>
                                        <TableCell scope="row"  
                                            sx={{
                                                borderLeft: "solid " + ((item.task_plan && plans.length > 0 && plans.find((plan) => plan.plan_mvp_name === item.task_plan)) ? plans.find((plan) => plan.plan_mvp_name === item.task_plan).plan_color : "#FFFFFF") + " 5px"
                                            }}
                                        >
                                            {item.task_name}
                                            <br/>
                                            Plan: {(item.task_plan) ? item.task_plan : "-"}
                                            <br/>
                                            <Stack direction="row">
                                                <IconButton onClick={() => setOpenEditTaskModal(item.task_id, item.task_name, "Open")}>
                                                    <SearchIcon/>
                                                </IconButton>
                                                {open &&
                                                <IconButton onClick={() => HandlePromote(item.task_id, "Open", "promote", item.task_name)}>
                                                    <ArrowForwardIcon/>
                                                </IconButton>
                                                }
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TableContainer component={Paper} className="tableAlt">
                        <Table sx={{ minWidth: 50 }} size="small" aria-label="a dense table">
                            <TableHeadmui>
                                <TableRow>
                                    <TableCell>To-Do</TableCell>
                                </TableRow>
                            </TableHeadmui>
                            
                            <TableBody>
                                {tasks.filter(task => task.task_state === "ToDo").map((item) => (
                                    <TableRow key={item.task_id}>
                                        <TableCell scope="row" 
                                            sx={{
                                                borderLeft: "solid " + ((item.task_plan && plans.length > 0 && plans.find((plan) => plan.plan_mvp_name === item.task_plan)) ? plans.find((plan) => plan.plan_mvp_name === item.task_plan).plan_color : "#FFFFFF") + " 5px"                                            }}
                                        >
                                            {item.task_name}
                                            <br/>
                                            Plan: {(item.task_plan) ? item.task_plan : "-"}
                                            <br/>
                                            <IconButton onClick={() => setOpenEditTaskModal(item.task_id, item.task_name, "Todo")}>
                                                <SearchIcon/>
                                            </IconButton>
                                            {todo &&
                                            <IconButton onClick={() => HandlePromote(item.task_id, "Todo", "promote", item.task_name)}>
                                                <ArrowForwardIcon/>
                                            </IconButton>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TableContainer component={Paper} className="tableAlt">
                        <Table sx={{ minWidth: 50 }} size="small" aria-label="a dense table">
                            <TableHeadmui>
                                <TableRow>
                                    <TableCell>Doing</TableCell>
                                </TableRow>
                            </TableHeadmui>
                            
                            <TableBody>
                                {tasks.filter(task => task.task_state === "Doing").map((item) => (
                                    <TableRow key={item.task_id}>
                                        <TableCell scope="row" 
                                            sx={{
                                                borderLeft: "solid " + ((item.task_plan && plans.length > 0 && plans.find((plan) => plan.plan_mvp_name === item.task_plan)) ? plans.find((plan) => plan.plan_mvp_name === item.task_plan).plan_color : "#FFFFFF") + " 5px"                                            }}
                                        >
                                            {item.task_name}
                                            <br/>
                                            Plan: {(item.task_plan) ? item.task_plan : "-"}
                                            <br/>
                                            {doing &&
                                            <IconButton onClick={() => HandlePromote(item.task_id, "Doing", "demote", item.task_name)}>
                                                <ArrowBackIcon/>
                                            </IconButton>
                                            }
                                            <IconButton onClick={() => setOpenEditTaskModal(item.task_id, item.task_name, "Doing")}>
                                                <SearchIcon/>
                                            </IconButton>
                                            {doing &&
                                            <IconButton onClick={() => HandlePromote(item.task_id, "Doing", "promote", item.task_name)}>
                                                <ArrowForwardIcon/>
                                            </IconButton>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TableContainer component={Paper} className="tableAlt">
                        <Table sx={{ minWidth: 50 }} size="small" aria-label="a dense table">
                            <TableHeadmui>
                                <TableRow>
                                    <TableCell>Done</TableCell>
                                </TableRow>
                            </TableHeadmui>
                            
                            <TableBody>
                                {tasks.filter(task => task.task_state === "Done").map((item) => (
                                    <TableRow key={item.task_id}>
                                        <TableCell scope="row" 
                                            sx={{
                                                borderLeft: "solid " + ((item.task_plan && plans.length > 0 && plans.find((plan) => plan.plan_mvp_name === item.task_plan)) ? plans.find((plan) => plan.plan_mvp_name === item.task_plan).plan_color : "#FFFFFF") + " 5px"                                            }}
                                        >
                                            {item.task_name}
                                            <br/>
                                            Plan: {(item.task_plan) ? item.task_plan : "-"}

                                            <br/>
                                            {done &&
                                            <IconButton onClick={() => HandlePromote(item.task_id, "Done", "demote", item.task_name)}>
                                                <ArrowBackIcon/>
                                            </IconButton>
                                            }
                                            <IconButton onClick={() => setOpenEditTaskModal(item.task_id, item.task_name, "Done")}>
                                                <SearchIcon/>
                                            </IconButton>
                                            {done &&
                                            <IconButton onClick={() => HandlePromote(item.task_id, "Done", "promote", item.task_name)}>
                                                <ArrowForwardIcon/>
                                            </IconButton>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TableContainer component={Paper} className="tableAlt">
                        <Table sx={{ minWidth: 50 }} size="small" aria-label="a dense table">
                            <TableHeadmui>
                                <TableRow>
                                    <TableCell>Closed</TableCell>
                                </TableRow>
                            </TableHeadmui>
                            
                            <TableBody>
                                {tasks.filter(task => task.task_state === "Closed").map((item) => (
                                    <TableRow key={item.task_id}>
                                        <TableCell scope="row"  
                                            sx={{
                                                borderLeft: "solid " + ((item.task_plan && plans.length > 0 && plans.find((plan) => plan.plan_mvp_name === item.task_plan)) ? plans.find((plan) => plan.plan_mvp_name === item.task_plan).plan_color : "#FFFFFF") + " 5px"                                            }}
                                        >
                                            {item.task_name}
                                            <br/>
                                            Plan: {(item.task_plan) ? item.task_plan : "-"}
                                            <>
                                                <br/>
                                                <IconButton onClick={() => setOpenEditTaskModal(item.task_id, item.task_name, "Closed")}>
                                                    <SearchIcon/>
                                                </IconButton>
                                            </>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </ThemeProvider>
        </div>
    )
};

export default Kanban;