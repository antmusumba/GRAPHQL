const URL = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';
const campus = "https://learn.zone01kisumu.ke"
import { AUTH_TOKEN } from "./auth/auth.js";
import { content_ui } from "./auth/ui.js";
import { generateDonutChart } from "./graphs/donught.js";
import { LineGraph } from "./graphs/progress.js";
import { graphql_query } from "./query.js";

export default class Data {
    constructor() {
        this.authToken = localStorage.getItem(AUTH_TOKEN);
        // Inject UI
        this.addUI();
        this.changeUI();
    }

    async fetchData() {
        const res = await fetch(URL, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`,
            },
            body: JSON.stringify({ query: graphql_query })
        });

        const result = await res.json()
        return result['data']
    }

    addUI() {
        document.getElementById('content').innerHTML = content_ui;
    }
    async changeUI() {
        const queryData = await this.fetchData();
        function roundToTwoDecimalPlaces(num) {

            let rounded = Math.floor(num * 100);
            const nextDigit = Math.floor((num * 1000) % 10);


            if (nextDigit > 5) {
                rounded += 1;
            }


            return rounded / 100;
        }


        queryData['user'].forEach(element => {

            // User Details;
            document.querySelector('.icon').textContent = element.firstName[0]
            document.querySelector('.username').textContent = element['firstName'] + ' ' + element['lastName']
            document.querySelector('.login').textContent = element['login']
            document.querySelector('.mail').textContent = element['email']
            document.querySelector('.campus').textContent = element['campus']

            document.getElementById('auditRatio').textContent = roundToTwoDecimalPlaces(Number(element['auditRatio']))

            // Display Level
            const level = document.getElementById('userlevel');
            level.textContent = element['events'][0]['level']

            // Progress Section
            const xp = element['xp']
            LineGraph(xp)


            // Completed Projects
            const cprojects = document.querySelector('.cproject');
            element.completed_projects.forEach(project => {
                const name = function (path) {
                    const arr = path.split('/')
                    return arr.pop()
                };
                cprojects.innerHTML += `
                <div style="display:flex; justify-content:start; align-items:center" id="complete">
                    <p style="font-size:18px">${name(project.group.path)}</p>
                    <a style="margin-left:20px">${project.group.path}</a>
                <div>
                `
            });


            // Display user ongoing projects
            const oprojects = document.querySelector('.oproject');
            if (element.current_projects.length > 0) {
                element.current_projects.forEach(project => {
                    const name = function (path) {
                        const arr = path.split('/')
                        return arr.pop()
                    };
                    oprojects.innerHTML += `
                    <div style="display:flex; justify-content:start; align-items:center" id="complete">
                        <p style="font-size:18px">${name(project.group.path)}</p>
                        <a style="margin-left:20px">${project.group.path}</a>
                    <div>
                    `
                });

            } else {
                oprojects.textContent = "No ongoing projects"
            }

            function formatKB(bytes) {
                const kilobytes = bytes / 1000;
                const megabytes = kilobytes / 1000;

                if (megabytes >= 1) {
                    const roundedMB = Math.round(megabytes * 10) / 10;
                    return `${roundedMB}MB`;
                } else {
                    const roundedKB = Math.round(kilobytes);
                    return `${roundedKB}KB`;
                }
            }
            function formatKBDone(bytes) {
                const kilobytes = bytes / 1000;
                const megabytes = kilobytes / 1000;

                if (megabytes >= 1) {
                    const roundedMB = Math.round(megabytes * 100) / 100;
                    return `${roundedMB}MB`;
                } else {
                    const roundedKB = Math.round(kilobytes);
                    return `${roundedKB}KB`;
                }
            }

            // Total xp
            document.getElementById('txp').textContent = formatKB(Number(element.totalXp.aggregate.sum.amount));
            generateDonutChart(element.totalDown, element.totalUp)

            document.getElementById('done').textContent = formatKBDone(element.totalUp)
            document.getElementById('recieved').textContent = formatKBDone(element.totalDown)
        });


        document.getElementById('logout').addEventListener('click', () => {
            localStorage.clear()
            location.reload()
        });
    }
}
