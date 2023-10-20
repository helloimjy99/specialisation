/** Definition of Application modal 
 *      Used to both create and edit an application
 */
import { grouplist_style, style, VerifyCurrent, VerifyKanbanPerm, VerifyPLPerms } from '../Utility';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Logout from '../Logout';
import { GetToken, baseurl, config } from '../Utility';

import { Modal } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

function TaskModal(props) {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [log, setLog] = useState("");
    const [notes, setNotes] = useState("");
    const [plans, setPlans] = useState([]);
    const [plan, setPlan] = useState("");
    const [creator, setCreator] = useState("");
    const [owner, setOwner] = useState("");
    const [state, setState] = useState("");
    const [id, setID] = useState("");

    const [modalStatus, setModalStatus] = useState("");

    const clearModal = () => {

        setName("");
        setDescription("");
        setNotes("");
        setPlan("");
    }

    const exitModal = () => {

        setCreator("");
        setOwner("");
        setState("");
        setLog("");
        setPlans([]);
        clearModal();
        setModalStatus("");
        props.setTaskName("");
        props.setTaskID("");
        props.setPromote(null);
        props.refresh(true);
        props.setEdit(false);
        props.setOpen(false);
    }

    async function HandleInputName(event) {

        event.preventDefault();
        setName(event.target.value);

        if (event.target.value !== "") {
            
            event.target.setCustomValidity('');
            return;
        }

        event.target.reportValidity();
        event.target.setCustomValidity('Empty Task Name not allowed');
        return;
    }

    async function HandleInputDesc(event) {

        event.preventDefault();
        setDescription(event.target.value);
    }

    async function HandleInputNotes(event) {

        event.preventDefault();
        setNotes(event.target.value);
    }

    async function HandleSubmitPromote() {

        let promote_result;

        try {
            
            promote_result = await axios.post(baseurl + '/promotetask',
                {
                
                    tmptoken: GetToken(),
                    acronym: props.acronym,
                    task_id: props.taskid,
                    promote: props.promote,
                    plan: plan
                },
                config
            );
        }
        catch (error) {

            //console.log(error);
            return false;
        }

        if (promote_result && promote_result.data.error) {

            //console.log(promote_result.data.error);
            return false;
        }

        return true;
    }

    async function HandleSubmitCreate() {

        let createapp_result;
        try {

            createapp_result = await axios.post(baseurl + '/createtask',
                {
                
                    tmptoken: GetToken(),
                    acronym: props.acronym,
                    description: description,
                    plan: plan,
                    taskname: name
                },
                config
            );
        }
        catch (error) {

            //console.log(error);
            return false;
        }

        if (createapp_result.data.error) {

            //console.log("error");
            return false;
        }

        return true;
    }

    async function HandleSubmitEdit() {
        
        let editapp_result;
        try {

            editapp_result = await axios.post(baseurl + '/edittask',
                {
                
                    tmptoken: GetToken(),
                    acronym: props.acronym,
                    notes: notes,
                    plan: plan,
                    task_id: props.taskid
                },
                config
            );
        }
        catch (error) {

            //console.log(error);
            return false;
        }

        if (editapp_result.error) {

            return false;
        }

        return true
    }

    async function HandleSubmit(event) {

        event.preventDefault();

        if (!event.target.checkValidity()) {
            
            setModalStatus("Invalid Input");
            return;
        }

        if (!props.taskid) {

            let verify = await VerifyPLPerms();

            if (!verify) {
    
                Logout(null, props.logout);
                return;
            }

            let result = await HandleSubmitCreate();

            if (result) {

                alert("Task created");
                clearModal();
                setModalStatus("Task Created");
                props.refresh(true);
            }
            else {

                alert("Failed to create Task");
                setModalStatus("Failed to create Task, task name may currently be in use");
            }
        }
        else {

            let verify = await VerifyCurrent();

            if (!verify) {
    
                Logout(null, props.logout);
                //console.log("failed verification");
                return;
            }

            let kanban = await VerifyKanbanPerm(props.acronym, state);

            if (!kanban) {
    
                Logout(null, props.logout);
                //console.log("failed verification");
                return;
            }

            if (props.promote === null) {

                let result = await HandleSubmitEdit();

                if (result) {

                    alert("Task edited");
                    props.refresh(true);
                    exitModal();
                }
                else {

                    alert("Failed to edit Task");
                    setModalStatus("Failed to edit Task");
                }
            }
            else {

                let result = await HandleSubmitEdit();

                if (result) {
                    
                    let notes_result = await HandleSubmitPromote();

                    if (props.promote === "promote") {

                        alert("Task promoted");
                    }
                    else {

                        alert("Task demoted")
                    }
                    props.refresh(true);
                    exitModal();
                }
            }
        }
    }

    useEffect(() => {

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
                setPlans(response.data.plans);

                return true;
            }

            //response not expected
            return false; 
        }

        getPlans();
    }, [props.opened])

    useEffect(() => {
        async function getTask() {

            //to run if editing existing task
            //can assume already cleared right before accessing page
            let verify = await VerifyCurrent();

            if (!verify) {

                Logout(null, props.logout);
                return false;
            }

            let token = GetToken();
            
            let gettask_result;

            try {

                gettask_result = await axios.post(baseurl + '/gettask',
                    {
                    
                        tmptoken: token,
                        task_id: props.taskid
                    },
                    config
                );
            }
            catch (error) {

                //console.log(error);
                return false;
            }

            if (gettask_result.data.error || gettask_result.data.task.length < 1) {

                return false;
            }

            let task = gettask_result.data.task;
            setName(task.task_name);
            setDescription(task.task_description);
            
            //convert log into legible text
            let stringed_log = "";
            let objlog = JSON.parse(task.task_notes);

            objlog["notes"].toReversed().map((entry) => {

                stringed_log += "Date: " + entry.date + "\nOwner: " + entry.creator + "\nTask State: " + entry.state + "\n" + entry.note + "\n---------------------------------------\n\n";
            });
            
            setLog(stringed_log);
            setPlan((task.task_plan) ? task.task_plan : "");
            setCreator(task.task_creator);
            setOwner(task.task_owner);
            setState(task.task_state);
            setID(props.taskid)

            //console.log(task);

            return true;
        }

        if (props.taskid) {

            //get application specific info
            getTask();
        }
    }, [props.taskid])
    
    return (
        <Modal 
            open={props.opened}
            onClose={exitModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={grouplist_style}>
                
                <Stack direction="row">
                    <Typography variant="h6" component="h6">
                        {(props.taskid) ? (props.promote === null) ? ((props.edit) ? "Edit " + props.taskname : "View " + props.taskname)  : ((props.promote === "promote") ? "Promote " + props.taskname : "Demote " + props.taskname) : "Create New Task"}
                    </Typography>
                    <IconButton sx={{float: "right"}} onClick={() => exitModal() }>
                        <CloseIcon/>
                    </IconButton>
                </Stack>
                
                {(modalStatus!=="") && <div style={{ color: 'red' }}>{modalStatus}</div>}
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box component="form" onSubmit={HandleSubmit} noValidate>
                        {(!props.taskid) &&
                        <>
                            <label>Name</label>
                            <TextField
                                margin="normal"
                                required={(!props.taskid)}
                                fullWidth
                                id="name"
                                value={name}
                                onChange={(input_taskname) => HandleInputName(input_taskname)}
                                autoFocus={(!props.taskid)}
                            />
                        </>
                        }
                        <label>Description</label>
                        <TextareaAutosize
                            margin="normal"
                            minRows={9}
                            maxRows={20}
                            style={{ width: "100%" }}
                            label="Description"
                            id="description"
                            value={description}
                            disabled={(props.taskid)}
                            onChange={(input_desc) => HandleInputDesc(input_desc)}
                        />
                        {props.taskid &&
                        <>
                            <br/>
                            <label>Audit Log</label>
                            <TextareaAutosize
                                margin="normal"
                                minRows={9}
                                maxRows={20}
                                style={{ width: "100%" }}
                                label="log"
                                id="log"
                                value={log}
                                disabled={true}
                            />
                            {((props.edit) && ((props.taskid && state && state !== "Closed") || (!props.taskid))) &&
                            <>
                                <br/>
                                <label>Notes</label>
                                <TextareaAutosize
                                    margin="normal"
                                    minRows={9}
                                    maxRows={20}
                                    style={{ width: "100%" }}
                                    label="log"
                                    id="log"
                                    value={notes}
                                    onChange={(input_notes) => HandleInputNotes(input_notes)}
                                />
                            </>
                            }
                        </>
                        }
                        <FormControl fullWidth>
                            <InputLabel id="plan">Plan</InputLabel>
                            <Select
                            labelId="plan"
                            id="plan"
                            value={plan}
                            label="Plan"
                            disabled={!((props.edit) && ((props.taskid && state && state === "Done" && props.promote && props.promote === "demote") || (props.taskid && state && state === "Open") || (!props.taskid)))}
                            onChange={(e) => setPlan(e.target.value)}
                            >
                            <MenuItem value={""}>None</MenuItem>
                            {plans && 
                                plans.map((item) => (

                                    <MenuItem key={item.plan_mvp_name} value={item.plan_mvp_name}>{item.plan_mvp_name}</MenuItem>
                                ))
                            }
                            </Select>
                        </FormControl>

                        {(props.taskid) &&
                        <>
                        <Stack direction="row">
                            <TextField
                                fullWidth
                                margin="normal"
                                id="state"
                                value={state}
                                label="Task State"
                                disabled={true}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                id="owner"
                                value={(owner) ? owner : "-"}
                                label="Task Owner"
                                disabled={true}
                            />
                        </Stack>
                        
                        <TextField
                            fullWidth
                            margin="normal"
                            id="id"
                            value={(id) ? id : "-"}
                            label="Task ID"
                            disabled={true}
                        />
                        </>
                        }
                        

                        {((props.edit === true) && ((props.taskid && state && state !== "Closed") || (!props.taskid))) &&
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {((props.taskid) ? (props.promote !== null) ? (props.promote === "promote") ? "Promote" : "Demote" : "Save" : "Create")}
                        </Button>
                        }
                    </Box>
                </Container>
            </Box>
        </Modal>
    );
}

export default TaskModal;