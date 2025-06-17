export const auth_ui = `
    <div class="login-container">
        <div class="login-header">
            <h2>Login</h2>
        </div>
        <p id="error" style="display:none; color:red;"></p>
        <div id="login-form">
            <div class="input-group">
                <label for="username">Username /  Email</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="input-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button id="submit">Login</button>
        </div>
    </div>
`

export const content_ui = `
    <div class="grid-container">
    <div class="grid-item">
        <div class="icon">

        </div>
        <div class="user-details">
            <p class="username"></p>
            <div style="display:flex">
                <p style="font-weight:600;font-size=18px;">Username</p>
                <p class="login" style="margin-left:10px"></p>
            </div>
            <div style="display:flex">
                <p style="font-weight:600;font-size=18px;">Email</p>
                <p class="mail" style="margin-left:10px"></p>
            </div>
            <div style="display:flex">
                <p style="font-weight:600;font-size=18px;">Campus</p>
                <p class="campus" style="margin-left:10px"></p>
            </div>
        </div>
    </div>
    <div class="grid-item">
        <div class="points">
            <span>
                <p>Audit ratio :</p>
                <p id="auditRatio"></p>
            </span>

            <span>
                <p>Level</p>
                <p id="userlevel"></p>
            </span>
            <span>
                <p>Total XP</p>
                <p id="txp"></p>
            </span>
            <button id="logout"> Logout </button>
        </div>

    </div>
    <div class="grid-item">
        <div class="">
            <h2>Audits Ratio</h2>
            <div id='donught'></div>
            <div id="audits">
                <div>
                    <span  id="donestyle">
                        <div id="doneAudits"></div>
                        <p>Done </p> 
                        <p id="done">1.2</p>
                    <span>
                </div>
                <br>
                <div>
                <span  id="recievedStyle">
                    <div id="recievedAudits"></div>
                    <p>Recieved </p> 
                    <p id="recieved">1.2</p>
                <span>
                </div>
            </div>
        </div>
    </div>
    <div class="grid-item">
        <div class="points">
            <h2>XP progression</h2>
            <div id="chart-container"></div>
            <div class="tooltip" id="tooltip"></div>
        </div>
    </div>
    <div class="grid-item">
        <div class="points">
            <h3>Completed Projects</h3>
            <div class="cproject">
                <div>
                </div>
            </div>
        </div>
    </div>
    <div class="grid-item">
        <div class="points">
            <h3>Ongoing Projects</h3>
            <div class="oproject">
                <div>
                </div>
            </div>
        </div>
    </div>
`