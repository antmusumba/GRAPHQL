// Configuration
const API_BASE = 'https://api/learn.zone01kisumu.ke/api';
        const GRAPHQL_ENDPOINT = `${API_BASE}/graphql-engine/v1/graphql`;
        const AUTH_ENDPOINT = `${API_BASE}/auth/signin`;

        let authToken = null;
        let userData = {};

        // DOM Elements
        const loginContainer = document.getElementById('loginContainer');
        const profileContainer = document.getElementById('profileContainer');
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        const logoutBtn = document.getElementById('logoutBtn');

        // Authentication Functions
        function encodeCredentials(username, password) {
            return btoa(`${username}:${password}`);
        }

        async function login(credentials) {
            try {
                const response = await fetch(AUTH_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Invalid credentials');
                }

                const data = await response.text();
                return data; // JWT token
            } catch (error) {
                throw new Error('Login failed: ' + error.message);
            }
        }

        // GraphQL Query Functions
        async function graphqlQuery(query, variables = {}) {
            try {
                const response = await fetch(GRAPHQL_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query, variables })
                });

                const data = await response.json();
                if (data.errors) {
                    throw new Error(data.errors[0].message);
                }
                return data.data;
            } catch (error) {
                console.error('GraphQL Error:', error);
                throw error;
            }
        }

        // Data Fetching Functions
        async function fetchUserData() {
            const query = `
                query {
                    user {
                        id
                        login
                    }
                }
            `;
            return await graphqlQuery(query);
        }

        async function fetchXPData() {
            const query = `
                query {
                    transaction(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
                        amount
                        createdAt
                        path
                    }
                }
            `;
            return await graphqlQuery(query);
        }

        async function fetchProgressData() {
            const query = `
                query {
                    progress {
                        grade
                        path
                        createdAt
                    }
                }
            `;
            return await graphqlQuery(query);
        }

        // Chart Creation Functions
        function createXPChart(xpData) {
            const svg = document.getElementById('xpChart');
            const width = 800;
            const height = 400;
            const margin = { top: 20, right: 30, bottom: 40, left: 60 };
            
            svg.innerHTML = '';
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

            // Process data for cumulative XP
            let cumulativeXP = 0;
            const processedData = xpData.map(d => {
                cumulativeXP += d.amount;
                return {
                    date: new Date(d.createdAt),
                    xp: cumulativeXP,
                    amount: d.amount
                };
            });

            if (processedData.length === 0) return;

            const xScale = (i) => margin.left + (i / (processedData.length - 1)) * (width - margin.left - margin.right);
            const maxXP = Math.max(...processedData.map(d => d.xp));
            const yScale = (xp) => height - margin.bottom - (xp / maxXP) * (height - margin.top - margin.bottom);

            // Create path
            let pathData = `M ${xScale(0)} ${yScale(processedData[0].xp)}`;
            for (let i = 1; i < processedData.length; i++) {
                pathData += ` L ${xScale(i)} ${yScale(processedData[i].xp)}`;
            }

            // Add gradient area
            const areaPath = pathData + ` L ${xScale(processedData.length - 1)} ${height - margin.bottom} L ${xScale(0)} ${height - margin.bottom} Z`;
            
            const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            area.setAttribute('d', areaPath);
            area.setAttribute('fill', 'url(#xpGradient)');
            svg.appendChild(area);

            // Add line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            line.setAttribute('d', pathData);
            line.setAttribute('fill', 'none');
            line.setAttribute('stroke', '#5a67d8');
            line.setAttribute('stroke-width', '3');
            svg.appendChild(line);

            // Add points
            processedData.forEach((d, i) => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', xScale(i));
                circle.setAttribute('cy', yScale(d.xp));
                circle.setAttribute('r', '4');
                circle.setAttribute('fill', '#5a67d8');
                circle.setAttribute('stroke', 'white');
                circle.setAttribute('stroke-width', '2');
                circle.style.cursor = 'pointer';
                
                circle.addEventListener('mouseenter', (e) => showTooltip(e, `XP: ${d.xp.toLocaleString()}<br>Date: ${d.date.toLocaleDateString()}`));
                circle.addEventListener('mouseleave', hideTooltip);
                
                svg.appendChild(circle);
            });

            // Add axes
            const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            xAxis.setAttribute('x1', margin.left);
            xAxis.setAttribute('y1', height - margin.bottom);
            xAxis.setAttribute('x2', width - margin.right);
            xAxis.setAttribute('y2', height - margin.bottom);
            xAxis.setAttribute('stroke', '#e2e8f0');
            xAxis.setAttribute('stroke-width', '2');
            svg.appendChild(xAxis);

            const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            yAxis.setAttribute('x1', margin.left);
            yAxis.setAttribute('y1', margin.top);
            yAxis.setAttribute('x2', margin.left);
            yAxis.setAttribute('y2', height - margin.bottom);
            yAxis.setAttribute('stroke', '#e2e8f0');
            yAxis.setAttribute('stroke-width', '2');
            svg.appendChild(yAxis);
        }

        function createPieChart(progressData) {
            const svg = document.getElementById('pieChart');
            const width = 400;
            const height = 400;
            const radius = Math.min(width, height) / 2 - 20;
            const centerX = width / 2;
            const centerY = height / 2;

            svg.innerHTML = '';
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

            const passed = progressData.filter(d => d.grade === 1).length;
            const failed = progressData.filter(d => d.grade === 0).length;
            const total = passed + failed;

            if (total === 0) return;

            const passedAngle = (passed / total) * 360;
            const failedAngle = (failed / total) * 360;

            // Create pie slices
            const createSlice = (startAngle, endAngle, color, label, value) => {
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (endAngle - 90) * Math.PI / 180;
                
                const x1 = centerX + radius * Math.cos(startRad);
                const y1 = centerY + radius * Math.sin(startRad);
                const x2 = centerX + radius * Math.cos(endRad);
                const y2 = centerY + radius * Math.sin(endRad);
                
                const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                
                const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', color);
                path.setAttribute('filter', 'url(#shadow)');
                path.style.cursor = 'pointer';
                
                path.addEventListener('mouseenter', (e) => showTooltip(e, `${label}: ${value} (${((value/total)*100).toFixed(1)}%)`));
                path.addEventListener('mouseleave', hideTooltip);
                
                return path;
            };

            // Add slices
            if (passed > 0) {
                const passedSlice = createSlice(0, passedAngle, '#48bb78', 'Passed', passed);
                svg.appendChild(passedSlice);
            }
            
            if (failed > 0) {
                const failedSlice = createSlice(passedAngle, passedAngle + failedAngle, '#f56565', 'Failed', failed);
                svg.appendChild(failedSlice);
            }

            // Add legend
            const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            const passedRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            passedRect.setAttribute('x', width - 100);
            passedRect.setAttribute('y', 50);
            passedRect.setAttribute('width', 15);
            passedRect.setAttribute('height', 15);
            passedRect.setAttribute('fill', '#48bb78');
            legend.appendChild(passedRect);
            
            const passedText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            passedText.setAttribute('x', width - 80);
            passedText.setAttribute('y', 62);
            passedText.setAttribute('font-size', '14');
            passedText.setAttribute('fill', '#4a5568');
            passedText.textContent = `Passed (${passed})`;
            legend.appendChild(passedText);
            
            const failedRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            failedRect.setAttribute('x', width - 100);
            failedRect.setAttribute('y', 75);
            failedRect.setAttribute('width', 15);
            failedRect.setAttribute('height', 15);
            failedRect.setAttribute('fill', '#f56565');
            legend.appendChild(failedRect);
            
            const failedText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            failedText.setAttribute('x', width - 80);
            failedText.setAttribute('y', 87);
            failedText.setAttribute('font-size', '14');
            failedText.setAttribute('fill', '#4a5568');
            failedText.textContent = `Failed (${failed})`;
            legend.appendChild(failedText);
            
            svg.appendChild(legend);
        }

        // Tooltip Functions
        function showTooltip(event, content) {
            const tooltip = document.getElementById('tooltip');
            tooltip.innerHTML = content;
            tooltip.style.left = event.pageX + 10 + 'px';
            tooltip.style.top = event.pageY - 10 + 'px';
            tooltip.style.opacity = '1';
        }

        function hideTooltip() {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.opacity = '0';
        }

        // Main Functions
        async function loadDashboard() {
            try {
                // Fetch user data
                const userResult = await fetchUserData();
                document.getElementById('userLogin').textContent = `Welcome, ${userResult.user[0].login}!`;
                
                // Fetch and display XP data
                const xpResult = await fetchXPData();
                const totalXP = xpResult.transaction.reduce((sum, t) => sum + t.amount, 0);
                document.getElementById('totalXP').textContent = totalXP.toLocaleString();
                
                // Fetch and display progress data
                const progressResult = await fetchProgressData();
                const projectsCompleted = progressResult.progress.filter(p => p.grade === 1).length;
                document.getElementById('projectsCompleted').textContent = projectsCompleted;
                
                // Calculate audit ratio (simplified)
                const auditRatio = projectsCompleted > 0 ? ((projectsCompleted / progressResult.progress.length) * 100).toFixed(1) : 0;
                document.getElementById('auditRatio').textContent = `${auditRatio}%`;
                
                // Create charts
                createXPChart(xpResult.transaction);
                createPieChart(progressResult.progress);
                
            } catch (error) {
                console.error('Error loading dashboard:', error);
                showError('Failed to load dashboard data');
            }
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }

        function hideError() {
            errorMessage.style.display = 'none';
        }

        function logout() {
            authToken = null;
            loginContainer.style.display = 'flex';
            profileContainer.style.display = 'none';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            hideError();
        }

        // Event Listeners
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const credentials = encodeCredentials(username, password);
                authToken = await login(credentials);
                
                loginContainer.style.display = 'none';
                profileContainer.style.display = 'block';
                
                await loadDashboard();
            } catch (error) {
                showError(error.message);
            }
        });

        logoutBtn.addEventListener('click', logout);

        // Initialize
        console.log('GraphQL Profile Dashboard loaded');
    console.log('GraphQL Profile Dashboard loaded');
    console.log('Remember to replace ((DOMAIN)) with your actual school domain!');