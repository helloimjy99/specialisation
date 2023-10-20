/** Definition for login page */

import '../App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { SetToken, baseurl, config } from '../Utility';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Login(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const defaultTheme = createTheme();
    
    async function SubmitLogin(event) {
        event.preventDefault();
        
        let username_check = (/^([a-zA-Z0-9]){4,12}$/).test(username);
        let password_check = (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&$%^()-_+=;:'"<,>./`~])[A-Za-z\d@$!%*#?&$%^()-_+=;:'"<,>./`~]{8,10}$/).test(password);

        if (!username_check || !password_check) {

            setPassword("");
            alert("Invalid Username/Password");
            return;
        }

        let response;

        try {

          response = await axios.post(baseurl + '/login',
              {
              
                  username: username,
                  password: password
              },
              config
          );
        }
        catch (error) {

          //axios issue, likely no connection to server
          alert("An Error has occurred, please contact server administrator");
          return;
        }

        if (!response) {

            setPassword("");
            alert("Unexpected error has occurred");
            return;
        }

        if (response.data.error) {

            setPassword("");
            alert("Invalid Username/Password");
            return;
        }

        //console.log(response.data);
        //localStorage.setItem("id", username);
        //localStorage.setItem("token", response.data.tmptoken);
        SetToken(response.data.tmptoken);
        
        //alert("Log In Success");
        props.login(true);
        return;
    };

    /*return (
        <div>
            
            <form onSubmit={SubmitLogin}>
                <div className="login-container">
                    <label> Username: 
                        <br></br>
                        <input
                            type="text"
                            value={username}
                            onChange={(input_user) => setUsername(input_user.target.value)}
                        >
                        </input>
                    </label>
                    <br></br>
                    <label> Password: 
                        <br></br>
                        <input
                            type={'password'}
                            value={password}
                            onChange={(input_pass) => setPassword(input_pass.target.value)}
                        >
                        </input>
                    </label>
                    <br></br>
                    <button type = "submit">Log In</button>
                </div>
            </form>
        </div>
    )*/
    
    useEffect(() => {
      
      document.title ="Login | TMS"
    }, [])

    return (
        <ThemeProvider theme={defaultTheme}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              <Box component="form" onSubmit={SubmitLogin} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  value={username}
                  onChange={(input_user) => setUsername(input_user.target.value)}
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(input_pass) => setPassword(input_pass.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
<<<<<<< HEAD
                  Authenticate
=======
                  Look out
>>>>>>> main
                </Button>
                
              </Box>
            </Box>
          </Container>
        </ThemeProvider>
      );

};

export default Login;
